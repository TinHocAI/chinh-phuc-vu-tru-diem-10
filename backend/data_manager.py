import json
import os
import uuid
from typing import Dict, Any, List

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

USER_FILE = os.path.join(DATA_DIR, "user.json")
GALAXIES_FILE = os.path.join(DATA_DIR, "galaxies.json")
LEADERBOARD_FILE = os.path.join(DATA_DIR, "leaderboard.json")
GRADE11_BANKS_FILE = os.path.join(DATA_DIR, "grade11_banks.json")

DEFAULT_USER = {
    "id": "ASTRO_BOCBO_01",
    "name": "Nguyễn Văn An",
    "school": "THPT Bộc Bố",
    "grade": "11",
    "class_name": "11A1",
    "avatar": "boy_astronaut",
    "ship_name": "Sao Băng Bộc Bố 01",
    "level": 2,
    "exp": 450,
    "exp_to_next": 600,
    "oxy": 100,
    "streak": 7,
    "unlocked_badges": ["Tân Binh Không Gian", "Chỉ Huy Khối 11"],
    "completed_stations": ["M11_01", "P11_01"]
}

# Tải 30 câu hỏi chuẩn SGK Kết Nối Tri Thức cho từng môn Khối 11
def load_grade11_banks() -> Dict[str, List[Dict[str, Any]]]:
    if os.path.exists(GRADE11_BANKS_FILE):
        try:
            with open(GRADE11_BANKS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("Error loading grade11_banks.json:", e)
    return {}

GRADE11_BANKS = load_grade11_banks()

def build_default_galaxies() -> List[Dict[str, Any]]:
    galaxies = []

    # Meta cho 9 môn học Khối 11 (Mỗi môn 30 câu hỏi Hố Đen chuẩn SGK Kết Nối Tri Thức)
    k11_meta = [
        {
            "sub": "Toán Học",
            "id": "GALAXY_MATH_11",
            "name": "Hệ Sao Lượng Giác & Đạo Hàm 11",
            "desc": "Khám phá hàm số lượng giác, cấp số cộng/nhân và phép tính vi phân đạo hàm.",
            "icon": "📐",
            "color": "#1890ff",
            "stations": [
                {"id": "M11_01", "level": "NhanBiet", "title": "Trạm Hàm Số Lượng Giác", "question": "Chu kỳ tuần hoàn T của hàm số y = sin(x) là:", "options": ["A. 2.pi", "B. pi", "C. pi/2", "D. 4.pi"], "correct_answer": "A", "ai_hint": "Chu kỳ của sin(x) là 2.pi.", "exp_reward": 50, "coordinates": {"x": 25, "y": 35}},
                {"id": "M11_02", "level": "ThongHieu", "title": "Trạm Cấp Số Nhân", "question": "Cho cấp số nhân có u1 = 2 và công bội q = 3. Số hạng u3 là:", "options": ["A. 18", "B. 12", "C. 54", "D. 6"], "correct_answer": "A", "ai_hint": "u3 = u1 * q^2 = 2 * 9 = 18.", "exp_reward": 75, "coordinates": {"x": 55, "y": 45}},
                {"id": "M11_03", "level": "VanDung", "title": "Trạm Tiếp Tuyến Đồ Thị", "question": "Hệ số góc k của tiếp tuyến hàm số y = x^3 - 3x tại x0 = 2 là:", "options": ["A. 9", "B. 6", "C. 12", "D. 3"], "correct_answer": "A", "ai_hint": "y' = 3x^2 - 3. Thay x=2: 3*4 - 3 = 9.", "exp_reward": 100, "coordinates": {"x": 80, "y": 65}}
            ]
        },
        {
            "sub": "Vật Lý",
            "id": "GALAXY_PHYS_11",
            "name": "Hệ Sao Dao Động & Sóng Điện Từ 11",
            "desc": "Thám hiểm không gian dao động cơ, giao thoa sóng và định luật điện từ trường.",
            "icon": "⚡",
            "color": "#faad14",
            "stations": [
                {"id": "P11_01", "level": "NhanBiet", "title": "Trạm Gia Tốc Dao Động", "question": "Trong dao động điều hòa, gia tốc a của vật:", "options": ["A. Ngược pha với li độ x (a = -omega^2 * x)", "B. Cùng pha với li độ", "C. Vuông pha trễ hơn", "D. Luôn không đổi"], "correct_answer": "A", "ai_hint": "a = -omega^2 * x ngược pha với x.", "exp_reward": 50, "coordinates": {"x": 28, "y": 40}},
                {"id": "P11_02", "level": "VanDung", "title": "Trạm Giao Thoa Sóng", "question": "Khoảng vân i trong thí nghiệm Young giao thoa ánh sáng được tính bởi:", "options": ["A. i = lambda * D / a", "B. i = lambda * a / D", "C. i = a * D / lambda", "D. i = lambda * D * a"], "correct_answer": "A", "ai_hint": "Khoảng cách giữa hai vân sáng liên tiếp là i = lambda * D / a.", "exp_reward": 80, "coordinates": {"x": 65, "y": 55}}
            ]
        },
        {
            "sub": "Hóa Học",
            "id": "GALAXY_CHEM_11",
            "name": "Hệ Sao Cân Bằng & Hóa Hữu Cơ 11",
            "desc": "Làm chủ thuyết acid - base Brønsted, hợp chất Nitrogen và dẫn xuất hydrocarbon.",
            "icon": "🧪",
            "color": "#00f2fe",
            "stations": [
                {"id": "C11_01", "level": "NhanBiet", "title": "Trạm Thuyết Acid-Base", "question": "Theo thuyết Brønsted - Lowry, acid là chất:", "options": ["A. Có khả năng cho proton (H+)", "B. Có khả năng nhận proton", "C. Phân li ra OH-", "D. Chứa kim loại"], "correct_answer": "A", "ai_hint": "Acid cho H+, base nhận H+.", "exp_reward": 50, "coordinates": {"x": 30, "y": 35}},
                {"id": "C11_02", "level": "VanDung", "title": "Trạm Khí Mưa Acid", "question": "Khí nào sau đây là nguyên nhân chủ yếu gây ra hiện tượng mưa acid?", "options": ["A. SO2 và NOx", "B. CO2 và CH4", "C. N2 và O2", "D. H2 và He"], "correct_answer": "A", "ai_hint": "Oxide của S và N tạo mưa acid.", "exp_reward": 80, "coordinates": {"x": 70, "y": 60}}
            ]
        },
        {
            "sub": "Sinh Học",
            "id": "GALAXY_BIO_11",
            "name": "Hệ Sao Chuyển Hóa Sinh Giới 11",
            "desc": "Khám phá sinh lý học thực vật và động vật, hệ tuần hoàn và hệ thần kinh cảm ứng.",
            "icon": "🧬",
            "color": "#52c41a",
            "stations": [
                {"id": "B11_01", "level": "NhanBiet", "title": "Trạm Dòng Mạch Rây", "question": "Dòng mạch rây (phloem) trong cây vận chuyển chủ yếu chất nào sau đây?", "options": ["A. Các chất hữu cơ (sucrose, amino acid...) từ lá đến các cơ quan", "B. Nước và ion khoáng từ rễ lên lá", "C. Khí oxy", "D. Độc tố"], "correct_answer": "A", "ai_hint": "Mạch rây dẫn sản phẩm quang hợp từ lá.", "exp_reward": 50, "coordinates": {"x": 30, "y": 40}}
            ]
        },
        {
            "sub": "Tin Học",
            "id": "GALAXY_CS_11",
            "name": "Hệ Sao Cơ Sở Dữ Liệu & SQL 11",
            "desc": "Làm chủ hệ cơ sở dữ liệu quan hệ, thiết kế khóa chính và ngôn ngữ truy vấn SQL.",
            "icon": "💻",
            "color": "#00f076",
            "stations": [
                {"id": "CS11_01", "level": "NhanBiet", "title": "Trạm Khái Niệm CSDL", "question": "Tập hợp dữ liệu có liên quan logic với nhau, được tổ chức có cấu trúc gọi là:", "options": ["A. Cơ sở dữ liệu (Database)", "B. Tệp văn bản", "C. Trình biên dịch", "D. Thiết bị mạng"], "correct_answer": "A", "ai_hint": "Khái niệm CSDL.", "exp_reward": 50, "coordinates": {"x": 28, "y": 45}}
            ]
        },
        {
            "sub": "Lịch Sử",
            "id": "GALAXY_HIS_11",
            "name": "Hệ Sao Lịch Sử Cận Hiện Đại 11",
            "desc": "Chinh phục các cuộc cách mạng tư sản, Cách mạng tháng Mười và bảo vệ chủ quyền Biển Đông.",
            "icon": "📜",
            "color": "#ff4d4f",
            "stations": [
                {"id": "H11_01", "level": "NhanBiet", "title": "Trạm Tuyên Ngôn Độc Lập Mỹ 1776", "question": "Bản Tuyên ngôn Độc lập của Hợp chúng quốc Mỹ được công bố vào ngày nào?", "options": ["A. 4/7/1776", "B. 14/7/1789", "C. 2/9/1945", "D. 1/5/1886"], "correct_answer": "A", "ai_hint": "Ngày 4 tháng 7 năm 1776.", "exp_reward": 50, "coordinates": {"x": 30, "y": 40}}
            ]
        },
        {
            "sub": "Địa Lý",
            "id": "GALAXY_GEO_11",
            "name": "Hệ Sao Kinh Tế Toàn Cầu & ASEAN 11",
            "desc": "Khám phá địa lý kinh tế xã hội thế giới, Hoa Kỳ, Liên minh châu Âu và khối ASEAN.",
            "icon": "🌍",
            "color": "#13c2c2",
            "stations": [
                {"id": "G11_01", "level": "NhanBiet", "title": "Trạm Toàn Cầu Hóa", "question": "Tổ chức thương mại lớn nhất hành tinh điều tiết tự do hóa thương mại là:", "options": ["A. WTO", "B. UNESCO", "C. WHO", "D. UNICEF"], "correct_answer": "A", "ai_hint": "Tổ chức Thương mại Thế giới WTO.", "exp_reward": 50, "coordinates": {"x": 32, "y": 42}}
            ]
        },
        {
            "sub": "Ngữ Văn",
            "id": "GALAXY_LIT_11",
            "name": "Hệ Sao Văn Học & Nghệ Thuật Ngôn Từ 11",
            "desc": "Thám hiểm thế giới văn xuôi tự sự, thơ trữ tình Thơ mới và nghệ thuật tùy bút tài hoa.",
            "icon": "📖",
            "color": "#eb2f96",
            "stations": [
                {"id": "L11_01", "level": "NhanBiet", "title": "Trạm Thơ Mới 1932 - 1945", "question": "Nhà thơ nào được mệnh danh là 'nhà thơ mới nhất trong các nhà thơ mới'?", "options": ["A. Xuân Diệu", "B. Huy Cận", "C. Hàn Mặc Tử", "D. Chế Lan Viên"], "correct_answer": "A", "ai_hint": "Nhà thơ của tình yêu và tuổi trẻ Xuân Diệu.", "exp_reward": 50, "coordinates": {"x": 35, "y": 45}}
            ]
        },
        {
            "sub": "Tiếng Anh",
            "id": "GALAXY_ENG_11",
            "name": "Hệ Sao English 11 Global Success",
            "desc": "Chinh phục từ vựng và ngữ pháp tiếng Anh chuẩn bộ SGK Global Success Kết Nối Tri Thức.",
            "icon": "🌐",
            "color": "#fa8c16",
            "stations": [
                {"id": "E11_01", "level": "NhanBiet", "title": "Trạm Vocabulary Unit 1", "question": "The noun form of the adjective 'healthy' is:", "options": ["A. health", "B. healthily", "C. healthiness", "D. healthful"], "correct_answer": "A", "ai_hint": "Health (sức khỏe).", "exp_reward": 50, "coordinates": {"x": 30, "y": 40}}
            ]
        }
    ]

    for item in k11_meta:
        sub_name = item["sub"]
        boss_questions = GRADE11_BANKS.get(sub_name, [])

        galaxies.append({
            "id": item["id"],
            "grade": "11",
            "subject_code": sub_name,
            "name": item["name"],
            "subject": f"{sub_name} 11 (Kết Nối Tri Thức)",
            "description": item["desc"],
            "icon": item["icon"],
            "theme_color": item["color"],
            "stations": item["stations"],
            "boss_blackhole": {
                "id": f"BOSS_{item['id']}",
                "title": f"Hố Đen 30 Câu Tổng Hợp: {sub_name} 11",
                "curriculum": f"SGK {sub_name} 11 - Kết Nối Tri Thức Với Cuộc Sống (Trọn Vẹn 30 Câu)",
                "unlock_stars_required": 1,
                "time_limit_seconds": 900,  # 15 phút cho 30 câu
                "pass_percentage": 80,
                "bonus_exp": 1000,
                "questions": boss_questions
            }
        })

    # Thêm Khối 10 để học sinh khối 10 vẫn chơi được
    galaxies.append({
        "id": "GALAXY_HIS_10",
        "grade": "10",
        "subject_code": "Lịch Sử",
        "name": "Hệ Sao Điện Biên Phủ 10",
        "subject": "Lịch Sử 10 (Kết Nối Tri Thức)",
        "description": "Chinh phục các mốc son lịch sử hào hùng của chiến dịch Điện Biên Phủ 1954.",
        "icon": "📜",
        "theme_color": "#ff4d4f",
        "stations": [
            {
                "id": "HIS_01",
                "level": "NhanBiet",
                "title": "Trạm Căn Cứ Khởi Đầu",
                "question": "Chiến dịch Điện Biên Phủ diễn ra vào năm nào và dưới sự chỉ huy trực tiếp của vị Đại tướng nào?",
                "options": [
                    "A. 1945 - Đại tướng Văn Tiến Dũng",
                    "B. 1954 - Đại tướng Võ Nguyên Giáp",
                    "C. 1975 - Đại tướng Chu Huy Mân",
                    "D. 1950 - Đại tướng Hoàng Văn Thái"
                ],
                "correct_answer": "B",
                "ai_hint": "Vị tướng tài ba này từng là người thầy giáo dạy sử và chiến dịch diễn ra vào mùa xuân năm 1954.",
                "exp_reward": 50,
                "coordinates": {"x": 22, "y": 35}
            }
        ],
        "boss_blackhole": {
            "id": "BOSS_HIS_10",
            "title": "Hố Đen Thử Thách Lịch Sử 10",
            "curriculum": "Bộ Sách Giáo Khoa Kết Nối Tri Thức Với Cuộc Sống",
            "unlock_stars_required": 1,
            "time_limit_seconds": 360,
            "pass_percentage": 80,
            "bonus_exp": 500,
            "questions": GRADE11_BANKS.get("Lịch Sử", [])[:10]
        }
    })

    return galaxies

DEFAULT_GALAXIES = build_default_galaxies()

DEFAULT_LEADERBOARD = [
    {"rank": 1, "name": "Hoàng Thị Mai", "class_name": "11A1", "ship": "Phượng Hoàng Lửa Bộc Bố", "score": 2850, "streak": 14, "badge": "Chỉ huy Hạm đội ⭐⭐⭐"},
    {"rank": 2, "name": "Triệu Đức Nam", "class_name": "12A2", "ship": "Hải Âu Phương Bắc", "score": 2640, "streak": 12, "badge": "Chỉ huy Hạm đội ⭐⭐"},
    {"rank": 3, "name": "Nông Văn Khang", "class_name": "10A1", "ship": "Sao Băng Bộc Bố 01", "score": 2390, "streak": 9, "badge": "Chỉ huy Hạm đội ⭐"},
    {"rank": 4, "name": "Đặng Thu Thảo", "class_name": "10A3", "ship": "Vệ Tinh Xanh", "score": 2180, "streak": 8, "badge": "Phi công Tiên phong"},
    {"rank": 5, "name": "Lê Quốc Bảo", "class_name": "11A2", "ship": "Kỷ Nguyên Số", "score": 1950, "streak": 7, "badge": "Phi công Cấp cao"},
    {"rank": 6, "name": "Bàn Thị Tuyết", "class_name": "10A2", "ship": "Hoa Hướng Dương", "score": 1820, "streak": 6, "badge": "Thám hiểm Gia"},
    {"rank": 7, "name": "Ma Phúc Hưng", "class_name": "12A1", "ship": "Sấm Sét Rừng Xanh", "score": 1710, "streak": 5, "badge": "Thám hiểm Gia"},
    {"rank": 8, "name": "Dương Thùy Linh", "class_name": "11A3", "ship": "Ánh Sao Ba Bể", "score": 1590, "streak": 5, "badge": "Tân Binh Cần mẫn"},
    {"rank": 9, "name": "Hoàng Minh Quân", "class_name": "10A1", "ship": "Chiến Mã Pác Nặm", "score": 1480, "streak": 4, "badge": "Tân Binh Cần mẫn"},
    {"rank": 10, "name": "La Văn Tuấn", "class_name": "10A4", "ship": "Đại Bàng Bộc Bố", "score": 1390, "streak": 4, "badge": "Tân Binh Cần mẫn"}
]

class DataManager:
    @staticmethod
    def get_user() -> Dict[str, Any]:
        if not os.path.exists(USER_FILE):
            DataManager.save_user(DEFAULT_USER)
            return DEFAULT_USER.copy()
        with open(USER_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def save_user(user: Dict[str, Any]):
        with open(USER_FILE, "w", encoding="utf-8") as f:
            json.dump(user, f, ensure_ascii=False, indent=2)

    @staticmethod
    def get_galaxies() -> List[Dict[str, Any]]:
        if not os.path.exists(GALAXIES_FILE):
            galaxies = build_default_galaxies()
            DataManager.save_galaxies(galaxies)
            return galaxies
        with open(GALAXIES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def save_galaxies(galaxies: List[Dict[str, Any]]):
        with open(GALAXIES_FILE, "w", encoding="utf-8") as f:
            json.dump(galaxies, f, ensure_ascii=False, indent=2)

    @staticmethod
    def add_galaxy(galaxy: Dict[str, Any]) -> Dict[str, Any]:
        galaxies = DataManager.get_galaxies()
        galaxies.insert(0, galaxy)
        DataManager.save_galaxies(galaxies)
        return galaxy

    @staticmethod
    def get_leaderboard() -> List[Dict[str, Any]]:
        if not os.path.exists(LEADERBOARD_FILE):
            DataManager.save_leaderboard(DEFAULT_LEADERBOARD)
            return [l.copy() for l in DEFAULT_LEADERBOARD]
        with open(LEADERBOARD_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def save_leaderboard(lb: List[Dict[str, Any]]):
        with open(LEADERBOARD_FILE, "w", encoding="utf-8") as f:
            json.dump(lb, f, ensure_ascii=False, indent=2)
