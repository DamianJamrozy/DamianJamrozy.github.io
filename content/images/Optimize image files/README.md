# 🖼️ optimize_images.bat  
## 🇵🇱 Wersja polska

### 📘 Opis programu
**optimize_images.bat** to rozwinięta wersja skryptu wsadowego autorstwa **Damiana Jamrożego**, służąca do **automatycznej konwersji, optymalizacji i skalowania obrazów** w formatach **JPG**, **PNG** i **AVIF** do nowoczesnych, wysoko wydajnych formatów **WEBP** oraz **AVIF**.

Nowa wersja umożliwia wybór **trzech trybów jakości**, generowanie obrazów w **stałym zestawie rozdzielczości** oraz prezentuje **czytelny pasek postępu** w procentach.  
To narzędzie idealne do przygotowywania grafik dla stron internetowych, aplikacji webowych oraz systemów responsywnych.

---

### ⚙️ Funkcjonalności
- ✅ Automatyczna konwersja plików `.jpg`, `.jpeg`, `.png` i `.avif` z bieżącego katalogu  
- ✅ Tworzenie zoptymalizowanych kopii w formatach:
  - **WEBP**
  - **AVIF**
- ✅ Generowanie 8 rozdzielczości:  
  `400`, `600`, `800`, `1200`, `1600`, `2000`, `2560`, `3200` pikseli  
- ✅ Możliwość wyboru trybu jakości:
  1. **Bezstratny** – maksymalna jakość, duże pliki  
  2. **Wysoka jakość** – prawie bezstratna (zalecana dla grafik hero)  
  3. **Standard** – mniejsze pliki, szybsze działanie  
- ✅ Pasek postępu z procentowym wskaźnikiem (`Postęp: [#####.....] 73%`)  
- ✅ Automatyczne sprawdzanie dostępności programu **ImageMagick**  
- ✅ Obsługa nazw plików z polskimi znakami (UTF-8)  
- ✅ Zapis wyników w folderze `optimized/`  

---

### 🧩 Wymagania
- System operacyjny **Windows 10/11**
- Program **ImageMagick** dodany do zmiennej środowiskowej PATH

#### 🖥️ Instalacja ImageMagick przez CMD (winget)
```cmd
winget install ImageMagick.ImageMagick
magick -version
```
Jeśli polecenie `magick` zwróci wersję programu — instalacja zakończona pomyślnie ✅

---

### 🚀 Sposób użycia
1. Skopiuj plik `optimize_images.bat` do folderu z obrazami.  
2. Uruchom go dwukrotnym kliknięciem lub z poziomu CMD.  
3. Wybierz tryb:
   ```
   [1] Bezstratny (duże pliki)
   [2] Wysoka jakość (zalecane dla hero)
   [3] Standard (mniejsze pliki)
   ```
4. Skrypt automatycznie utworzy folder:
   ```
   optimized/
   ```
   Zawierający wszystkie pliki `.webp` i `.avif` w 8 rozdzielczościach.

---

### 📂 Przykładowa struktura katalogu
```
/ (bieżący folder)
│
├── hero.png
├── banner.jpg
│
└── optimized/
    ├── hero-400.webp
    ├── hero-400.avif
    ├── hero-800.webp
    ├── hero-800.avif
    ├── hero-2000.webp
    ├── hero-2000.avif
    └── ...
```

---

### 🔧 Tryby jakości (parametry techniczne)

#### 1️⃣ **Bezstratny (LOSSLESS)**
- WEBP: `-define webp:lossless=true -quality 100`
- AVIF: `-define heic:lossless=true -quality 100`
- AVIF SPEED: `2`

#### 2️⃣ **Wysoka jakość (HIGH)**
- WEBP: `-quality 92 -define webp:method=6 -define webp:use-sharp-yuv=true`
- AVIF: `-quality 72 -define heic:chroma=444 -define heic:speed=4`

#### 3️⃣ **Standard (DEFAULT)**
- WEBP: `-quality 88`
- AVIF: `-quality 62 -define heic:chroma=444 -define heic:speed=6`

Wszystkie tryby stosują:
```
-filter Lanczos -resize SxS> -colorspace sRGB -strip
```
(`SxS>` = tylko zmniejszanie — brak powiększania mniejszych obrazów)

---

### 💡 Wskazówki
- Dla grafik **hero** na stronach desktopowych używaj trybu **Wysoka jakość** – oferuje niemal perfekcyjny wygląd przy mniejszym rozmiarze.  
- Dla galerii, miniaturek i mobilnych wersji strony wystarczy tryb **Standard**.  
- Tryb **Bezstratny** zalecany jest wyłącznie do plików bazowych lub archiwizacji.  
- Skrypt obsługuje także **wejściowe pliki AVIF**, dzięki czemu można ponownie je przeskalować i zoptymalizować.  
- Jeśli zobaczysz plik większy niż oryginał (np. AVIF), to normalne w trybie bezstratnym — jest to efekt kompresji bezztraty.

---

### 👨‍💻 Autor
**Damian Jamroży**  
Magister inżynier nauk informatycznych

---

### 📜 Licencja
Wszelkie prawa zastrzeżone © 2025 **Damian Jamroży**.  
Kopiowanie, modyfikowanie, rozpowszechnianie lub wykorzystywanie tego programu w jakiejkolwiek formie bez **pisemnej zgody autora** jest zabronione.

Użytkowanie programu do celów prywatnych lub komercyjnych wymaga **indywidualnej zgody Damiana Jamrożego**.

📅 Rok: 2025
  
---

## 🇬🇧 English Version

### 📘 Program Description
**optimize_images.bat** is an advanced batch script created by **Damian Jamroży**, designed for **automatic image conversion, optimization, and scaling** from **JPG**, **PNG**, and **AVIF** to modern formats **WEBP** and **AVIF**.

It now supports **three quality modes**, generates **eight fixed resolutions**, and shows a **live progress bar** during processing.  
Perfect for responsive web design and performance-focused workflows.

---

### ⚙️ Features
- ✅ Converts `.jpg`, `.jpeg`, `.png`, and `.avif` images from the current directory  
- ✅ Generates optimized copies in:
  - **WEBP**
  - **AVIF**
- ✅ Creates 8 resolutions:  
  `400`, `600`, `800`, `1200`, `1600`, `2000`, `2560`, `3200` px  
- ✅ Choose one of three modes:
  1. **Lossless** – best quality, largest files  
  2. **High Quality** – near-lossless (recommended for hero)  
  3. **Standard** – smaller size, faster conversion  
- ✅ Displays a live **progress bar** with percentages  
- ✅ Checks if **ImageMagick** is installed  
- ✅ UTF-8 filename support  
- ✅ Output saved to `optimized/`

---

### 🔧 Quality presets
#### 🔹 Lossless
- WEBP: `-define webp:lossless=true -quality 100`
- AVIF: `-define heic:lossless=true -quality 100`
- Speed: 2

#### 🔹 High Quality
- WEBP: `-quality 92 -define webp:method=6 -define webp:use-sharp-yuv=true`
- AVIF: `-quality 72 -define heic:chroma=444 -define heic:speed=4`

#### 🔹 Standard
- WEBP: `-quality 88`
- AVIF: `-quality 62 -define heic:chroma=444 -define heic:speed=6`

All modes use:
```
-filter Lanczos -resize SxS> -colorspace sRGB -strip
```

---

### 👨‍💻 Author
**Damian Jamroży**  
M.Sc. Eng. in Computer Science 


---

### 📜 License
All rights reserved © 2025 **Damian Jamroży**.  
Copying, modifying, redistributing, or using this program in any form without the **written consent of the author** is strictly prohibited.

Use of this program for private or commercial purposes requires **individual permission from Damian Jamroży**.

📅 Year: 2025  