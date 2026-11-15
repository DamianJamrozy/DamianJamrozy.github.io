> Ten katalog zawiera samodzielną grę Career Drive pod `game/index.html`. Instrukcja integracji, publikacji i odłączenia: [WDROZENIE-GRY.md](WDROZENIE-GRY.md). Poniżej zachowano opis oryginalnej paczki.

# 🌐 Damian Jamroży — Portfolio / CV

> Junior IT Specialist · UX/UI Designer · Software Developer · Software & Database Engineer 

[🇵🇱 **Polski**](#-wersja-polska) · [🇬🇧 **English**](#-english-version)

---

## 🇬🇧 English version

### 🧠 About
Personal online portfolio built as a fully responsive website.  
It presents my professional experience, selected projects, skills, and contact information in a clean, modern form.  
The website is powered only by **HTML, CSS, and JavaScript**.

### ⚙️ Tech stack
- **HTML5 / CSS3 / JavaScript (ES6+)**
- **GitHub Pages** (hosting)
- **Responsive Design**
- **Intersection Observer** for animations
- **Custom language switcher (PL/EN)**
- **Dynamic counters** with real GitHub API integration

### 💡 Features
- Multilingual interface (Polish / English)  
- Animated metric counters (experience years, GitHub projects, satisfied clients)  
- Automatic data fetching from GitHub API  
- Smooth scroll navigation & mobile menu  
- Dark, minimalist design focused on accessibility  

### 🔗 Live preview
👉 [https://damianjamrozy.github.io](https://damianjamrozy.github.io)

### 📬 Contact
- **Email:** [djamrozy.cv@gmail.com](mailto:djamrozy.cv@gmail.com)  
- **LinkedIn:** [linkedin.com/in/djamrozy](https://www.linkedin.com/in/djamrozy/) 

---

## 🇵🇱 Wersja polska

### 🧠 O projekcie
Moje osobiste portfolio online – w pełni responsywna strona,  
prezentująca doświadczenie zawodowe, projekty, umiejętności i dane kontaktowe w nowoczesnej formie.  
Strona działa wyłącznie w oparciu o **HTML, CSS i JavaScript**.

### ⚙️ Technologie
- **HTML5 / CSS3 / JavaScript (ES6+)**
- **GitHub Pages** (hosting)
- **Responsywność (RWD)**
- **Intersection Observer** do animacji
- **Własny przełącznik języków (PL/EN)**
- **Liczniki danych z integracją GitHub API**

### 💡 Funkcjonalności
- Interfejs w dwóch językach: polskim i angielskim  
- Animowane liczniki (lata doświadczenia, projekty, zadowoleni klienci)  
- Automatyczne pobieranie liczby repozytoriów z GitHuba  
- Płynne przewijanie i menu mobilne  
- Minimalistyczny ciemny design z naciskiem na dostępność  

### 🔗 Podgląd online
👉 [https://damianjamrozy.github.io](https://damianjamrozy.github.io)

### 📬 Kontakt
- **Email:** [djamrozy.cv@gmail.com](mailto:djamrozy.cv@gmail.com)  
- **LinkedIn:** [linkedin.com/in/djamrozy](https://www.linkedin.com/in/djamrozy/) 

---

🧾 *Project maintained and designed by Damian Jamroży — all rights reserved.*

## Career Drive — interaktywna historia

Gra jest rozszerzeniem istniejącego CV. Wejście do niej znajduje się w sekcji głównej oraz w menu mobilnym. Jedna przewijana droga prowadzi przez dziesięć etapów: technikum w Staszowie (2015), praktyki w Arkonsoft (11.2017), rozpoczęcie studiów w Rzeszowie (2019), pracę na uczelni (01.2020), UCI (01.2022), rozwój i nagrodę za pracę dyplomową (2023–2024), SSC Master w Toruniu (03.2025), ASBiR w Poznaniu (03.2025), Netwise w Warszawie (06.2026) oraz kolejny rozdział. W SSC Master Damian pracował jako UI/UX Designer. Zajęcia na UR prowadził od lutego do października 2025. Od czerwca 2026 pracuje w Netwise jako programista .NET i Dynamics 365 (CRM).

Otoczenie odpowiada etapom podróży: szkolne boisko z dziećmi i grą w siatkówkę, małe miasto, kampus i rzeszowski pomnik, toruńska zabudowa oraz warszawska dzielnica biurowa. Ruch przechodniów i krótkie sceny ożywiają postoje. Scena konkursu pokazuje podium 1-2-3 z Damianem na drugim miejscu. W oknach historii pojawiają się też animacje zajęć, szkicowania interfejsów i pracy z CRM. Gra opowiada historię samodzielnie, w pierwszej osobie jako Damian Jamroży, w obu językach. Poboczne spotkania mają osobno podpisane pytanie rozmówcy i odpowiedź Damiana. Treści nie odsyłają do opisów w zwykłym CV ani na stronie „O mnie”.

Droga zmienia się razem z otoczeniem: początkowy wąski szuter przechodzi w asfalt z dwoma pasami, a warszawski odcinek ma cztery pasy i rozdzielenie kierunków. Po trasie poruszają się inne pojazdy. Mapa korzysta z tej samej geometrii drogi, profili jezdni, regionów i punktów co świat gry; pokazuje także poboczne spotkania i odgałęzienie do zamkniętego toru.

### Uruchomienie lokalne

Wymagany Node.js 20 lub nowszy. Gra nie wymaga instalowania zależności ani budowania aplikacji.

```powershell
npm run dev
```

Otwórz [polską wersję gry](http://127.0.0.1:4173/game/index.html?lang=pl) lub [angielską wersję gry](http://127.0.0.1:4173/game/index.html?lang=en). Całe CV jest dostępne pod [adresem głównym](http://127.0.0.1:4173/). Serwer służy wyłącznie do lokalnego podglądu; gotowy `game/index.html` można też otworzyć bezpośrednio przez `file://`, ponieważ gra używa dołączonego klasycznego skryptu `app.bundle.js`.

```powershell
npm test
```

Ścisłe sprawdzenie typów dotyczy wyłącznie kodu nowej gry, bez przebudowy starszego portfolio. Wymaga jednorazowego `npm install`:

```powershell
npm run check
```

### Obsługa

Na komputerze `↑` / `W` przyspiesza, `↓` / `S` hamuje lub cofa, a `←` / `→` i `A` / `D` kierują samochodem. Ręczna jazda na głównej mapie odbywa się swobodnie w 2D: można skręcić, zawrócić i zjechać z jezdni do miejsca obok drogi. `H` uruchamia klakson, `L` przełącza światła, a `Esc` włącza pauzę lub zamyka otwarte okno. Na telefonie i tablecie dostępne są odpowiadające im przyciski dotykowe.

Samo przejechanie obok daty nie zatrzymuje ręcznej jazdy i nie otwiera dialogu. W oznaczonej strefie pojawia się podpowiedź; rozmowę rozpoczyna dopiero `E`, `Enter` albo przycisk „Porozmawiaj”. Do historii trzeba dojechać. Przy pobocznym spotkaniu zjedź do zatoczki po tej samej stronie drogi co postać.

Klawisz `M` albo przycisk mapy otwiera przegląd całej trasy. Wybór daty uruchamia autopilota do wskazanego miejsca, także do wcześniejszego etapu. Można wybrać spokojne tempo `1×` lub szybki przejazd `3×`. Autopilot parkuje przy przystanku i czeka na świadome uruchomienie rozmowy. Mapę i dialogi można obsługiwać klawiaturą.

### Samochody i tor

Podróż zaczyna się w taxi. Auta zmienia się świadomie w dwóch garażach, a samo przekroczenie daty nie przesiada gracza do innego samochodu. Pierwszy garaż jest po lewej stronie przy Centrum Informatyzacji, w okolicy `5650`; drugi po prawej przy Netwise, w okolicy `10880`. Można do nich podjechać ręcznie albo wybrać dojazd do pobliskiego garażu z karty jazdy. `E`, `Enter` lub przycisk interakcji otwiera opowieść o aucie. Dopiero wybór samochodu uruchamia krótką animację przesiadki, trwającą około 0,9 sekundy.

Parking pokazuje wyłącznie aktualnie prowadzone auto oraz samochód stojący w jego drugiej zatoce. Nie wyświetla listy późniejszych modeli. Wstęp historii opisuje osobisty moment, a dane techniczne występują w jednym akapicie. Mapa oznacza parkingi literą P, bez ujawniania kolejnych aut. Asfaltowe podjazdy mają krawędzie i oznakowanie; wspólne `garage-layout.js` określa ich przebieg dla świata, powierzchni jezdnej, autopilota i mapy. Autopilot jedzie po podjeździe do pustej zatoki.

`track-access.js` określa wspólny przebieg zjazdu na tor, asfalt, bramę i połączenie na mapie. Krawężnik zaczyna się poza głównymi pasami, a budynki, korony drzew i latarnie mają zarezerwowane miejsce poza podjazdem. Interakcja otwiera tor dopiero przy fizycznej bramie, po przejechaniu zjazdu.

C-Max to pierwszy własny samochód Damiana: czarny Ford C-Max z 2009 roku, diesel o mocy 115 KM, z prawie 200 000 km przebiegu w chwili zakupu. Drugi to szaro-perłowy Ford Focus ST hatchback z 2018 roku, sprowadzony z USA, z benzynowym silnikiem turbo. Seryjnie miał 250 KM, po modyfikacjach ponad 300 KM. Kosztował 70 000 zł. Opowieść łączy go z marzeniem o Focusie RS i inspiracją Kenem Blockiem. Wskazane etapy UCI i Netwise umieszczają garaże w narracji, bez dopisywania dokładnych dat zakupu. Samochody mają stylizowane rysunki Canvas, charakter jazdy i brzmienie. Wybrany pojazd oraz posiadane auta są zapisywane; powrót do wcześniejszego etapu nie wymusza kolejnej zmiany.

Za Netwise, w okolicy pozycji `11420`, jest oznaczone odgałęzienie w prawo na zamknięty tor. Prowadzi do bramy, przy której można wjechać skrętem lub przez `E` / `Enter`. Tor jest dostępny dla każdego pojazdu: taxi, C-Maxa i Focusa ST. Prowadzone auto, jego wygląd i dźwięk pozostają zgodne z wyborem z głównej trasy. Przyspieszenie i prędkość maksymalna korzystają ze wspólnych profili pojazdów; Focus ST jest najszybszy. Płomienie wydechu i blow-off należą do Focusa. To osobny, skończony obwód z serpentynami, padokiem i mini-mapą. Strzałki lub WASD prowadzą auto, a `Spacja` albo dotykowy przycisk driftu uruchamia hamulec ręczny. Połączenie gazu, skrętu i poślizgu daje punkty driftu; przejazd kolejnych punktów kontrolnych zalicza okrążenie. Trawa spowalnia auto. „Wróć na trasę” kończy jazdę po torze i wraca do drogi CV. Wyniki i pozycja na torze istnieją tylko w bieżącej sesji; zapis historii nadal przechowuje pozycję na głównej drodze. Przesiadka do innego modelu zaczyna jego jazdę z padoku, z zachowaniem ukończonych okrążeń i punktów sesji.

Rozmowa przy Kulturaliach opisuje kontakt z artystami, dbanie o ich samopoczucie i potrzeby na terenie imprezy oraz osobiste poznanie wielu znanych wykonawców. Osobne pytanie przedstawia wielotysięczną publiczność. Zapowiedź kilkunastu tysięcy uczestników edycji 2024 ma podlinkowane [źródło z wypowiedzią organizatora](https://rzeszow-news.pl/kulturalia-2024-znamy-pierwszych-artystow-impreza-bez-korowodu-studentow/). To prognoza z 15 maja 2024, bez deklarowania potwierdzonego maksimum frekwencji.

### Dźwięk i muzyka

KultURalia mają osobną scenę koncertową po prawej stronie między Uniwersytetem a UCI (`4750`): zespół, nagłośnienie, łagodne światła i 56 tańczących uczestników. Podjazd do sceny i `E` / `Enter` otwierają rozmowę o współorganizowaniu imprez masowych i pracy w samorządzie. Teren wydarzenia, interakcja i ikona mapy korzystają z tej samej pozycji w `festival.js`. Po włączeniu muzyki koncertowy rytm z perkusją i basem narasta przy zbliżaniu się do sceny, a przy odjeżdżaniu płynnie wraca muzyka podróży. Koncert gra także podczas wybranej opowieści o Kulturaliach, z wyciszonym silnikiem. Radio feniks.fm ma oddzielną animację i temat rozmowy.

Efekty i spokojna muzyka instrumentalna są domyślnie włączone. Web Audio uruchamia się automatycznie przy pierwszym kliknięciu, dotknięciu lub użyciu klawiatury w grze, zgodnie z ograniczeniami autoplay w przeglądarkach. Przycisk głośnika otwiera ustawienia: „Wycisz wszystko” wyłącza oba kanały jednym kliknięciem, a osobne przełączniki pozwalają wyłączyć samą muzykę lub efekty. Wybory są zapamiętywane lokalnie, niezależnie od postępu gry, także po odświeżeniu strony. Kolejne kliknięcia i powrót na kartę nie cofają wyciszenia. Gdy zapis lokalny jest zablokowany, wybór działa do końca bieżącego otwarcia gry.

`audio.js` tworzy muzykę i efekty lokalnie w Web Audio. Taxi ma neutralny dźwięk silnika, C-Max charakterystyczny rytm diesla, a Focus ST sportowe brzmienie silnika turbo. Przesiadka w garażu odtwarza gaszenie poprzedniego silnika, a po przejściu do nowego auta rozrusznik, zapłon i zejście na wolne obroty. Sekwencja działa także bez animacji, wymaga włączonych efektów i jest anulowana po wyciszeniu, pauzie lub ukryciu karty. Przy szybkim odjęciu gazu w Focusie pojawiają się efekty blow-off, krótkie strzały wydechu i animowany płomień. Są też klakson, odgłosy poślizgu i sygnały interfejsu. To synteza inspirowana charakterem pojazdów, a nie nagrania oryginalnych silników. Muzyka nie wymaga pobierania plików audio ani korzystania z zewnętrznej usługi. Pauza i ukrycie karty wyciszają odtwarzanie.

### Poboczne spotkania i treść rozmów

Sześć opcjonalnych miejsc rozszerza historię: salon gier (`900`, prawa strona), gablota stypendialna (`2350`, lewa), KultURalia i imprezy masowe (`4750`, prawa), feniks.fm (`4850`, lewa), robot objaśniający gesty PJM (`7350`, prawa) oraz trening (`9900`, prawa). Spotkania mają zapisane dialogi PL/EN i własne scenki; ich ukończenie nie jest wymagane do odkrycia dziesięciu rozdziałów. Postacie rozmówców są fikcyjnymi przewodnikami scenografii. Nie ma połączenia z modelem AI ani generowania odpowiedzi w sieci.

Rozdział ASBiR w Poznaniu dotyczy administracji stronami asbir.pl i festiwaladr.pl oraz tworzenia i aktualizacji wtyczek WordPress. Odpowiedź o wtyczkach ma własną animację podłączania modułów do strony. Radio feniks.fm jest osobnym spotkaniem w uniwersyteckiej części Rzeszowa, z audycjami, wywiadami, realizacją audio i wideo oraz obsługą strony radia. Jego scena ma oznaczenie „ON AIR”, bez przypisywania daty rozpoczęcia pracy w ASBiR.

W spotkaniu „Przerwa na trening” aktualna odpowiedź o czasie po pracy dotyczy przede wszystkim ćwiczeń siłowych na siłowni i kickboxingu. Osobna scena pokazuje podnoszenie hantli, cios i kopnięcie w worek. Pozostałe zainteresowania mają pytanie „A poza treningiem?”. To osobisty wątek z neutralnymi nagłówkami, bez dziedziczenia miasta i daty zatrudnienia w ASBiR.

Wątek stypendium uwzględnia informację właściciela o znalezieniu się w gronie **250 najlepszych uczniów województwa świętokrzyskiego w 2019 roku**. Robot opowiada o pracy dotyczącej rozpoznawania gestów polskiego języka migowego w czasie rzeczywistym z użyciem uczenia maszynowego; sam robot jest ilustracją w grze. Drugą nagrodę w konkursie prac dyplomowych z 2024 roku i temat pracy potwierdza podlinkowane w spotkaniu [źródło SEP przy Politechnice Rzeszowskiej](https://sep.w.prz.edu.pl/dzialalnosc/konkursy/konkurs-2024-wyniki).

### Animowana postać i sceny

Rysunkowa postać mruga, zmienia mimikę i porusza ustami podczas stopniowego odsłaniania tekstu. Przy włączonych efektach pojawianiu się liter towarzyszy cichy dźwięk pisania. Korzysta z rytmu odsłaniania tekstu, pomija spacje i interpunkcję oraz nie nadrabia opóźnionych liter serią dźwięków. Przycisk „Pokaż cały tekst” od razu kończy animację i klikanie. Zamknięcie rozmowy, wyciszenie i ukrycie karty też zatrzymują dźwięk. Przy ograniczeniu animacji tekst pojawia się od razu i bez klikania. Ruch ust jest powiązany z tekstem dialogu; gra nie generuje głosu ani nie wymaga usługi syntezy mowy.

Scenki reagują na rozdział i temat odpowiedzi: obejmują między innymi przeprowadzkę do Rzeszowa z walizką, dyplom i czapkę absolwenta, stypendium, AI i gesty PJM, wręczanie nagrody za drugie miejsce, wykład na sali, bazy danych, automatyzację, projektowanie UI w Toruniu i programowanie w Warszawie. Etap rozpoczęcia studiów opowiada o przeprowadzce i pozostaniu w Rzeszowie; stypendium występuje wyłącznie przy wcześniejszym wyróżnieniu. Przycisk odtworzenia uruchamia bieżącą scenkę od początku.

Wspólny przełącznik w oknie sterowania obejmuje animacje postaci, scen dialogowych oraz życia otoczenia. Ustawienie `prefers-reduced-motion` jest respektowane automatycznie: animacje zatrzymują się, a tekst jest widoczny od razu. Arkusz mimiki i statyczny portret są lokalnymi plikami w `career-drive/assets/`, więc działają także na telefonie bez połączenia z zewnętrznym API. Kolor oczu portretu dostosowano do wskazanych przez właściciela referencji; bazą były jego publiczne zdjęcia z CV.

### GitHub Pages

Gra jest statyczną stroną w katalogu `career-drive/`. Nie używa backendu, kont użytkownika, kluczy API ani płatnych usług. Wszystkie pliki wykonywane przez grę są lokalnymi zasobami repozytorium; podgląd w Node.js nie jest potrzebny na GitHub Pages.

Aby opublikować zmiany w istniejącym repozytorium `DamianJamrozy.github.io`, zachowaj cały katalog `game/`, łącznie z wygenerowanym `career-drive/app.bundle.js`, i samodzielnie zatwierdź oraz wyślij zmiany. Zachowaj dotychczasowe ustawienia GitHub Pages. Przy publikacji z gałęzi wybierz katalog `/ (root)`; hosting nie wymaga kompilacji. Po zmianie źródeł gry uruchom lokalnie `npm --prefix game run build`; kontrola `npm --prefix game run check` wykryje nieaktualny bundle. Adres gry po publikacji: `https://damianjamrozy.github.io/game/index.html?lang=pl` lub `?lang=en`. Odnośniki względne pozwalają także uruchomić stronę w podkatalogu repozytorium.

Język działa tak jak w CV: parametr `?lang=pl` / `?lang=en` ma pierwszeństwo, a preferencja jest zapamiętywana pod wspólnym kluczem `localStorage.lang`. Aktualny zapis `career-drive:v4` przechowuje odkryte rozdziały, wybrany etap, pozycję i kierunek auta na głównej mapie oraz wybrany i posiadane pojazdy, a także auta zaparkowane w garażach i stan przesiadki (`garages`). Odczyt sprawdza kolejno v4, v3, v2 i v1. Migracja v3 zachowuje odkrycia i pozycję wzdłuż drogi, lecz rozpoczyna z taxi i bez dodatkowych aut, ponieważ w poprzednim zapisie nie było świadomych decyzji garażowych. Migracja v2 nadal przenosi dawny finał z indeksu 8 do 9 oraz przesuwa jego fragment drogi za Netwise; nowy etap pozostaje nieodkryty. Zapis v1 zachowuje odkrycia, ale rozpoczyna jazdę na początku, ponieważ nie zawierał pozycji auta. Preferencja wszystkich animacji jest zapisywana pod kluczem `career-drive:animations`. Dane pozostają w przeglądarce i nie są wysyłane na serwer. Wyczyszczenie danych witryny usuwa zapis. Gdy zapis jest zablokowany, gra nadal działa w bieżącej sesji.

Nowe funkcje pozostają w lokalnych modułach: `audio.js`, `vehicles.js`, `garage-stories.js`, `road-layout.js`, `drift-track.js`, `route-map.js` / `route-map.css` i `side-stories.js`. Wdrożenie obejmuje cały katalog `career-drive/`, w tym istniejące pliki w `assets/`, oraz wskazane zmiany głównego CV. Nie dodano serwera ani kluczy API.

W tym środowisku nie wykonano commita, push ani publikacji.
