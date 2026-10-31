@echo off
chcp 65001 > nul
title Day code len GitHub - THPT Boc Bo
echo ========================================================
echo   CHINH PHỤC VŨ TRỤ ĐIỂM 10 - CLB AI THPT BỘC BỐ
echo           ĐẨY DỰ ÁN LÊN GITHUB TỰ ĐỘNG
echo ========================================================
echo.
echo Bước 1: Hãy truy cập https://github.com/new và tạo 1 Repository mới.
echo Bước 2: Copy link Repository dạng: https://github.com/username/ten-repo.git
echo.
set /p REPO_URL="Dán link GitHub của bạn vào đây rồi bấm Enter: "

if "%REPO_URL%"=="" (
    echo Chưa nhập link. Quá trình hủy bỏ.
    pause
    exit /b
)

echo.
echo Đang kết nối tới GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo Đang đẩy mã nguồn lên nhánh main...
git push -u origin main

echo.
echo Hoàn tất! Mã nguồn đã được đưa lên GitHub thành công.
pause
