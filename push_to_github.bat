@echo off
chcp 65001 > nul
title Đồng Bộ Dữ Liệu Lên GitHub - CLB AI THPT Bộc Bố
color 0b

echo ========================================================
echo   CHINH PHỤC VŨ TRỤ ĐIỂM 10 - CLB AI THPT BỘC BỐ
echo       TỰ ĐỘNG ĐỒNG BỘ DỮ LIỆU LÊN GITHUB 1-CLICK
echo ========================================================
echo.
echo Repo liên kết: https://github.com/TinHocAI/chinh-phuc-vu-tru-diem-10
echo.

set /p MSG="Nhập mô tả cập nhật (hoặc nhấn Enter để dùng mặc định): "
if "%MSG%"=="" set MSG=Cap nhat du lieu va noi dung game moi nhat

echo.
echo [1/3] Đang ghi nhận các thay đổi dữ liệu mới...
git add .

echo [2/3] Đang đóng gói bản cập nhật...
git commit -m "%MSG%"

echo [3/3] Đang đẩy lên GitHub...
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    color 0a
    echo ========================================================
    echo   THANH CONG! DU LIEU DA DUOC DONG BO LEN GITHUB.
    echo   Xem tai: https://github.com/TinHocAI/chinh-phuc-vu-tru-diem-10
    echo ========================================================
) else (
    color 0c
    echo Co loi xay ra trong qua trinh dong bo. Vui long kiem tra ket noi mang.
)

echo.
pause
