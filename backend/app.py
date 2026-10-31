import os
import shutil
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .data_manager import DataManager
from .ai_engine import AIEngine

app = FastAPI(title="Chinh Phục Vũ Trụ Điểm 10 - API Engine", version="1.0.0")

# Cấu hình CORS để frontend tương tác trơn tru
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_engine = AIEngine()

# Schemas
class LoginRequest(BaseModel):
    sso_provider: str = "vnEdu"  # "vnEdu" | "OLM"
    student_id: Optional[str] = "HS_BOCBO_2026"
    student_name: Optional[str] = "Nguyễn Văn An"
    class_name: Optional[str] = "10A1"

class ProfileUpdateRequest(BaseModel):
    avatar: str
    ship_name: str

class AnswerRequest(BaseModel):
    galaxy_id: str
    station_id: str
    selected_option: str  # "A", "B", "C", "D"

class HintRequest(BaseModel):
    question: str
    options: List[str]
    current_hint: str
    api_key: Optional[str] = None

class BossSubmitRequest(BaseModel):
    galaxy_id: str
    score: int
    total: int
    time_spent: int

# --- API Routes ---

@app.get("/api/user")
def get_user_profile():
    return DataManager.get_user()

@app.post("/api/user/login")
def login_sso(req: LoginRequest):
    """Giả lập đăng nhập SSO đồng bộ từ vnEdu hoặc OLM."""
    user = DataManager.get_user()
    user["name"] = req.student_name or user["name"]
    user["class_name"] = req.class_name or user["class_name"]
    user["sso_linked"] = req.sso_provider
    DataManager.save_user(user)
    return {
        "status": "success",
        "message": f"Đã kết nối tài khoản thành công qua {req.sso_provider}!",
        "user": user
    }

@app.post("/api/user/profile")
def update_profile(req: ProfileUpdateRequest):
    """Cập nhật Định danh Phi hành gia (Avatar + Tên phi thuyền)."""
    user = DataManager.get_user()
    user["avatar"] = req.avatar
    user["ship_name"] = req.ship_name
    DataManager.save_user(user)
    return {"status": "success", "user": user}

@app.get("/api/galaxies")
def get_galaxies():
    """Lấy danh sách các Hệ Sao và các Trạm trôi nổi trên Bản đồ Anti-gravity."""
    return DataManager.get_galaxies()

@app.post("/api/reactor/upload")
async def reactor_upload(
    file: UploadFile = File(...),
    subject: Optional[str] = Form("Chuyên Đề Học Tập 10"),
    grade: Optional[str] = Form("10"),
    subject_code: Optional[str] = Form("Lịch Sử"),
    api_key: Optional[str] = Form(None)
):
    """
    Cơ chế 'Lò Phản Ứng':
    - Tiếp nhận file (.docx, .pdf, .txt)
    - Trích xuất văn bản
    - Gửi Gemini API để sinh chòm sao mới (hoặc dùng fallback generator nếu chưa cấu hình key)
    """
    allowed_exts = ["pdf", "docx", "doc", "txt"]
    ext = file.filename.split(".")[-1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Hệ thống chỉ hỗ trợ file {', '.join(allowed_exts)}")

    content = await file.read()
    extracted_text = ai_engine.extract_text(file.filename, content)
    
    if not extracted_text or len(extracted_text) < 15:
        raise HTTPException(status_code=400, detail="Không thể đọc được văn bản trong tài liệu hoặc file rỗng.")

    # Tạo Hệ Sao
    new_galaxy = ai_engine.generate_galaxy_from_document(
        doc_name=file.filename,
        text_content=extracted_text,
        api_key=api_key,
        custom_subject=subject,
        grade=grade,
        subject_code=subject_code
    )

    saved_galaxy = DataManager.add_galaxy(new_galaxy)
    return {
        "status": "success",
        "message": f"Lò phản ứng đã tổng hợp thành công {len(saved_galaxy['stations'])} Trạm không gian mới!",
        "galaxy": saved_galaxy
    }

@app.post("/api/station/answer")
def check_station_answer(req: AnswerRequest):
    """Xử lý nộp đáp án cho 1 Trạm Không Gian."""
    galaxies = DataManager.get_galaxies()
    galaxy = next((g for g in galaxies if g["id"] == req.galaxy_id), None)
    if not galaxy:
        raise HTTPException(status_code=404, detail="Không tìm thấy Hệ Sao.")

    station = next((s for s in galaxy["stations"] if s["id"] == req.station_id), None)
    if not station:
        raise HTTPException(status_code=404, detail="Không tìm thấy Trạm không gian.")

    user = DataManager.get_user()
    is_correct = (req.selected_option.strip().upper() == station["correct_answer"].strip().upper())

    exp_gained = 0
    oxy_delta = 0

    if is_correct:
        exp_gained = station["exp_reward"]
        oxy_delta = +10
        user["exp"] += exp_gained
        user["oxy"] = min(100, user["oxy"] + oxy_delta)
        
        # Đánh dấu trạm đã hoàn thành
        if req.station_id not in user["completed_stations"]:
            user["completed_stations"].append(req.station_id)

        # Cấp độ tăng lên khi đủ EXP
        while user["exp"] >= user["exp_to_next"]:
            user["level"] += 1
            user["exp"] -= user["exp_to_next"]
            user["exp_to_next"] = int(user["exp_to_next"] * 1.5)
            user["unlocked_badges"].append(f"Chỉ Huy Cấp {user['level']}")
    else:
        # Trả lời sai trừ thanh Oxy
        oxy_delta = -15
        user["oxy"] = max(0, user["oxy"] + oxy_delta)

    DataManager.save_user(user)

    return {
        "is_correct": is_correct,
        "correct_answer": station["correct_answer"],
        "exp_gained": exp_gained,
        "oxy_delta": oxy_delta,
        "current_oxy": user["oxy"],
        "current_level": user["level"],
        "current_exp": user["exp"],
        "exp_to_next": user["exp_to_next"],
        "completed_stations": user["completed_stations"]
    }

@app.post("/api/station/hint")
def request_ai_hint(req: HintRequest):
    """Nút 'Cứu viện AI': Trả về gợi ý định hướng Socratic, không lộ đáp án."""
    hint = ai_engine.get_socratic_hint(
        question=req.question,
        options=req.options,
        current_hint=req.current_hint,
        api_key=req.api_key
    )
    return {"hint": hint}

@app.get("/api/leaderboard")
def get_leaderboard():
    """Bảng xếp hạng toàn trường THPT Bộc Bố."""
    return DataManager.get_leaderboard()

@app.post("/api/boss/submit")
def submit_boss_challenge(req: BossSubmitRequest):
    """Nộp kết quả bài thi Hố Đen Cuối Kỳ - SGK Kết Nối Tri Thức."""
    user = DataManager.get_user()
    is_passed = (req.score >= req.total * 0.8)

    if is_passed:
        bonus_exp = req.score * 70 + 150  # ~500 EXP
        user["exp"] += bonus_exp
        user["oxy"] = 100  # Nạp đầy bình năng lượng khi chiến thắng

        badge = f"Kẻ Chinh Phục Hố Đen ({req.galaxy_id})"
        if badge not in user["unlocked_badges"]:
            user["unlocked_badges"].append(badge)
            user["unlocked_badges"].append("Bậc Thầy SGK Kết Nối Tri Thức")

        # Check level up
        while user["exp"] >= user["exp_to_next"]:
            user["level"] += 1
            user["exp"] -= user["exp_to_next"]
            user["exp_to_next"] = int(user["exp_to_next"] * 1.5)
    else:
        bonus_exp = req.score * 20
        user["exp"] += bonus_exp
        user["oxy"] = max(15, user["oxy"] - 25)

    DataManager.save_user(user)

    return {
        "status": "success",
        "bonus_exp": bonus_exp,
        "passed": is_passed,
        "user": user
    }

# Phục vụ Frontend tĩnh
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
