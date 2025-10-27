@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

echo ==== KONWERSJA (WEBP/AVIF) — WYSOKA JAKOSC ====

:: === USTAWIENIA JAKOSCI ===
set "SIZES=400 800 1200 1600"
set "QWEBP_SMALL=92"   & set "QAVIF_SMALL=78"
set "QWEBP_MED=95"     & set "QAVIF_MED=84"
set "QWEBP_LARGE=97"   & set "QAVIF_LARGE=88"
set "HEIC_SPEED=4"     :: 0=wolno/najlepiej, 4=dobry kompromis

:: === SPRAWDZENIA ===
where magick >nul 2>nul || (
  echo [BLAD] Nie znaleziono "magick". Zainstaluj ImageMagick i dodaj do PATH.
  exit /b 1
)

:: Czy jest AVIF?
set "HAS_AVIF=0"
for /f "delims=" %%A in ('magick -list format ^| findstr /I "AVIF"') do set "HAS_AVIF=1"

set "OUT=optimized"
if not exist "%OUT%" mkdir "%OUT%"

echo [INFO] AVIF: %HAS_AVIF%  (1=tak, 0=nie)
echo [INFO] Rozmiary: %SIZES%
echo [INFO] Wyjscie:  "%OUT%"
echo.

:: === PETLA PLIKOW ===
for %%F in (*.jpg *.jpeg *.png *.JPG *.JPEG *.PNG *.avif) do (
  if exist "%%~fF" (
    echo --- %%~nxF ---
    for %%S in (%SIZES%) do (
      set "QW=!QWEBP_SMALL!"
      set "QA=!QAVIF_SMALL!"
      if %%S GEQ 800  (set "QW=!QWEBP_MED!"   & set "QA=!QAVIF_MED!")
      if %%S GEQ 1200 (set "QW=!QWEBP_LARGE!" & set "QA=!QAVIF_LARGE!")

      rem === WEBP (ostro, wysoka jakosc) ===
      magick "%%~fF" -colorspace sRGB -filter Lanczos -resize %%S ^
        -unsharp 0x0.8+0.7+0.02 -strip ^
        -quality !QW! -define webp:method=6 -define webp:use-sharp-yuv=true ^
        "%OUT%\%%~nF-%%S.webp"

      rem === AVIF jesli dostepny ===
      if %HAS_AVIF%==1 (
        magick "%%~fF" -colorspace sRGB -filter Lanczos -resize %%S ^
          -unsharp 0x0.8+0.7+0.02 -strip ^
          -quality !QA! -define heic:speed=%HEIC_SPEED% -define heic:chroma=444 ^
          "%OUT%\%%~nF-%%S.avif"
      )
    )
  )
)

echo.
echo [OK] Gotowe. Pliki znajdziesz w: "%OUT%"
endlocal
