# Career Drive — publikacja w istniejącym CV

Gra jest osobną, statyczną częścią repozytorium w katalogu `game/`. Jej publiczne wejście to `game/index.html`, które przekierowuje do `game/career-drive/index.html`, zachowując parametry URL i fragment adresu. Wszystkie style, fonty, obrazy i moduły potrzebne do uruchomienia znajdują się wewnątrz `game/`. Kopie istniejących stylów CV w `game/content/css/` zachowują obecny wygląd kontrolek i nie zależą od późniejszych zmian strony.

## Pliki wdrożenia

- `career-drive/` — cały katalog gry: droga przez dziesięć etapów, żywe otoczenie, dialogi PL/EN i sześć pobocznych spotkań.
- `career-drive/audio.js` — lokalny syntezator efektów i muzyki Web Audio; bez plików nagrań i zewnętrznego API.
- `career-drive/vehicles.js`, `career-drive/garage-stories.js`, `career-drive/road-layout.js`, `career-drive/garage-layout.js` i `career-drive/world.js` — rysunki trzech aut, historie garaży, ręczna jazda 2D, wspólna geometria jezdni i podjazdów, ruch uliczny oraz strefy interakcji.
- `career-drive/drift-track.js` i `career-drive/track-access.js` - zamknięty tor dla każdego auta, fizyka, drift, okrążenia oraz wspólny przebieg podjazdu, bramy i połączenia na mapie.
- `career-drive/route-map.js` i `career-drive/route-map.css` — mapa oparta na rzeczywistej geometrii świata, z odgałęzieniem na tor.
- `career-drive/side-stories.js`, `career-drive/story-scenes.js` i `career-drive/world-life.js` — zapisane rozmowy poboczne oraz scenki dobrane do tematu odpowiedzi.
- `career-drive/assets/`, `career-drive/portrait.js` i `career-drive/portrait.css` — lokalny portret i arkusz animacji postaci; zachowaj oba pliki PNG.
- `../index.html` - jedyny przycisk do gry w sekcji „O mnie”, obok „Poznaj mnie lepiej”; korzysta z istniejących klas `cta-row`, `btn` i `btn-primary`.
- `../content/javascript/lang.js` - dwa wpisy `about.game` dla PL/EN z jawnym przekazaniem języka w URL; działają tak jak istniejący wpis `about.button`.
- `content/` - lokalne kopie istniejących CSS, fontów, ikony i zdjęcia awaryjnego. Gra nie ładuje skryptów portfolio i nie rejestruje własnego service workera. Pliki `cache.js` i `content/javascript/lang.js` pozostawione w paczce są pozostałością poprzedniej integracji i nie są ładowane. Główny `../cache.js` pozostaje bez zmian; jego istniejący zakres może obejmować również żądania gry.

Paczka zawiera także dokumentację, lokalny serwer oraz testy. Nie przesyłaj `node_modules/`. Gra nie wymaga backendu ani sekretów. Gotowy `career-drive/app.bundle.js` jest częścią publikowanych plików, więc hosting nie musi uruchamiać procesu budowania.

## Otwarcie bezpośrednio z dysku

Możesz otworzyć `game/index.html` lub `game/career-drive/index.html` przez `file://`. Gra ładuje klasyczny skrypt `app.bundle.js`, który zawiera wszystkie potrzebne moduły. Nie wymaga to serwera, Node.js ani pobierania kodu z CDN. To samo wejście działa na GitHub Pages.

Źródłowe moduły ES pozostają osobnymi plikami do rozwoju i testów. Przeglądarki blokują ich bezpośrednie ładowanie z `file://`, dlatego opublikowany HTML nie ładuje ich pojedynczo. W trybie plikowym gra nie korzysta z `history.replaceState`; wybór języka nadal działa, a odnośniki powrotne przenoszą go w parametrze URL. Dostępność i trwałość zapisu lokalnego zależą od ustawień przeglądarki.

Po zmianie któregokolwiek źródłowego modułu wygeneruj ponownie skrypt i sprawdź go przed publikacją:

```powershell
npm --prefix game ci
npm --prefix game run build
npm --prefix game run check
npm --prefix game test
```

`npm run check` sprawdza typy oraz zgodność wygenerowanego skryptu ze źródłami. Nie edytuj `app.bundle.js` ręcznie. Do repozytorium i na GitHub Pages trafiają zarówno źródła, jak i gotowy skrypt. Esbuild jest zależnością wyłącznie deweloperską.

## Widok telefonu

Na telefonie pole jazdy zajmuje pozostałą wysokość ekranu. Drążek po lewej łączy gaz, hamowanie, cofanie i skręt, a puszczenie palca zwalnia sterowanie. Przycisk rozmowy pojawia się przy dostępnym spotkaniu. Na torze dostępny jest również hamulec ręczny. Mapa, autopilot, pauza, dźwięk, język, opcje auta i wyjście znajdują się w menu „Więcej”. W tym menu można też włączyć dotychczasowe przyciski jazdy.

Otwarcie okna, utrata widoczności i zmiana rozmiaru ekranu zerują aktywne sterowanie. Układ komputerowy i obsługa klawiatury pozostają takie same. Zmiany mobilne dotyczą ekranów do 600 px oraz niskich ekranów dotykowych do 900 px, aby obsłużyć obrót telefonu.

Po zmianie kodu gry **lub `game.css`** uruchom `npm --prefix game run build`. Builder aktualizuje odnośniki `?v=...` na podstawie zawartości skryptu i stylów. Zapobiega to mieszaniu nowego HTML ze starszymi plikami z cache strony. Nie poprawiaj numerów wersji ręcznie; gotowy HTML i bundle opublikuj razem.

Po własnym commicie i pushu zachowaj obecny sposób publikacji GitHub Pages. Przy publikacji bezpośrednio z gałęzi katalogiem strony pozostaje `/ (root)`.

Adresy po publikacji:

- [Polski](https://damianjamrozy.github.io/game/index.html?lang=pl)
- [English](https://damianjamrozy.github.io/game/index.html?lang=en)

## Podgląd i sprawdzenie przed publikacją

```powershell
npm --prefix game run dev
```

Polecenia uruchamiaj z głównego katalogu repozytorium. Otwórz `http://127.0.0.1:4173/index.html#about`; bezpośrednie wejście do gry: `http://127.0.0.1:4173/game/index.html?lang=pl`. Node.js służy wyłącznie jako lokalny serwer plików; GitHub Pages sam obsługuje statyczne zasoby gry.

Opcjonalna weryfikacja deweloperska:

```powershell
npm --prefix game ci
npm --prefix game run check
npm --prefix game test
```

W przeglądarce sprawdź wejście z CV po polsku i angielsku, jazdę strzałkami lub WASD i odtworzenie pozycji po odświeżeniu. Ręczny przejazd obok daty ma pozostawić kontrolę nad autem i nie otwierać rozmowy. W oznaczonej strefie uruchom ją dopiero przez `E`, `Enter` albo przycisk „Porozmawiaj”. Poza strefą przycisk rozmowy jest niedostępny. Do historii trzeba dojechać.

Ręczna jazda na głównej mapie jest swobodną jazdą 2D: samochód może skręcić, zawrócić i zjechać z jezdni do bocznego miejsca. Sprawdź, czy po odświeżeniu wracają również położenie poprzeczne, kierunek i świadomie wybrany pojazd. Autopilot nadal prowadzi wzdłuż drogi do wybranego celu.

Otwórz mapę klawiszem `M` lub przyciskiem na ekranie, wybierz wcześniejszy i późniejszy etap i sprawdź dojazd automatyczny w tempie `1×` oraz `3×`. Autopilot parkuje, lecz nie wywołuje dialogu. Mapa odtwarza krzywizny tej samej drogi, układ regionów, stopniowe poszerzanie jezdni i boczny tor. Na telefonie i tablecie sprawdź sterowanie dotykowe, widoczność podpowiedzi, mapę oraz przewijanie dialogów.

Na komputerze zacznij od świeżego wejścia bez zapisu albo resetu podróży. Jeszcze przed kliknięciem „Ruszajmy” przytrzymaj strzałkę w górę lub `W`: klawisz ma rozpocząć grę, ukryć kartę powitania i uruchomić auto, bez przewijania strony. Powtórz po kliknięciu „Ruszajmy”, bezpośrednio po wyborze `PL` / `EN` oraz po przejściu tabulatorem do przycisku. Klawisze jazdy mają od razu przekazać fokus do świata lub toru i sterować autem. `H` i `L` również działają po wyborze języka. `Enter` i `Spacja` na przycisku zachowują jego zwykłą aktywację, a otwarty dialog i edycja pola blokują jazdę. Puszczenie klawisza, pauza i utrata fokusu okna nie mogą zostawiać wciśniętego gazu.

Sprawdź zmianę otoczenia i aktywności pomiędzy etapami: dzieci i siatkówkę przy technikum, życie kampusu w Rzeszowie, wręczenie nagrody na podium 1–2–3 z Damianem na drugim miejscu, toruńskie projektowanie UI oraz warszawską pracę z .NET i CRM. Scenki w dialogach obejmują też prowadzenie zajęć na sali. Wybór pytania może zmienić scenę, a przycisk odtworzenia rozpoczyna ją od początku.

Początkowo droga jest wąska i szutrowa. Dalej pojawia się asfalt z dwoma pasami, a na odcinku warszawskim cztery pasy z rozdzieleniem kierunków. Sprawdź też mijane samochody i sygnalizację. `road-layout.js` jest wspólnym źródłem szerokości i liczby pasów dla świata i mapy.

W dialogu sprawdź mruganie, zmianę mimiki po wyborze pytania i ruch ust powiązany z odsłanianiem tekstu. „Pokaż cały tekst” pomija odsłanianie. Gra nie generuje głosu; opcjonalne dźwięki gry są odrębne od animacji. Wspólny przełącznik w oknie sterowania, dostępnym także z pauzy, obejmuje postać, scenki oraz animacje życia otoczenia. Ustawienie systemowe ograniczające ruch (`prefers-reduced-motion`) zatrzymuje animacje i odsłania tekst od razu.

## Samochody, sterowanie i tor

| Funkcja | Klawiatura | Telefon / tablet |
| --- | --- | --- |
| Gaz, hamowanie i cofanie | `↑` / `W`, `↓` / `S` | Przyciski gazu i cofania |
| Skręt | `←` / `A`, `→` / `D` | Przyciski kierowania |
| Rozmowa lub wejście na tor w strefie | `E` / `Enter` | „Porozmawiaj” lub przycisk wjazdu |
| Mapa | `M` | Przycisk mapy |
| Klakson | `H` | Przycisk klaksonu |
| Światła | `L` | Przełącznik świateł |
| Hamulec ręczny na torze | `Spacja` | Przycisk driftu |
| Pauza | `Esc` | Przycisk pauzy |

Na początku jedzie taxi. Sam przejazd przez UCI lub Netwise nie zmienia pojazdu. Garaż C-Maxa znajduje się po lewej stronie w okolicy `5650`, a garaż Focusa po prawej w okolicy `10880`. Podjedź ręcznie albo wybierz dojazd do garażu z karty jazdy przy pobliskim etapie. W strefie `E`, `Enter` lub dotykowa interakcja otwiera historię auta. Świadomy wybór pojazdu uruchamia animację przesiadki trwającą około 0,9 sekundy. Sprawdź, czy zmiana zostaje zapisana i czy po powrocie do wcześniejszych dat wybrane auto pozostaje dostępne.

C-Max jest pierwszym własnym samochodem Damiana: rocznik 2009, czarny, diesel 115 KM, prawie 200 000 km przebiegu w chwili zakupu. Focus ST to rocznik 2018, import z USA, szaro-perłowy hatchback z benzynowym silnikiem turbo. Seryjnie 250 KM, po modyfikacjach ponad 300 KM, cena 70 000 zł. Opowieść wyjaśnia marzenie o Focusie RS, inspirację Kenem Blockiem i częściowe spełnienie tego marzenia przez ST. Etapy UCI i Netwise nie są deklaracją dokładnych dat zakupu. Rysunki, przyspieszanie, sportowe detale i syntetyczne brzmienie rozróżniają pojazdy.

Za Netwise w okolicy `11420` jest oznaczony zjazd w prawo, prowadzący do bramy toru. Wjazd wymaga dojechania do jej strefy i skrętu lub interakcji `E` / `Enter`. Sprawdź osobno taxi, C-Maxa i Focusa: każdy wjeżdża jako ten sam model, z własnym wyglądem, dźwiękiem, przyspieszeniem i prędkością maksymalną. Focus jest najszybszy i jako jedyny ma efekty turbo oraz płomień wydechu. Sprawdź gaz ze skrętem i hamulcem ręcznym, punkty za rzeczywisty poślizg, ślady opon, dym, spowalniającą trawę i granice terenu. Okrążenie wymaga przejazdu kolejnych punktów kontrolnych; samo krążenie przy mecie nie nalicza kolejnych okrążeń. Przycisk „Wróć na trasę” wraca na drogę historii z tym samym autem. Przesiadka do innego modelu ustawia go w padoku bez poprzedniej prędkości, zachowując ukończone okrążenia i punkty sesji. Stan toru, punkty i okrążenia są tylko stanem bieżącej sesji i nie zmieniają liczby odkrytych rozdziałów.

Oba parkingi mają wytyczone asfaltowe podjazdy z obrzeżami i liniami prowadzącymi. `garage-layout.js` jest wspólnym źródłem trasy dla rysunku świata, klasyfikacji nawierzchni, autopilota i mapy. Dojazd prowadzi do pustej zatoki; samochód zaparkowany w drugiej pozostaje na swoim miejscu. Okno garażu pokazuje tylko dwa fizycznie obecne auta, a przyszłe modele nie są zapowiadane na liście ani podpisach mapy. Dane pierwszego auta są opisane raz, w osobnym akapicie technicznym.

## Dźwięki i muzyka

Focus ST ma mocniejsze niskie harmoniczne, bas podbity w okolicy 160 Hz i łagodniejszą górę pasma, także przy rozruchu i gaszeniu. Dodatkowe składowe niskiego środka zachowują charakter wydechu na telefonie. Częstotliwość silnika nadal odpowiada obrotom czterocylindrowego auta.

Włącz efekty i otwórz główny dialog. Wraz z literami powinno być słychać subtelne klikanie, przy wyciszonym silniku i muzyce podróży. Sprawdź wstęp, odpowiedź na pytanie oraz PL i EN. „Pokaż cały tekst”, zamknięcie dialogu i wyłączenie animacji zatrzymują klikanie; tekst pokazany od razu nie uruchamia serii dźwięków. Przełącznik efektów steruje również dźwiękiem pisania, niezależnie od muzyki.

Po włączeniu efektów sprawdź przesiadkę w obu garażach, także dotykiem na telefonie: najpierw gaśnie silnik poprzedniego auta, po przejściu słychać rozrusznik i zapłon nowego, a potem zwykłe wolne obroty. C-Max ma dłuższy rozruch i mechaniczny klekot diesla, Focus krótszy rozruch ze sportowym podbiciem obrotów. Przy wyłączonych animacjach pozostaje krótka przerwa między gaszeniem a rozruchem. Pauza, wyciszenie lub ukrycie karty anulują sekwencję; wczytanie zapisu jej nie uruchamia.

Muzyka i efekty są domyślnie włączone, bez osobnego uruchamiania w ustawieniach. Pierwsze kliknięcie, dotyk lub użycie klawiatury odblokowuje Web Audio; sam odczyt strony nie tworzy kontekstu audio, zgodnie z ograniczeniami autoplay. Głośnik otwiera ustawienia z przyciskiem „Wycisz wszystko” oraz osobnymi przełącznikami muzyki i efektów. Ustawienia trafiają do `career-drive:effects` i `career-drive:music` w localStorage, poza zapisem postępu. Sprawdź świeże wejście, start klawiaturą i dotykiem, osobne wyciszenie kanałów, oba wyciszone po odświeżeniu oraz ponowne włączenie. Zwykła interakcja nie może odwracać zapisanego wyciszenia. Przy niedostępnym localStorage ustawienia obowiązują w bieżącym otwarciu. Pauza i ukryta karta wyciszają odtwarzanie. Dialogi również wyciszają grę, z wyjątkiem wybranego tematu KultURaliów, podczas którego gra muzyka koncertowa, a silnik pozostaje cichy. Po przerwaniu kontekstu przez system mobilny kolejna interakcja może wznowić odtwarzanie, zachowując wybór kanałów.

Między Uniwersytetem a UCI, po prawej stronie drogi (`4750`), działa plenerowa scena KultURaliów z zespołem, głośnikami, ruchomymi reflektorami i 56 uczestnikami. Podjazd do wydarzenia i `E` / `Enter` otwierają rozmowę ze znajomym z samorządu o współorganizowaniu imprez masowych, tworzeniu treści i komunikacji. Wspólne `festival.js` określa położenie wydarzenia dla świata, interakcji, mapy i odległościowego dźwięku. Po włączeniu muzyki lokalny rytm koncertowy płynnie narasta przy dojeździe i cichnie przy odjeździe. KultURalia i feniks.fm są odrębnymi spotkaniami po przeciwnych stronach drogi, z koncertem i studiem radiowym. Późniejszy etap ASBiR opowiada o administracji systemu i WordPressie.

Całość powstaje w lokalnym `AudioContext`: spokojna muzyka, neutralny silnik taxi, pulsujący diesel C-Maxa, sportowe brzmienie Focusa ST z turbo, klakson, poślizg i sygnały interfejsu. W Focusie szybkie odjęcie gazu powoduje blow-off i krótkie strzały wydechu, powiązane z animacją płomienia. Dźwięki są stylizowaną syntezą inspirowaną pojazdami, nie nagraniami silników konkretnych egzemplarzy. Nie są pobierane z banku audio, generowane przez usługę AI ani przesyłane do API. Po ponownym otwarciu strony użytkownik świadomie uruchamia odtwarzanie.

## Opcjonalne spotkania

W rozmowie o Kulturaliach sprawdź pytanie o opiekę nad artystami: kontakt, dbanie o ich samopoczucie i zapewnienie potrzebnych rzeczy oraz poznanie znanych wykonawców. Pytanie o skalę imprezy opisuje wielotysięczną publiczność i zapowiedź kilkunastu tysięcy uczestników w 2024 roku. Link źródłowy prowadzi do zapowiedzi edycji 2024 z wypowiedzią organizatora. Podana liczba jest oczekiwaniem frekwencji, bez przypisywania niepotwierdzonego rekordu 20 000 osób.

Rozmowy przy poboczu wymagają dojazdu do zatoczki po stronie danego miejsca, a następnie `E`, `Enter` lub dotykowej interakcji. Dostępność zależy od bliskości wzdłuż drogi i prawidłowej strony jezdni. Dekoracyjne ikony mapy wskazują te miejsca; nie teleportują samochodu.

| Miejsce | Pozycja na drodze | Strona |
| --- | --- | --- |
| Salon gier | `900` | Prawa |
| Wyróżnienie · 250 | `2350` | Lewa |
| KultURalia · imprezy masowe | `4750` | Prawa |
| feniks.fm · radio | `4850` | Lewa |
| Robot · gesty PJM | `7350` | Prawa |
| Przerwa na trening | `9900` | Prawa |

W „Przerwie na trening” sprawdź odpowiedź „Co jeszcze robisz po pracy?”: aktualnie przede wszystkim siłownia, ćwiczenia siłowe i kickboxing. Animacja pokazuje ruch hantli, rąk i nogi oraz kołysanie worka po ciosie i kopnięciu. Przy wyłączonych animacjach pozostaje statyczna poza. Pytanie „A poza treningiem?” zachowuje pozostałe zainteresowania.

Każde spotkanie ma gotowy dialog PL/EN, pytania i animowaną ilustrację. Postacie NPC są fikcyjnymi przewodnikami opowieści, a odpowiedzi pochodzą z lokalnego `side-stories.js`; nie działa tu czat z modelem AI. Wybór tematów zmienia scenkę także w głównych dialogach: można zobaczyć między innymi dyplom i czapkę absolwenta, stypendium, AI i gesty PJM, bazy danych, automatyzację, projektowanie interfejsów oraz zajęcia na uczelni.

## Treść i zapis

Historia bazuje na publicznym CV, stronie „O mnie” oraz aktualizacjach biograficznych właściciela. Dziesięć przystanków rozdziela technikum, praktyki, rozpoczęcie studiów i kolejne etapy zawodowe. SSC Master jest pokazany w Toruniu jako etap pracy UI/UX Designera. Zajęcia na UR zakończyły się w październiku 2025. Nowy przystanek Netwise przedstawia obecną pracę programisty .NET i Dynamics 365 (CRM) w Warszawie, rozpoczętą w czerwcu 2026. Dat zakończenia innych ról nie dopisywano.

Wątek stypendium uwzględnia aktualizację właściciela: w 2019 roku znalazł się w gronie 250 najlepszych uczniów województwa świętokrzyskiego. Wątek pracy magisterskiej dotyczy platformy rozpoznającej gesty polskiego języka migowego w czasie rzeczywistym z użyciem uczenia maszynowego. Drugą nagrodę i temat pracy potwierdza [publikacja wyników konkursu SEP przy Politechnice Rzeszowskiej](https://sep.w.prz.edu.pl/dzialalnosc/konkursy/konkurs-2024-wyniki), dostępna także z okna spotkania. Robot jest postacią objaśniającą temat w grze, a nie urządzeniem, którego dotyczyła praca.

Narracja PL/EN jest samodzielną opowieścią w pierwszej osobie Damiana Jamrożego. W pobocznych spotkaniach interfejs rozdziela pytanie postaci i odpowiedź Damiana. Dialogi nie odsyłają do treści innego CV ani strony „O mnie”. Podpisy animacji opisują temat wspomnienia, bez komentarzy o adaptacji lub symulowaniu rozmów. Podium przedstawia drugie miejsce w konkursie prac dyplomowych w 2024 roku; droga, budynki i postacie tworzą stylizowaną scenografię.

Rysunkowy portret i arkusz mimiki powstały na podstawie publicznych zdjęć właściciela CV oraz wskazanego stylu ilustracji. Kolor oczu dostosowano do jego referencji. Portret statyczny `career-drive/assets/damian-character-hazel.png` oraz arkusz `career-drive/assets/damian-expression-sheet.png` muszą zostać opublikowane razem z modułem `portrait.js` i arkuszem `portrait.css`. Animacje odtwarza przeglądarka lokalnie; nie wymagają backendu, połączenia z API ani płatnych usług.

Wspólny język CV i gry: `localStorage.lang`, z pierwszeństwem `?lang=pl|en`. Aktualny zapis gry: `localStorage['career-drive:v4']`. Przechowuje odkryte rozdziały, wybrany etap i stan rozpoczęcia, pozycję wzdłuż głównej drogi (`distance`), położenie poprzeczne (`lane`), kierunek (`heading`), wybrany pojazd (`vehicle`) i posiadane auta (`ownedVehicles`). Taxi zawsze pozostaje wśród poznanych pojazdów. Przesiadka jest możliwa do auta stojącego na danym parkingu; poprzedni samochód zostaje w jego miejscu. Walidacja dopuszcza tylko znane identyfikatory pojazdów, usuwa duplikaty, odrzuca wybór nieposiadanego auta oraz ogranicza skończone wartości pozycji i kierunku. Preferencja animacji postaci, scen oraz otoczenia: `localStorage['career-drive:animations']` (`on` lub `off`). Dane pozostają w przeglądarce; wyczyszczenie danych witryny usuwa zapis. Gra działa także, gdy przeglądarka blokuje zapis.

Audio, tempo autopilota, spotkania poboczne, garaże i jazda na torze nie dodają obowiązkowych rozdziałów. Stan garażu i wybrane auto są zapisywane w v4; wyniki toru nie są trwale zapisywane.

Pole `garages` zachowuje zaparkowany pojazd i stan przesiadki osobno dla C-Maxa i Focusa, dzięki czemu odświeżenie odtwarza również auta pozostawione na parkingach.

Odczyt sprawdza kolejno `career-drive:v4`, `career-drive:v3`, `career-drive:v2` oraz `career-drive:v1`. Migracja v3 zachowuje odkryte rozdziały, wybrany etap, stan rozpoczęcia i pozycję wzdłuż drogi. Położenie poprzeczne i kierunek zaczynają się od zera, a pojazdem pozostaje taxi: poprzedni zapis nie zawierał ręcznych decyzji o pozyskaniu aut. Wszystkie starsze wersje mają początkowo tylko taxi w `ownedVehicles`.

Migracja v2 zachowuje pierwsze osiem etapów i przenosi dawny finał z indeksu 8 na 9. Fragment dawnego finału na drodze 10700–11000 jest przesuwany na 12000–12300; wcześniejsze pozycje pozostają bez zmian. Netwise jest nowym etapem i nie zostaje automatycznie oznaczony jako odkryty.

Zachowane odkrycia z v1 również są mapowane na aktualną trasę. Dawny łączony rozdział początkowy odpowiada technikum, praktykom i rozpoczęciu studiów, a dawny finał trafia do nowego finału. Zapis v1 nie zawierał pozycji samochodu, dlatego po migracji jazda zaczyna się na początku drogi. Istniejące klucze starszych zapisów pozostają dostępne, a aktualny v4 ma pierwszeństwo.

W przygotowanej wersji nie wykonano commita, push ani publikacji.

## Odłączenie gry

Usuń wyłącznie drugi element z `data-i18n="about.game"` w sekcji „O mnie” głównego `../index.html`. To wystarczy, aby ukryć wejście do gry. Istniejący przycisk „Poznaj mnie lepiej” pozostaje na miejscu.

Aby usunąć grę całkowicie, usuń dodatkowo katalog `game/` oraz opcjonalnie oba wpisy `about.game` z głównego `../content/javascript/lang.js`. Strona nie importuje żadnego kodu ani stylów z `game/` i nie wymaga tego katalogu do działania. Pozostawienie pustych wpisów tłumaczeń nie wpływa na stronę.

## GitHub Pages i niezależność

Publikuj obecną zawartość repozytorium z katalogu głównego, łącznie z `game/`. Nie zmieniaj źródła GitHub Pages na sam katalog gry. Nie jest wymagany build ani Node.js na hostingu. Względne adresy zachowują prefiks repozytorium także dla adresu `https://uzytkownik.github.io/repozytorium/`.

Wyjścia z gry prowadzą do `../../index.html?lang=pl` lub `?lang=en`, również w awaryjnym ekranie uruchamiania i bez JavaScript. Jedynym powiązaniem nawigacyjnym gry z portfolio są te odnośniki. Zapis rozgrywki korzysta z kluczy `career-drive:*`; preferencja `lang` jest współdzielona w obrębie tego samego origin. Jest to niezależność plików i kodu, a nie izolacja bezpieczeństwa osobnej domeny.
