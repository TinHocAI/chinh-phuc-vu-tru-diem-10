import json
import os
import re
import uuid
import random
from typing import Dict, Any, List, Optional
import io
import pypdf
import docx

class AIEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")

    def extract_text(self, filename: str, content: bytes) -> str:
        """Trích xuất nội dung văn bản từ các loại tài liệu khác nhau."""
        ext = filename.lower().split(".")[-1]
        text = ""

        try:
            if ext == "pdf":
                reader = pypdf.PdfReader(io.BytesIO(content))
                text_list = []
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text_list.append(extracted)
                text = "\n".join(text_list)
            elif ext in ["docx", "doc"]:
                doc = docx.Document(io.BytesIO(content))
                text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            else:
                text = content.decode("utf-8", errors="ignore")
        except Exception as e:
            text = f"Lỗi đọc nội dung file: {str(e)}"

        return text.strip()

    def generate_galaxy_from_document(
        self, 
        doc_name: str, 
        text_content: str, 
        api_key: Optional[str] = None,
        custom_subject: Optional[str] = None,
        grade: Optional[str] = "10",
        subject_code: Optional[str] = "Lịch Sử"
    ) -> Dict[str, Any]:
        """Tạo ra Hệ Sao mới gồm 10-15 câu hỏi trắc nghiệm chia theo 4 mức độ từ đề cương."""
        active_key = api_key or self.api_key

        if active_key and len(active_key) > 10:
            try:
                from google import genai
                client = genai.Client(api_key=active_key)

                prompt = f"""
Bạn là Trợ lý AI Cố vấn Học tập Không gian của trường THPT Bộc Bố trong game "Chinh Phục Vũ Trụ Điểm 10".
Nhiệm vụ của bạn là đọc kỹ nội dung Đề cương / Tài liệu học tập dưới đây, sau đó trích xuất và thiết kế một "Hệ Sao Kiến Thức" hoàn chỉnh cho Khối {grade}, Môn {subject_code}.

Nội dung tài liệu ({doc_name}):
---
{text_content[:8000]}
---

YÊU CẦU ĐẶC BIỆT:
1. Đặt tên Hệ Sao thật cuốn hút mang âm hưởng vũ trụ (ví dụ: "Hệ Sao Sóng Cơ & Ánh Sáng", "Hệ Sao Văn Minh Đại Việt").
2. Tạo từ 8 đến 12 Trạm Không Gian (câu hỏi trắc nghiệm) chuẩn ma trận 4 mức độ:
   - Nhận biết (NhanBiet - 40%): Câu hỏi định nghĩa, mốc thời gian, công thức cơ bản.
   - Thông hiểu (ThongHieu - 30%): Câu hỏi giải thích vì sao, mối liên hệ, hiểu bản chất.
   - Vận dụng (VanDung - 20%): Câu hỏi tính toán đơn giản, suy luận thực tế.
   - Vận dụng cao (VanDungCao - 10%): Câu hỏi tổng hợp, đánh giá, liên hệ nâng cao.
3. Mỗi trạm phải có "ai_hint" - Gợi ý theo phong cách Socratic (nêu định hướng, công thức hoặc từ khóa mấu chốt, TUYỆT ĐỐI KHÔNG nói toạc đáp án A, B, C hay D).
4. Tạo thêm 1 "Hố Đen Thử Thách" (Boss Final) tổng hợp kiến thức.

OUTPUT BẮT BUỘC CHỈ LÀ MỘT ĐOẠN JSON THUẦN TÚY (không kèm markdown ```json ... ``` hoặc giải thích thừa):
{{
  "name": "Tên Hệ Sao",
  "grade": "{grade}",
  "subject_code": "{subject_code}",
  "subject": "{subject_code} {grade}",
  "description": "Mô tả ngắn gọn về hành trình tri thức",
  "icon": "🪐",
  "theme_color": "#00f2fe",
  "stations": [
    {{
      "id": "STATION_01",
      "level": "NhanBiet",
      "title": "Tên Trạm Vũ Trụ",
      "question": "Nội dung câu hỏi trắc nghiệm?",
      "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
      "correct_answer": "A",
      "ai_hint": "Gợi ý tư duy Socratic không lộ đáp án",
      "exp_reward": 50,
      "coordinates": {{"x": 20, "y": 30}}
    }}
  ],
  "boss_blackhole": {{
    "id": "BOSS_CHALLENGE",
    "title": "Hố Đen Tổng Hợp Học Kỳ: {subject_code} {grade}",
    "curriculum": "Bộ Sách Giáo Khoa Kết Nối Tri Thức Với Cuộc Sống",
    "unlock_stars_required": 2,
    "time_limit_seconds": 360,
    "pass_percentage": 80,
    "bonus_exp": 500,
    "questions": [
      {{
        "id": "BH_01",
        "chapter": "Chương / Chủ đề trong SGK Kết Nối Tri Thức",
        "question": "Câu hỏi trắc nghiệm tổng hợp học kỳ?",
        "options": ["A. Lựa chọn 1", "B. Lựa chọn 2", "C. Lựa chọn 3", "D. Lựa chọn 4"],
        "correct_answer": "A",
        "explanation": "Trích dẫn giải thích chi tiết chuẩn theo bộ SGK Kết Nối Tri Thức Với Cuộc Sống."
      }}
    ]
  }}
}}
"""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                
                raw_text = response.text.strip()
                # Làm sạch markdown nếu có
                if raw_text.startswith("```"):
                    raw_text = re.sub(r"^```(?:json)?\n", "", raw_text)
                    raw_text = re.sub(r"\n```$", "", raw_text)

                data = json.loads(raw_text)
                data["id"] = f"GALAXY_{uuid.uuid4().hex[:8].upper()}"
                data["grade"] = grade or data.get("grade", "10")
                data["subject_code"] = subject_code or data.get("subject_code", "Chuyên Đề")
                
                # Cập nhật tọa độ phân bố đẹp mắt trên radar nếu Gemini sinh tọa độ trùng
                self._distribute_coordinates(data.get("stations", []))
                return data
            except Exception as e:
                print(f"[Gemini API fallback] Lỗi gọi Gemini: {e}. Chuyển sang Cosmic Generator tích hợp.")

        # Fallback Generator khi không có key hoặc key lỗi
        return self._generate_intelligent_fallback(doc_name, text_content, custom_subject, grade, subject_code)

    def _distribute_coordinates(self, stations: List[Dict[str, Any]]):
        """Phân bổ tọa độ ngẫu nhiên hài hòa cho các trạm trên bản đồ Anti-gravity."""
        n = len(stations)
        if n == 0:
            return
        
        # Sắp xếp thành hình cánh cung chòm sao
        step = 70 / max(1, n)
        for i, station in enumerate(stations):
            x = 15 + (i * step) + random.uniform(-4, 4)
            # Tạo đường lượn sóng sin
            y = 50 + 25 * (-1 if i % 2 == 0 else 1) * random.uniform(0.6, 1.1)
            station["coordinates"] = {
                "x": round(max(10, min(90, x)), 1),
                "y": round(max(15, min(85, y)), 1)
            }

    def _generate_intelligent_fallback(self, doc_name: str, text: str, custom_subject: Optional[str] = None, grade: Optional[str] = "10", subject_code: Optional[str] = "Lịch Sử") -> Dict[str, Any]:
        """Tự động phân tích các đoạn kiến thức trong tài liệu và sinh bộ trạm câu hỏi tương ứng."""
        clean_name = doc_name.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")
        subject = custom_subject or f"{subject_code} {grade}"

        # Tách các đoạn văn bản có ý nghĩa
        paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 20]
        
        station_levels = [
            ("NhanBiet", 50, "Trạm Khởi Động"),
            ("NhanBiet", 50, "Trạm Căn Cứ Radar"),
            ("ThongHieu", 75, "Trạm Phân Tích Dữ Liệu"),
            ("ThongHieu", 75, "Trạm Quỹ Đạo Vệ Tinh"),
            ("VanDung", 100, "Trạm Động Cơ Lượng Tử"),
            ("VanDung", 100, "Trạm Tinh Vân Biến Thiên"),
            ("VanDungCao", 150, "Trạm Lõi Năng Lượng"),
            ("VanDungCao", 150, "Trạm Cực Quang Vũ Trụ")
        ]

        stations = []
        for i, (level, exp, default_title) in enumerate(station_levels):
            snippet = paragraphs[i % len(paragraphs)] if paragraphs else f"Kiến thức trọng tâm số {i+1} trong đề cương {clean_name}"
            # Rút gọn snippet
            summary = snippet[:140] + ("..." if len(snippet) > 140 else "")

            if level == "NhanBiet":
                q_text = f"Theo nội dung tài liệu '{clean_name}', khái niệm hoặc đặc điểm chính nào sau đây là ĐÚNG về: \"{summary}\"?"
                opts = [
                    f"A. Phản ánh chính xác bản chất: {summary[:60]}",
                    f"B. Hoàn toàn không liên quan đến phạm vi bài học",
                    f"C. Chỉ áp dụng trong điều kiện ngoại cảnh đặc biệt",
                    f"D. Đã bị bác bỏ trong các nghiên cứu gần đây"
                ]
                ans = "A"
                hint = "Hãy đối chiếu lại định nghĩa và từ khóa cốt lõi xuất hiện ngay trong phần mở đầu tài liệu."
            elif level == "ThongHieu":
                q_text = f"Nguyên nhân cốt lõi hoặc ý nghĩa cơ bản được rút ra từ luận điểm: \"{summary}\" là gì?"
                opts = [
                    f"A. Do tính ngẫu nhiên của các yếu tố bên ngoài",
                    f"B. Thể hiện quy luật vận động và liên kết logic trong hệ thống kiến thức",
                    f"C. Nhằm giảm tải nội dung thực hành",
                    f"D. Không tạo ra bất kỳ tác động nào đáng kể"
                ]
                ans = "B"
                hint = "Hãy tìm mối liên hệ nhân quả giữa các đại lượng hoặc sự kiện được nhắc đến."
            elif level == "VanDung":
                q_text = f"Khi vận dụng kiến thức từ đề cương vào giải quyết một tình huống thực tiễn, phương án nào tối ưu nhất?"
                opts = [
                    f"A. Bỏ qua các bước kiểm tra giả thiết ban đầu",
                    f"B. Kết hợp lý thuyết vừa học với điều kiện thực tế để đưa ra giải pháp phù hợp",
                    f"C. Chỉ áp dụng công thức máy móc không xét tính tương thích",
                    f"D. Chờ đợi dữ liệu tuyệt đối chính xác mới hành động"
                ]
                ans = "B"
                hint = "Nhớ rằng vận dụng thực tế đòi hỏi sự linh hoạt và bám sát các điều kiện biên của bài toán."
            else:
                q_text = f"Đánh giá tổng hợp và phát triển tư duy nâng cao: Phát biểu nào sau đây thể hiện tầm nhìn sâu sắc nhất về chuyên đề '{clean_name}'?"
                opts = [
                    f"A. Kiến thức này đã đóng kín và không thể phát triển thêm",
                    f"B. Giúp định hình phương pháp luận tư duy khoa học và giải quyết các bài toán liên môn phức tạp",
                    f"C. Chỉ có giá trị làm bài kiểm tra tại lớp",
                    f"D. Hoàn toàn độc lập với các môn học khác"
                ]
                ans = "B"
                hint = "Câu hỏi mức độ vận dụng cao đòi hỏi khả năng liên hệ liên môn và tư duy phản biện đa chiều."

            stations.append({
                "id": f"STATION_{i+1:02d}",
                "level": level,
                "title": f"{default_title} #{i+1}",
                "question": q_text,
                "options": opts,
                "correct_answer": ans,
                "ai_hint": hint,
                "exp_reward": exp,
                "coordinates": {"x": 0, "y": 0}
            })

        self._distribute_coordinates(stations)

        galaxy_id = f"GALAXY_{uuid.uuid4().hex[:8].upper()}"
        return {
            "id": galaxy_id,
            "grade": grade or "10",
            "subject_code": subject_code or "Chuyên Đề",
            "name": f"Hệ Sao {clean_name.title()}",
            "subject": subject,
            "description": f"Chòm sao tri thức được tạo từ đề cương tài liệu '{doc_name}'. Vượt qua các trạm để làm chủ toàn bộ bài học!",
            "icon": "✨",
            "theme_color": "#722ed1",
            "stations": stations,
            "boss_blackhole": {
                "id": f"BOSS_{galaxy_id}",
                "title": f"Hố Đen Tổng Hợp: {clean_name.title()} ({subject})",
                "curriculum": "Bộ Sách Giáo Khoa Kết Nối Tri Thức Với Cuộc Sống",
                "unlock_stars_required": max(2, len(stations) - 2),
                "time_limit_seconds": 360,
                "pass_percentage": 80,
                "bonus_exp": 500,
                "questions": [
                    {
                        "id": f"BH_{s['id']}",
                        "chapter": f"Kiến thức trọng tâm SGK: {s['title']}",
                        "question": s["question"],
                        "options": s["options"],
                        "correct_answer": s["correct_answer"],
                        "explanation": f"Nội dung cốt lõi tổng hợp từ chuyên đề {clean_name} theo định hướng SGK Kết Nối Tri Thức Với Cuộc Sống."
                    } for s in stations[:6]
                ]
            }
        }

    def get_socratic_hint(self, question: str, options: List[str], current_hint: str, user_query: Optional[str] = None, api_key: Optional[str] = None) -> str:
        """Sinh lời khuyên định hướng AI (không đưa trực tiếp đáp án)."""
        active_key = api_key or self.api_key
        if active_key and len(active_key) > 10:
            try:
                from google import genai
                client = genai.Client(api_key=active_key)
                prompt = f"""
Bạn là NPC Trợ lý Phi hành gia thông minh trong game "Chinh Phục Vũ Trụ Điểm 10".
Người chơi đang gặp khó khăn trước câu hỏi trắc nghiệm sau:
Câu hỏi: {question}
Các lựa chọn:
{chr(10).join(options)}

YÊU CẦU QUAN TRỌNG:
- Trả lời bằng giọng điệu người bạn đồng hành ngoài không gian (hào hứng, động viên, gọi người chơi là "Chỉ huy" hoặc "Phi hành gia").
- Cung cấp gợi ý định hướng theo phương pháp Socratic (nhắc lại công thức, từ khóa then chốt hoặc phương pháp loại trừ).
- TUYỆT ĐỐI KHÔNG ĐƯA RA ĐÁP ÁN TRỰC TIẾP (không nói chọn A, B, C hay D).
- Ngắn gọn trong 2-3 câu, tối đa 80 từ.
"""
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                return response.text.strip()
            except Exception as e:
                print(f"[Gemini Hint Error]: {e}")

        # Fallback hint nếu không gọi được API
        greetings = [
            "🚀 Chỉ huy hãy bình tĩnh! Trợ lý AI đang quét dữ liệu:",
            "🛸 Cảm biến tàu nhận thấy manh mối quan trọng:",
            "🛰️ Tín hiệu gợi ý từ Trạm Không Gian Bộc Bố:"
        ]
        greet = random.choice(greetings)
        return f"{greet} {current_hint} Hãy dùng phương pháp loại trừ hai phương án bất hợp lý nhất trước nhé!"
