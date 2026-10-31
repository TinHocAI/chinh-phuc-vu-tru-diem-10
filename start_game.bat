@echo off
title Chinh Phuc Vu Tru Diem 10 - THPT Boc Bo
echo ========================================================
echo   CHINH PHUC VU TRU DIEM 10 - CLB AI & NANG LUC SO
echo               TRUONG THPT BOC BO
echo ========================================================
echo.
echo Dang khoi dong may chu khong gian...
py -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
pause
