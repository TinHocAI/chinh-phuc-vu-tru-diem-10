# 🚀 Chinh Phục Vũ Trụ Điểm 10
**Dự án EdTech & Gamification của CLB AI & Năng Lực Số — Trường THPT Bộc Bố**

---

## 🌟 Giới Thiệu
Game **"Chinh Phục Vũ Trụ Điểm 10"** là nền tảng học tập thông minh ứng dụng công nghệ Trí tuệ nhân tạo (Google Gemini API) và cơ chế Gamification du hành vũ trụ. Hệ thống giúp học sinh trường THPT Bộc Bố biến các tập đề cương ôn tập môn học khô khan thành những hành trình thám hiểm vũ trụ không trọng lực kỳ thú.

---

## 🛰️ Luồng Trải Nghiệm 5 Giai Đoạn (User Flow)

1. **Giai đoạn 1: Khởi động & Nhập vai (Onboarding)**
   - Đăng nhập liền mạch (giả lập / liên kết SSO vnEdu & OLM của trường THPT Bộc Bố).
   - Định danh Phi hành gia (chọn Avatar Nam sinh / Nữ sinh, đặt tên Phi thuyền).
   - Trợ lý AI đón tiếp (NPC ảo hướng dẫn 3 khung thoại ngắn gọn).

2. **Giai đoạn 2: Trạm Không Gian Trung Tâm (Main Hub - Buồng Lái)**
   - Hiển thị Cấp độ (Level), Điểm kinh nghiệm (EXP), Thanh năng lượng Oxy (100%), Chuỗi ngày học liên tục (Streak 🔥).
   - 3 Phím điều khiển lớn: *Bản đồ Sao*, *Lò phản ứng Dữ liệu*, *Bảng xếp hạng*.

3. **Giai đoạn 3: Cơ chế "Lò Phản Ứng" - Xử Lý Tài Liệu (AI Document Processing)**
   - Tải lên đề cương (.docx, .pdf, .txt) hoặc thử nghiệm đề cương mẫu có sẵn.
   - Trích xuất văn bản và gửi Prompt đến **Gemini API** để phân loại thành 4 mức độ:
     * **Nhận biết** (40% - 50 EXP)
     * **Thông hiểu** (30% - 75 EXP)
     * **Vận dụng** (20% - 100 EXP)
     * **Vận dụng cao** (10% - 150 EXP)
   - Tự động gieo thành một chòm sao mới trên bản đồ Anti-gravity.

4. **Giai đoạn 4: Tiến Vào Vũ Trụ & Lối Chơi Cốt Lõi (Core Gameplay)**
   - **Bản đồ Anti-gravity**: Hiệu ứng không trọng lực trôi nổi bồng bềnh, đường liên kết chòm sao, hạt vũ trụ phản xạ với chuột.
   - **Đấu trường trắc nghiệm**: Đếm ngược 30 giây kịch tính, âm thanh radar tíc tắc.
   - **Cứu viện AI**: Bấm nút "Gọi cứu viện AI", trợ lý đưa ra gợi ý tư duy Socratic (công thức, từ khóa then chốt), không lộ đáp án trực tiếp.
   - Trả lời đúng: EXP tăng, nạp lại Oxy (+10%). Trả lời sai: trừ năng lượng (-15%).

5. **Giai đoạn 5: Vượt Ải Boss Hố Đen & Vinh Danh (Endgame & Social)**
   - **Hố Đen Giữa kỳ / Cuối kỳ**: Cần giải mã tối thiểu 80% số sao vệ tinh để mở khóa khiên chắn, bài thi tính giờ nghiêm ngặt.
   - **Bảng vàng vinh danh**: Top 10 Chỉ huy Hạm đội THPT Bộc Bố nhận danh hiệu và vinh danh tuần.

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu:
- Python 3.10+ (Đã cài sẵn trong máy)

### Cách khởi chạy nhanh:
1. Nhấp đúp chuột vào file `start_game.bat`  
   *hoặc* chạy lệnh trong terminal:
   ```bash
   py run.py
   ```
2. Trình duyệt sẽ tự động mở địa chỉ:
   ```
   http://127.0.0.1:8000
   ```

---

## 👥 Bảng Phân Chia Công Việc Cho CLB AI & Năng Lực Số

| Nhóm | Nhiệm vụ chính | Thư mục phụ trách |
|---|---|---|
| **Frontend & UI/UX** | Hoàn thiện giao diện buồng lái, thêm hiệu ứng hạt Canvas, âm thanh | `frontend/` |
| **Backend & AI Engine** | Tối ưu prompt Gemini API, kết nối OCR nhận dạng ảnh đề cương | `backend/ai_engine.py`, `backend/app.py` |
| **Data & Auth** | Đồng bộ CSDL học sinh trường THPT Bộc Bố, lưu tiến độ | `backend/data_manager.py` |
| **Content & Game Design** | Soạn đề cương mẫu các môn (Toán, Lý, Hóa, Văn, Sử, Địa 10) | `backend/data/` |
