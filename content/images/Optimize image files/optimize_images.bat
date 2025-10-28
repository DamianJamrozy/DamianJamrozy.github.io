@echo off
chcp 65001 >nul
echo ==== KONWERSJA OBRAZÓW (WEBP/AVIF) ====

:: Sprawdzenie ImageMagick
where magick >nul 2>nul
if errorlevel 1 (
  echo [BŁĄD] Nie znaleziono "magick".
  echo Zainstaluj ImageMagick i dodaj do PATH:
  echo https://imagemagick.org/script/download.php
  pause
  exit /b
)

set "src=."
set "out=optimized"
if not exist "%out%" mkdir "%out%"

for %%F in ("%src%\*.jpg" "%src%\*.png" "%src%\*.avif") do (
  echo Przetwarzanie %%~nxF ...
  for %%S in (400 600 800 1200 1600) do (
    magick "%%F" -resize %%Sx%%S^ -quality 82 "%out%\%%~nF-%%S.webp"
    magick "%%F" -resize %%Sx%%S^ -quality 48 "%out%\%%~nF-%%S.avif"
  )
)

echo.
echo ==== ZAKOŃCZONO! ====
echo Pliki zapisane w folderze: "%out%"
pause
