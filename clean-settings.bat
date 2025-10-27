@echo off
echo Cleaning settings.json...

echo {> settings.json
echo   "app_id": "",>> settings.json
echo   "app_secret": "",>> settings.json
echo   "modelscope_api_key": "",>> settings.json
echo   "modelscope_enabled": false,>> settings.json
echo   "modelscope_model": "">> settings.json
echo }>> settings.json

echo settings.json has been cleaned.
pause
