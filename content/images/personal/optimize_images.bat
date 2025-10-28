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

:: USTAWIENIA JAKOŚCI (możesz podnieść/obniżyć)
set "WEBP_Q=88"
set "AVIF_Q=62"

:: Szybkość/ostrość AVIF (libheif/libaom)
:: speed: 0=wolno/najlepiej, 10=szybko/słabiej; 5–7 to dobry kompromis
set "AVIF_SPEED=6"

set "src=."
set "out=optimized"
if not exist "%out%" mkdir "%out%"

for %%F in ("%src%\*.jpg" "%src%\*.jpeg" "%src%\*.png") do (
  echo Przetwarzanie %%~nxF ...
  for %%S in (400 600 800 1200 1600) do (
    :: Tylko zmniejszanie (%%Sx%%S^>): nie powiększaj małych obrazów
    :: Filtr Lanczos dla ostrości, sRGB i bez metadanych
    magick "%%F" -filter Lanczos -resize %%Sx%%S^> -colorspace sRGB -strip ^
      -define webp:method=6 -define webp:use-sharp-yuv=true ^
      -quality %WEBP_Q% "%out%\%%~nF-%%S.webp"

    magick "%%F" -filter Lanczos -resize %%Sx%%S^> -colorspace sRGB -strip ^
      -define heic:speed=%AVIF_SPEED% -define heif:speed=%AVIF_SPEED% ^
      -define heic:chroma=444 ^
      -quality %AVIF_Q% "%out%\%%~nF-%%S.avif"
  )
)

echo.
echo ==== ZAKOŃCZONO! ====
echo Pliki zapisane w folderze: "%out%"
pause
