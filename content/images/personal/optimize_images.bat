@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul

:: === PRZEJDŹ DO KATALOGU TEGO SKRYPTU ===
cd /d "%~dp0"

echo ==== KONWERSJA OBRAZÓW (WEBP/AVIF) ====
echo ==== Autor: Damian Jamroży ====

:: Sprawdzenie ImageMagick
where magick >nul 2>nul || (
  echo [BŁĄD] Nie znaleziono "magick". Zainstaluj ImageMagick i dodaj do PATH.
  pause & exit /b
)

:: ====== WYBÓR TRYBU (tylko inne parametry kompresji) ======
echo.
echo Wybierz tryb:
echo   [1] Bezstratny (duze pliki)
echo   [2] Wysoka jakosc (prawie bezstratnie - polecane dla hero)
echo   [3] Standard (szybciej, mniejsze pliki)
set /p "MODE=Twoj wybor [1/2/3]: "
if "%MODE%"=="1" goto :LOSSLESS
if "%MODE%"=="2" goto :HIGH
set "MODE=3"

:LOSSLESS
if "%MODE%"=="1" (
  set "PROFILE=LOSSLESS"
  set "WEBP_Q=100"
  set "WEBP_EXTRA=-define webp:lossless=true -define webp:use-sharp-yuv=true -define webp:alpha-quality=100"
  set "AVIF_Q=100"
  set "AVIF_SPEED=2"
  set "AVIF_EXTRA=-define heic:lossless=true -define heif:lossless=true -define heic:chroma=444"
  goto :SET_COMMON
)

:HIGH
if "%MODE%"=="2" (
  set "PROFILE=HIGH"
  set "WEBP_Q=92"
  set "WEBP_EXTRA=-define webp:method=6 -define webp:use-sharp-yuv=true"
  set "AVIF_Q=72"
  set "AVIF_SPEED=4"
  set "AVIF_EXTRA=-define heic:speed=%AVIF_SPEED% -define heif:speed=%AVIF_SPEED% -define heic:chroma=444"
  goto :SET_COMMON
)

:: STANDARD
set "PROFILE=STANDARD"
set "WEBP_Q=88"
set "WEBP_EXTRA=-define webp:method=6 -define webp:use-sharp-yuv=true"
set "AVIF_Q=62"
set "AVIF_SPEED=6"
set "AVIF_EXTRA=-define heic:speed=%AVIF_SPEED% -define heif:speed=%AVIF_SPEED% -define heic:chroma=444"

:SET_COMMON
:: ROZMIARY — ZAWSZE TE SAME (dla obu formatów)
set "SIZES=400 600 800 1200 1600 2000 2560 3200"
:: Rozszerzenia – TYLKO małe, bo Windows i tak dopasowuje bez względu na wielkość
set "EXTS=jpg jpeg png"

echo.
echo [INFO] Tryb: %PROFILE%
echo [INFO] Rozmiary: %SIZES%
echo.

:: Folder wyjściowy — tylko 'optimized'
set "out=%cd%\optimized"
if not exist "%out%" mkdir "%out%"

:: ===== POLICZ ŁĄCZNĄ LICZBĘ PLIKÓW =====
set /a FILES=0
for %%E in (%EXTS%) do (
  for %%F in (*."%%E") do set /a FILES+=1
)
if !FILES! equ 0 (
  echo [INFO] Brak obrazow *.jpg/*.jpeg/*.png w "%cd%".
  pause & exit /b
)

:: POLICZ ILE ROZMIARÓW
set /a SCOUNT=0
for %%S in (%SIZES%) do set /a SCOUNT+=1

:: 2 formaty (AVIF+WEBP) * SCOUNT rozmiarów na każdy plik
set /a TASKS=FILES * 2 * SCOUNT
set /a DONE=0

call :Progress !DONE! !TASKS!

:: ===== GŁÓWNA PĘTLA — tylko bieżący katalog =====
for %%E in (%EXTS%) do (
  for %%F in (*."%%E") do (
    echo(
    echo =====================================
    echo Plik: %%~nxF

    for %%S in (%SIZES%) do (
      rem --- WEBP ---
      magick "%%~fF" -filter Lanczos -resize %%Sx%%S^> -colorspace sRGB -strip ^
        -quality %WEBP_Q% %WEBP_EXTRA% ^
        "%out%\%%~nF-%%S.webp"
      set /a DONE+=1
      call :Progress !DONE! !TASKS!

      rem --- AVIF ---
      magick "%%~fF" -filter Lanczos -resize %%Sx%%S^> -colorspace sRGB -strip ^
        -quality %AVIF_Q% %AVIF_EXTRA% ^
        "%out%\%%~nF-%%S.avif"
      set /a DONE+=1
      call :Progress !DONE! !TASKS!
    )
  )
)

echo(
echo ==== ZAKOŃCZONO! ====
echo Pliki zapisane w: "%out%"
echo.
pause
exit /b

:: ===== FUNKCJA PASKA POSTĘPU (czytelna linia z % i licznikiem) =====
:Progress
:: %1 = DONE, %2 = TASKS
setlocal EnableDelayedExpansion
set /a done=%~1, all=%~2
if !all! lss 1 set /a all=1

set /a pct = (done*100)/all
set "barlen=30"
set /a filled=(pct*barlen+50)/100

set "bar="
for /l %%i in (1,1,!barlen!) do (
  if %%i LEQ !filled! (set "bar=!bar!#") else (set "bar=!bar!.")
)
echo Postep: [!bar!] !pct!%%  (!done!/!all!)
endlocal & goto :eof
