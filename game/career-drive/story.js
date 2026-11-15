// @ts-check

/** @type {import('./types.js').Chapter[]} */
export const CHAPTERS = [
  {
    id: 'school',
    year: '2015',
    title: { pl: 'Pierwszy kierunek', en: 'Finding my direction' },
    subtitle: { pl: 'Technikum informatyczne · Staszów', en: 'IT technical school · Staszów' },
    tag: { pl: 'POCZĄTKI', en: 'BEGINNINGS' },
    intro: {
      pl: 'Cześć, jestem Damian. Naszą drogę zaczynamy w 2015 roku, gdy rozpocząłem technikum informatyczne w Zespole Szkół im. Stanisława Staszica w Staszowie. Zanim zacząłem tworzyć oprogramowanie, odkrywałem światy w grach. To od nich zaczęła się moja pasja do IT i marzenie o własnym studiu. Teraz chciałem poznać technologię także od środka. Wsiadasz? To dopiero początek.',
      en: 'Hi, I’m Damian. Our road starts in 2015, when I began IT technical school at the Stanisław Staszic Secondary School Complex in Staszów. Before building software, I explored worlds in games. That’s where my passion for IT and my dream of a game studio began. Now I wanted to understand technology from the inside, too. Coming along? We’re just getting started.'
    },
    questions: [
      {
        label: { pl: 'Co dały Ci gry?', en: 'What did games teach you?' },
        answer: {
          pl: 'Gry towarzyszą mi od szóstego roku życia. Pomogły mi uczyć się angielskiego, myśleć nieszablonowo i rozwijać kreatywność. Z czasem coraz bardziej interesowało mnie to, co dzieje się po drugiej stronie ekranu: jak tworzy się mechanikę, świat i opowieść.',
          en: 'Games have been part of my life since I was six. They helped me learn English, think beyond the obvious and develop my creativity. Eventually, I became fascinated by the other side of the screen: how people build the mechanics, the world and the story.'
        }
      },
      {
        label: { pl: 'Dlaczego technikum informatyczne?', en: 'Why an IT technical school?' },
        answer: {
          pl: 'Chciałem zrozumieć, jak działa komputer i jak tworzyć własne aplikacje. Uczyłem się sprzętu, sieci, stron internetowych i baz danych. Zdobyłem kwalifikacje E12, E13 i E14. W technikum zostałem do 2019 roku, a jeszcze w trakcie nauki trafiłem na praktyki frontendowe.',
          en: 'I wanted to understand how a computer works and how to build my own applications. I studied hardware, networks, websites and databases, earning the E12, E13 and E14 qualifications. I stayed at technical school until 2019 and had my first frontend internship while I was still studying.'
        }
      }
    ],
    takeaway: { pl: 'Ciekawość wyznacza kierunek.', en: 'Curiosity sets the direction.' },
    skills: ['IT', 'HTML', 'CSS', 'Databases']
  },
  {
    id: 'internship',
    year: '11.2017',
    title: { pl: 'Pierwsze linie kodu', en: 'First lines of code' },
    subtitle: { pl: 'Arkonsoft · praktyka frontendowa', en: 'Arkonsoft · frontend internship' },
    tag: { pl: 'PIERWSZA PRAKTYKA', en: 'FIRST INTERNSHIP' },
    intro: {
      pl: 'W listopadzie 2017 roku rozpocząłem praktyki w Arkonsoft. Przez listopad i grudzień poznawałem technologie webowe, przede wszystkim frontend. Nadal chodziłem do technikum, a już mogłem przyjrzeć się pracy nad tym, co użytkownik widzi na ekranie i z czego korzysta.',
      en: 'In November 2017, I started an internship at Arkonsoft. Through November and December, I explored web technologies, particularly frontend development. I was still at technical school and was getting a closer look at how people build the screens and interactions that users work with.'
    },
    questions: [
      {
        label: { pl: 'Na czym skupiała się praktyka?', en: 'What did the internship focus on?' },
        answer: {
          pl: 'Poznawałem technologie webowe i pracę frontend developera. W Arkonsoft spędziłem listopad i grudzień 2017 roku. Był to mój pierwszy taki kontakt z pracą zawodową, jeszcze podczas nauki w technikum.',
          en: 'I was learning web technologies and the work of a frontend developer. I spent November and December 2017 at Arkonsoft. It was my first experience of that kind of professional work, while I was still at technical school.'
        }
      },
      {
        label: { pl: 'Co lubisz we frontendzie?', en: 'What do you enjoy about frontend?' },
        answer: {
          pl: 'Lubię to, że kod od razu przekłada się na coś, czego ktoś będzie używał. Interesuje mnie zarówno działanie aplikacji, jak i jej wygląd. Z czasem do programowania dołączyło u mnie projektowanie UI/UX.',
          en: 'I like seeing code turn into something that another person will use. I care about how an application works and how it looks. Over time, UI/UX design became another part of my work alongside programming.'
        }
      }
    ],
    takeaway: { pl: 'Od korzystania do tworzenia.', en: 'From using things to building them.' },
    skills: ['Frontend', 'HTML', 'CSS', 'JavaScript']
  },
  {
    id: 'studies',
    year: '2019',
    title: { pl: 'Nowy rozdział w Rzeszowie', en: 'A new chapter in Rzeszów' },
    subtitle: { pl: 'Uniwersytet Rzeszowski · informatyka', en: 'University of Rzeszów · computer science' },
    tag: { pl: 'STUDIA I NOWE MIASTO', en: 'UNIVERSITY & A NEW CITY' },
    intro: {
      pl: 'W 2019 roku przeprowadziłem się z rodzinnej miejscowości do Rzeszowa, żeby studiować informatykę na Uniwersytecie Rzeszowskim. Po technikum przyszedł czas na nowe miasto i kolejny etap mojego życia.',
      en: 'In 2019, I moved from my hometown to Rzeszów to study computer science at the University of Rzeszów. After technical school, it was time for a new city and another chapter in my life.'
    },
    questions: [
      {
        label: { pl: 'Jaki kierunek wybrałeś?', en: 'What did you choose to study?' },
        answer: {
          pl: 'Wybrałem informatykę na Uniwersytecie Rzeszowskim, ze specjalizacją aplikacje internetowe. Studia inżynierskie trwały od 2019 do 2023 roku. Po ich ukończeniu zostałem na uczelni i kontynuowałem naukę na studiach magisterskich.',
          en: 'I chose computer science at the University of Rzeszów, specialising in web applications. My engineering degree ran from 2019 to 2023. After graduating, I stayed at the university to continue with a master’s degree.'
        }
      },
      {
        label: { pl: 'Zostałeś w Rzeszowie po studiach?', en: 'Did you stay in Rzeszów after university?' },
        answer: {
          pl: 'Tak. Bardzo polubiłem to miasto i mieszkam w nim do dziś. Przyjechałem na studia, a z czasem Rzeszów stał się moim domem.',
          en: 'Yes. I grew to love the city and still live here today. I came for university, and over time Rzeszów became my home.'
        }
      }
    ],
    takeaway: { pl: 'Przyjechałem na studia. Zostałem na dłużej.', en: 'I came for university. I made Rzeszów my home.' },
    skills: ['Computer Science', 'Web Applications', 'Learning']
  },
  {
    id: 'university',
    year: '01.2020',
    title: { pl: 'Technologia dla ludzi', en: 'Technology for people' },
    subtitle: { pl: 'Instytut Nauk Socjologicznych UR', en: 'Institute of Sociological Sciences, UR' },
    tag: { pl: 'PIERWSZA PRACA', en: 'FIRST IT ROLE' },
    intro: {
      pl: 'Tu zaczyna się moja zawodowa droga na Uniwersytecie Rzeszowskim. W styczniu 2020 roku dołączyłem do Instytutu Nauk Socjologicznych jako informatyk. Dbałem o infrastrukturę IT, administrowałem stronami instytutu i tworzyłem materiały graficzne. Łączyłem techniczną stronę pracy z tą wizualną - ten kierunek został ze mną na dłużej.',
      en: 'This is where my professional journey at the University of Rzeszów began. In January 2020, I joined the Institute of Sociological Sciences as an IT specialist. I maintained IT infrastructure, administered the institute’s websites and created graphic materials. I combined the technical side of the work with the visual side - a direction I would keep exploring.'
    },
    questions: [
      {
        label: { pl: 'Co obejmowała ta praca?', en: 'What did the role involve?' },
        answer: {
          pl: 'Infrastruktura, strony internetowe i projekty graficzne. To różne zadania, ale wspólny cel: wspierać pracę instytutu. Ten etap trwał do stycznia 2022 roku, kiedy przeszedłem do Uniwersyteckiego Centrum Informatyzacji.',
          en: 'Infrastructure, websites and graphic design. Different tasks with a shared purpose: supporting the institute’s work. This chapter lasted until January 2022, when I moved to the University IT Center.'
        }
      },
      {
        label: { pl: 'Kod czy grafika?', en: 'Code or visual design?' },
        answer: {
          pl: 'Lubię obie strony. Programowanie pozwala mi porządkować procesy, a grafika daje przestrzeń kreatywności. Projektowanie interfejsów stało się naturalnym miejscem spotkania tych zainteresowań. Chcę tworzyć kompletne rozwiązania: takie, które działają i są zrozumiałe dla użytkownika.',
          en: 'I enjoy both. Programming lets me improve processes, while graphic design gives me room to be creative. Interface design became a natural meeting point for these interests. I want to build complete solutions: ones that work and make sense to the people using them.'
        }
      }
    ],
    takeaway: { pl: 'Za każdą technologią stoi człowiek.', en: 'There’s a person behind every technology.' },
    skills: ['IT Support', 'Web', 'Graphic Design']
  },
  {
    id: 'systems',
    year: '01.2022',
    title: { pl: 'Pod powierzchnią', en: 'Beneath the surface' },
    subtitle: { pl: 'Uniwersyteckie Centrum Informatyzacji', en: 'University IT Center' },
    tag: { pl: 'SYSTEMY I DANE', en: 'SYSTEMS & DATA' },
    intro: {
      pl: 'W 2022 roku dołączyłem do Uniwersyteckiego Centrum Informatyzacji UR jako młodszy specjalista IT. Tu wchodzimy głębiej: bazy MSSQL, programowanie, systemy rekrutacyjne i dziekanatowe, dokumentacja oraz automatyzacja procesów. Lubię szukać miejsc, w których powtarzalną pracę można uprościć. To właśnie tam kod zaczyna dawać bardzo konkretny efekt.',
      en: 'In 2022, I joined the University IT Center at UR as a Junior IT Specialist. Here we go deeper: MSSQL databases, programming, admissions and student administration systems, documentation and process automation. I like finding places where repetitive work can be simplified. That’s where code starts making a very practical difference.'
    },
    questions: [
      {
        label: { pl: 'Z jakimi technologiami pracujesz?', en: 'Which technologies do you work with?' },
        answer: {
          pl: 'Pracuję przede wszystkim z MSSQL, SQL i T-SQL oraz HTML, CSS, JavaScript i PHP. Korzystam też z Pythona i C#/.NET. Nadzoruję systemy PCG, OTOBO i Contao, przygotowuję dokumentację i materiały szkoleniowe.',
          en: 'I mainly work with MSSQL, SQL and T-SQL, alongside HTML, CSS, JavaScript and PHP. I also use Python and C#/.NET. I oversee PCG systems, OTOBO and Contao, and prepare documentation and training materials.'
        }
      },
      {
        label: { pl: 'Dlaczego automatyzacja?', en: 'Why automation?' },
        answer: {
          pl: 'Często zastanawiam się, czy coś może działać prościej i sprawniej. Jeśli zadanie jest powtarzalne, szukam sposobu, by je zautomatyzować. W bazach danych skupiam się na administracji, projektowaniu, wydajności i bezpieczeństwie; skrypty pomagają połączyć te elementy w codziennej pracy.',
          en: 'I often wonder whether something could work more simply and efficiently. When a task repeats, I look for a way to automate it. With databases, I focus on administration, design, performance and security; scripts help bring these elements together in everyday work.'
        }
      }
    ],
    takeaway: { pl: 'Dobry kod odzyskuje czas.', en: 'Good code gives time back.' },
    skills: ['MSSQL', 'T-SQL', 'PHP', 'Automation']
  },
  {
    id: 'learning',
    year: '2023–2024',
    title: { pl: 'Wiedza w obiegu', en: 'Knowledge in motion' },
    subtitle: { pl: 'Rzeszów · dyplomy, nagroda i nauczanie', en: 'Rzeszów · degrees, an award and teaching' },
    tag: { pl: 'ROZWÓJ I EDUKACJA', en: 'LEARNING & TEACHING' },
    intro: {
      pl: 'W 2023 roku ukończyłem studia inżynierskie, a w 2024 uzyskałem tytuł magistra inżyniera informatyki. Równolegle dzieliłem się wiedzą: od października 2023 do maja 2024 prowadziłem zajęcia na Uniwersytecie Trzeciego Wieku UR, a od lutego do października 2025 byłem wykładowcą na Uniwersytecie Rzeszowskim.',
      en: 'I completed my engineering degree in 2023 and earned my MSc Eng. in computer science in 2024. I was also sharing knowledge: I taught at the University of the Third Age at UR from October 2023 to May 2024, then worked as a lecturer at the University of Rzeszów from February to October 2025.'
    },
    questions: [
      {
        label: { pl: 'Czego i kiedy uczyłeś?', en: 'What did you teach, and when?' },
        answer: {
          pl: 'Na Uniwersytecie Trzeciego Wieku UR, od października 2023 do maja 2024, prowadziłem podstawy informatyki i grafikę komputerową z wykorzystaniem Adobe Photoshop. Na Uniwersytecie Rzeszowskim uczyłem technologii informacyjnych od lutego do października 2025. Zakończyłem już pracę wykładowcy, ale doświadczenie przekazywania wiedzy zostało ze mną.',
          en: 'At the University of the Third Age at UR, from October 2023 to May 2024, I taught computer basics and computer graphics using Adobe Photoshop. At the University of Rzeszów, I taught Information Technologies from February to October 2025. My lecturer role has ended, but the experience of sharing knowledge stays with me.'
        }
      },
      {
        label: { pl: 'Jak wspominasz finał konkursu?', en: 'How do you remember the competition final?' },
        answer: {
          pl: '6 grudnia 2024 roku otrzymałem drugą nagrodę za pracę magisterską w 39. konkursie SEP na najlepsze prace absolwentów Politechniki Rzeszowskiej i Uniwersytetu Rzeszowskiego. Był to dla mnie ważny moment po zakończeniu magisterki. Uczelnia oznaczała dla mnie też działanie z innymi: w Kole Naukowym Informatyków UR prowadziłem sekcję grafiki komputerowej, warsztaty i angażowałem się w projekty.',
          en: 'On 6 December 2024, I received second prize for my master’s thesis in the 39th SEP competition for graduates of Rzeszów University of Technology and the University of Rzeszów. It was an important moment for me after finishing my master’s studies. University also meant working with other people: in the UR Computer Science Students’ Research Club, I led the computer graphics section, ran workshops and joined projects.'
        }
      }
    ],
    takeaway: { pl: 'Wiedza rośnie, gdy się nią dzielisz.', en: 'Knowledge grows when you share it.' },
    skills: ['Teaching', 'Photoshop', 'Web Applications']
  },
  {
    id: 'design',
    year: '03.2025',
    title: { pl: 'Po stronie użytkownika', en: 'On the user’s side' },
    subtitle: { pl: 'SSC Master · UI/UX Designer · Toruń', en: 'SSC Master · UI/UX Designer · Toruń' },
    tag: { pl: 'DESIGN I DOSTĘPNOŚĆ', en: 'DESIGN & ACCESSIBILITY' },
    intro: {
      pl: 'W marcu 2025 roku trafiłem do SSC Master w Toruniu jako UI/UX Designer. Projektowałem interfejsy aplikacji mobilnych i webowych. Przydawało mi się doświadczenie programistyczne, ale patrzyłem przede wszystkim na to, jak ktoś będzie korzystał z aplikacji. Pracowałem ze standardami WCAG i nad zwiększaniem dostępności.',
      en: 'In March 2025, I joined SSC Master in Toruń as a UI/UX Designer. I designed interfaces for mobile and web applications. My programming experience helped, while my main focus was on how people would use the application. I worked with WCAG standards and on improving accessibility.'
    },
    questions: [
      {
        label: { pl: 'Co łączy UX i programowanie?', en: 'How do UX and programming connect?' },
        answer: {
          pl: 'Lubię łączyć logikę rozwiązania z tym, jak ktoś będzie z niego korzystać. W SSC Master moją rolą było projektowanie UI/UX, a doświadczenie programistyczne pomagało mi rozmawiać o tym, jak interfejs ma działać. Nie traktuję wyglądu jako dodatku: czytelny interfejs jest częścią działającego produktu.',
          en: 'I like connecting a solution’s logic with the way someone will use it. My role at SSC Master was UI/UX design, and my programming experience helped me discuss how the interface should work. I don’t see visual design as an extra: a clear interface is part of a working product.'
        }
      },
      {
        label: { pl: 'Co jest dla Ciebie ważne w projekcie?', en: 'What matters to you in design?' },
        answer: {
          pl: 'Dopasowanie do grupy docelowej, czytelność i dostępność. Pracuję między innymi w Figmie, a w projektach uwzględniam design systemy. Zależy mi, by technologia wspierała cel użytkownika, niezależnie od tego, czy otworzy aplikację na komputerze, czy na telefonie.',
          en: 'Understanding the audience, clarity and accessibility. Figma is one of my tools, and design systems are part of my approach. I want technology to support the user’s goal, whether they open an application on a computer or on a phone.'
        }
      }
    ],
    takeaway: { pl: 'Dostępność jest częścią dobrego projektu.', en: 'Accessibility is part of good design.' },
    skills: ['Figma', 'UI/UX', 'WCAG', 'Design Systems']
  },
  {
    id: 'community',
    year: '03.2025',
    title: { pl: 'Za kulisami stron', en: 'Behind the websites' },
    subtitle: { pl: 'ASBiR · Poznań · administracja systemu', en: 'ASBiR · Poznań · system administration' },
    tag: { pl: 'ADMINISTRACJA I WORDPRESS', en: 'SYSTEM ADMINISTRATION & WORDPRESS' },
    intro: {
      pl: 'Od marca 2025 roku zajmuję się administracją systemu w ASBiR - Akademickiej Sieci Bezpieczeństwa i Równości z siedzibą w Poznaniu.',
      en: 'Since March 2025, I’ve worked in system administration at ASBiR, the Academic Network of Security and Equality, based in Poznań.'
    },
    questions: [
      {
        label: { pl: 'Za jakie strony odpowiadasz?', en: 'Which websites do you work on?' },
        answer: {
          pl: 'W ASBiR administruję asbir.pl. Stronę festiwaladr.pl stworzyłem, a do tego zajmuję się pracami serwisowymi.',
          en: 'At ASBiR I administer asbir.pl. I created festiwaladr.pl and also handle website maintenance.'
        }
      },
      {
        label: { pl: 'Czym zajmujesz się przy WordPressie?', en: 'What do you do with WordPress?' },
        answer: {
          pl: 'Tworzę i aktualizuję dedykowane wtyczki WordPress. Łączę tę pracę techniczną z potrzebami osób, które korzystają z tych stron i narzędzi.',
          en: 'I create and update custom WordPress plugins. I bring the technical work together with the needs of the people using those websites and tools.'
        }
      }
    ],
    takeaway: { pl: 'Dbam o to, żeby te strony służyły ludziom.', en: 'I help keep these websites useful to the people who use them.' },
    skills: ['WordPress', 'Website Administration', 'Plugin Development']
  },
  {
    id: 'netwise',
    year: '06.2026',
    title: { pl: 'Nowy kod, nowy rozdział', en: 'New code, a new chapter' },
    subtitle: { pl: 'Netwise · Warszawa · .NET i Dynamics 365', en: 'Netwise · Warsaw · .NET and Dynamics 365' },
    tag: { pl: 'OBECNIE · PROGRAMOWANIE', en: 'CURRENTLY · DEVELOPMENT' },
    intro: {
      pl: 'Czerwiec 2026. Docieramy do Warszawy i kolejnego etapu: zacząłem pracę w Netwise jako programista .NET i Dynamics 365 (CRM). Pracuję tam obecnie. Po drodze były uczelnia, bazy danych i projektowanie interfejsów - teraz doświadczenia z tych obszarów spotykają się w mojej codziennej pracy programistycznej.',
      en: 'June 2026. We reach Warsaw and a new chapter: I joined Netwise as a .NET and Dynamics 365 (CRM) developer. I currently work there. The road has taken us through university, databases and interface design - now those experiences meet in my day-to-day development work.'
    },
    questions: [
      {
        label: { pl: 'Czym zajmujesz się w Netwise?', en: 'What do you do at Netwise?' },
        answer: {
          pl: 'Od czerwca 2026 roku pracuję w Netwise w Warszawie jako programista .NET i Dynamics 365, w obszarze CRM. To moja obecna praca. Łączę w niej doświadczenie programistyczne z pracą przy danych i interfejsach.',
          en: 'Since June 2026, I have worked at Netwise in Warsaw as a .NET and Dynamics 365 developer in the CRM area. This is my current job. It brings together my programming experience and my work with data and interfaces.'
        }
      },
      {
        label: { pl: 'Co zabierasz z wcześniejszych etapów?', en: 'What do you bring from the earlier chapters?' },
        answer: {
          pl: 'Praktykę programowania i pracy z danymi, a także perspektywę użytkownika rozwijaną przy UI/UX. Doświadczenie wykładowcy nauczyło mnie też porządkować i jasno tłumaczyć informacje. Każdy z wcześniejszych przystanków zostawił coś, co mogę wykorzystać dalej.',
          en: 'Programming and data experience, alongside the user perspective I developed through UI/UX. Teaching also helped me organise and clearly explain information. Each earlier stop left me with something I can take forward.'
        }
      }
    ],
    takeaway: { pl: 'Warszawa. .NET. Dynamics 365. Historia trwa.', en: 'Warsaw. .NET. Dynamics 365. The story continues.' },
    skills: ['C#', '.NET', 'Dynamics 365', 'CRM']
  },
  {
    id: 'next',
    year: '→',
    title: { pl: 'Następny rozdział', en: 'The next chapter' },
    subtitle: { pl: 'Może napiszemy go razem?', en: 'Shall we write it together?' },
    tag: { pl: 'DALEJ W DROGĘ', en: 'THE ROAD AHEAD' },
    intro: {
      pl: 'Dotarliśmy do końca tej trasy, ale moja historia nadal się pisze. Łączę programowanie, bazy danych i projektowanie doświadczeń użytkownika. Tworzę aplikacje i automatyzacje, szukając rozwiązań, które mają sens dla ludzi. A marzenie o własnej grze i studiu? Wciąż jest na mapie. Może kolejny przystanek będzie naszym wspólnym projektem.',
      en: 'We’ve reached the end of this route, but my story is still being written. I combine programming, databases and user experience design. I build applications and automations, looking for solutions that make sense for people. And the dream of my own game and studio? It’s still on the map. Maybe the next stop will be a project we build together.'
    },
    questions: [
      {
        label: { pl: 'W czym możesz pomóc?', en: 'What can you help with?' },
        answer: {
          pl: 'Tworzę aplikacje webowe, automatyzuję procesy, projektuję UI/UX i pracuję z architekturą oprogramowania oraz bazami danych. Wykorzystuję też AI. Zaczynam od konkretnego problemu i rozmowy o tym, komu ma służyć rozwiązanie.',
          en: 'I build web applications, automate processes, design UI/UX and work with software architecture and databases. I also use AI. I start with a concrete problem and a conversation about the people the solution is meant to serve.'
        }
      },
      {
        label: { pl: 'Jak zacząć wspólny projekt?', en: 'How do we start a project together?' },
        answer: {
          pl: 'Napisz do mnie: djamrozy.cv@gmail.com. Opowiedz, jaki problem chcesz rozwiązać, dla kogo tworzymy produkt i co już masz. Przydadzą się też zakres, termin i budżet. To dobry początek rozmowy o tym, dokąd możemy pojechać dalej.',
          en: 'Email me at djamrozy.cv@gmail.com. Tell me what problem you want to solve, who the product is for and what you already have. Scope, timing and budget are useful too. That’s a good starting point for a conversation about where we could go next.'
        }
      }
    ],
    takeaway: { pl: 'Kolejny kierunek? Stwórzmy go razem.', en: 'The next direction? Let’s build it together.' },
    skills: ['Software', 'Design', 'AI', 'Collaboration']
  }
];

export const COPY = {
  pl: {
    title: 'Career Drive · Damian Jamroży',
    subtitle: 'INTERAKTYWNA PODRÓŻ',
    backCv: 'Wyjdź z podróży',
    language: 'Język gry',
    journey: 'Moja droga',
    journeyHint: 'Jedna droga. Daty, miejsca i kolejne rozdziały.',
    discovered: 'Odkryte rozdziały',
    nextStop: 'Następny przystanek',
    driveTo: 'Jedź tutaj',
    start: 'Ruszajmy',
    resume: 'Kontynuuj podróż',
    explore: 'Swobodna jazda',
    talk: 'Porozmawiaj',
    chooseQuestion: 'O co chcesz zapytać?',
    showFullText: 'Pokaż cały tekst',
    continue: 'Dalej w drogę',
    finishChapter: 'Odkryj rozdział',
    chapterComplete: 'Przystanek odkryty',
    story: 'Czytaj historię',
    map: 'Mapa podróży',
    mapTitle: 'Moja droga przez czas',
    mapHint: 'Wybierz datę na mapie, a samochód sam zawiezie Cię do tego rozdziału.',
    mapKicker: 'DATY, KTÓRE WYZNACZAJĄ KIERUNEK',
    openMap: 'Otwórz mapę (M)',
    closeMap: 'Zamknij mapę',
    driveChosen: 'Jedź do wybranego punktu',
    nextMilestone: 'Kolejny etap',
    location: 'Miejsce',
    timeRoad: 'Droga przez czas',
    routeStart: 'Początek drogi',
    routeEnd: 'Dalej piszemy historię',
    portraitAnimations: 'Animacje scen i postaci',
    portraitAnimationsOn: 'Włącz animacje scen i postaci',
    portraitAnimationsOff: 'Wyłącz animacje scen i postaci',
    chapterLabel: 'Etap podróży',
    controls: 'Sterowanie',
    controlsTitle: 'Ty wybierasz tempo',
    controlsIntro: 'Jedź drogą przez kolejne lata mojej historii. Rozmowę rozpoczniesz sam w oznaczonej strefie przy dacie. Możesz swobodnie przejechać dalej. Za Netwise czeka boczny tor z serpentynami.',
    controlsDrive: '↑ / W - przyspiesz; ↓ / S - hamuj lub cofaj',
    controlsSteer: '← → / A D - skręcaj autem, także poza jezdnią',
    controlsMap: 'M - otwórz mapę i wybierz cel',
    controlsInteract: 'E / Enter - rozmowa w strefie lub wjazd na tor',
    controlsPause: 'Escape - pauza lub zamknięcie okna',
    controlsMobile: 'Na telefonie i tablecie używaj przycisków jazdy. Przycisk mapy otwiera tę samą trasę co klawisz M.',
    controlsAutopilot: 'Wybierz datę na mapie. Autopilot zaparkuje przy niej, a rozmowę rozpoczniesz E, Enterem lub przyciskiem. Na tor skręć w prawo za Netwise albo wybierz wjazd w oznaczonej strefie.',
    close: 'Zamknij',
    pause: 'Pauza',
    paused: 'Chwila postoju',
    pausedHint: 'Podróż poczeka. Wróć, gdy będziesz gotów.',
    restart: 'Zacznij od nowa',
    restartConfirm: 'Rozpocząć nową podróż? Zapisane odkrycia zostaną wyzerowane.',
    soundOn: 'Włącz dźwięk',
    soundOff: 'Wyłącz dźwięk',
    sound: 'Dźwięk',
    saved: 'Postęp zapisuje się na tym urządzeniu',
    saveUnavailable: 'Zapis w tej przeglądarce jest niedostępny. Możesz nadal grać.',
    progress: 'Postęp podróży',
    welcomeKicker: 'TY PROWADZISZ',
    welcomeTitle: 'Poznaj mnie po drodze.',
    welcomeText: 'Od Staszowa, przez Rzeszów i Toruń, po Warszawę. Jedź ze mną przez kolejne lata.',
    welcomeHint: 'Bez pośpiechu. Twoja trasa.',
    destination: 'Cel podróży',
    arriving: 'Jesteś na miejscu',
    freeDrive: 'Swobodna jazda',
    autopilot: 'Autopilot',
    allComplete: 'To początek kolejnej historii.',
    allCompleteText: 'Dzięki za wspólną podróż. Znasz już moją drogę - porozmawiajmy o tym, co możemy stworzyć razem.',
    contact: 'Napisz do mnie',
    viewCv: 'Zakończ podróż',
    replay: 'Wróć na mapę',
    reduceMotion: 'Ograniczony ruch',
    keyboardHint: 'WASD / strzałki · jazda     M · mapa     E / Enter · rozmowa     H · klakson     L · światła     Spacja · drift na torze',
    mobileHint: 'Steruj przyciskami lub otwórz mapę i wybierz datę.',
    chapter: 'Rozdział',
    answerBack: 'Inne pytanie',
    portraitAlt: 'Damian Jamroży - opowiadam swoją historię',
    mapAlt: 'Droga przez kolejne lata mojej historii. Steruj strzałkami lub otwórz mapę klawiszem M, by wybrać datę i automatycznie dojechać do przystanku.',
    skipDriving: 'Przejdź do historii',
    sourceNote: 'Opowiadam o miejscach, ludziach i decyzjach, które doprowadziły mnie do tego, co robię dzisiaj.',
    loading: 'Przygotowuję trasę…',
    loadError: 'Nie udało się uruchomić mapy. Możesz poznać historię, wybierając przystanki z listy.',
    routeKicker: 'MIEJSCA, KTÓRE MNIE UKSZTAŁTOWAŁY',
    heroFirst: 'Każda droga ma',
    heroSecond: 'swoją historię.',
    heroDescription: 'Staszów, Rzeszów, Toruń, Warszawa. Od ciekawości do tworzenia.',
    mapCredit: 'KOLEJNE LATA. PRAWDZIWA HISTORIA.',
    yourGuide: 'TWÓJ PRZEWODNIK',
    driveLabel: 'jazda',
    turnLeft: 'Kieruj w lewo',
    turnRight: 'Kieruj w prawo',
    reverse: 'Cofaj / hamuj',
    accelerate: 'Przyspiesz',
    chapterVisited: 'Odkryty rozdział',
    mobileControls: 'Dotykowe sterowanie samochodem',
    moreOptions: 'Więcej',
    journeyOptions: 'Opcje podróży',
    joystick: 'Drążek sterowania samochodem',
    joystickInstructions: 'Przesuń drążek w górę, aby jechać, w dół, aby hamować lub cofać, i na boki, aby skręcać. Puść, aby zwolnić. Możesz też używać strzałek na klawiaturze.',
    joystickHelp: 'Drążek: góra - gaz, dół - hamulec i cofanie, boki - skręt. Po puszczeniu auto zwalnia. Przyciski jazdy włączysz w menu „Więcej”.',
    buttonDriving: 'Sterowanie przyciskami',
    noStop: 'Podjedź bliżej przystanku lub otwórz mapę i wybierz datę.',
    yourVehicle: 'TWOJE AUTO',
    driveGarage: 'Podjedź do parkingu',
    garageKicker: 'CZTERY KÓŁKA, WŁASNA HISTORIA',
    garageChoose: 'Wybierz auto',
    garagePick: 'Przesiądź się',
    garageZone: 'Parking - E / Enter',
    garageCurrent: 'Jedziesz tym autem',
    garageElsewhere: 'Czeka na drugim parkingu',
    garageLocked: 'Do odkrycia na jego parkingu',
    garageBoarded: 'Kluczyki w dłoń. Jedziemy dalej!',
    garageDrive: 'Autopilot - parking',
    travelSpeed: 'Tempo autopilota',
    travelNormal: 'Spokojnie · 1×',
    travelFast: 'Szybki przejazd · 3×',
    sideKicker: 'SPOTKANIE PO DRODZE',
    sideIllustration: 'Spotkanie przy drodze',
    dialogueDamian: 'Damian Jamroży',
    dialogueEncounter: 'Rozmowa przy drodze',
    sideHint: 'Poboczne spotkanie · E / Enter',
    sideNearby: 'Ktoś czeka przy poboczu. Zjedź do zatoczki po jego stronie.',
    discoverSide: 'Porozmawiaj',
    horn: 'Klakson (H)',
    lights: 'Światła (L)',
    lightsOn: 'Światła włączone',
    lightsOff: 'Światła wyłączone',
    drift: 'Hamulec ręczny / drift',
    controlsDrift: 'Spacja - hamulec ręczny w zakręcie, na drodze i torze',
    zoneReady: 'Strefa rozmowy · E / Enter',
    zoneArrival: 'Jesteś przy przystanku. E / Enter rozpocznie rozmowę.',
    trackEntry: 'Wjazd na tor',
    trackZone: 'Tor serpentyn · skręć w prawo lub E / Enter',
    trackTitle: 'Tor serpentyn',
    trackKicker: 'TOR',
    trackDescription: 'Swobodna jazda i drift',
    trackAlt: 'Zamknięty tor serpentyn. Strzałki lub WASD prowadzą auto, Spacja uruchamia hamulec ręczny. Na telefonie użyj przycisków. Przycisk Wróć na trasę opuszcza tor.',
    trackDriveHint: 'Gaz + skręt + Spacja · drift',
    drifting: 'DRIFT · trzymaj linię!',
    leaveTrack: 'Wróć na trasę',
    laps: 'Okrążenia',
    driftScore: 'Punkty driftu',
    trackWelcome: 'Witaj na torze. Znajdź swoją linię i sprawdź auto na zakrętach.',
    trackReturn: 'Wracasz na drogę historii.',
    trackMapHint: 'Przy UCI i Netwise zajrzyj na parking, żeby zmienić auto i poznać jego historię. Za Netwise czeka zjazd w prawo na tor. Wjedziesz tam dowolnym autem.',
    audioSettings: 'Dźwięk i muzyka',
    audioKicker: 'DOBRE BRZMIENIE PODRÓŻY',
    audioIntro: 'Muzyka i efekty włączają się wraz z rozpoczęciem gry. Tutaj możesz je wyciszyć razem lub osobno. Zapamiętam Twój wybór.',
    audioEnableAll: 'Włącz dźwięki i muzykę',
    audioMuteAll: 'Wycisz wszystko',
    effectsOn: 'Włącz efekty',
    effectsOff: 'Wyłącz efekty',
    musicOn: 'Włącz muzykę',
    musicOff: 'Wyłącz muzykę',
    audioPlaying: 'Gotowe. Dźwięk wróci po zamknięciu tego okna.',
    audioMuted: 'Muzyka i efekty wyłączone.',
    audioNote: 'Oryginalna muzyka i stylizowane brzmienia generowane lokalnie. Każdy samochód ma własny charakter i dźwięk silnika. Dźwięki zatrzymują się podczas pauzy i po opuszczeniu karty.',
    nextChapter: 'Następny rozdział',
    skipToGame: 'Przejdź do gry',
    howToPlay: 'JAK GRAĆ',
    journeyComplete: 'PODRÓŻ UKOŃCZONA',
    soundUnavailable: 'Dźwięk jest niedostępny w tej przeglądarce.',
    skillSoftwareEngineering: 'Inżynieria oprogramowania',
    skillDatabases: 'Bazy danych',
    skillTeaching: 'Nauczanie',
    skillCommunity: 'Społeczność',
    sceneSchool: 'Szkolne boisko · Staszów',
    sceneInternship: 'Pierwsze projekty frontendowe',
    sceneStudies: 'Nowe miasto · Rzeszów',
    sceneUniversity: 'Praca na uczelni · Rzeszów',
    sceneSystems: 'Systemy i dane · UCI',
    sceneAward: '2024 · finał konkursu SEP',
    sceneDesign: 'Szkice interfejsów · Toruń',
    sceneCommunity: 'ASBiR · Poznań',
    sceneNetwise: '.NET i Dynamics 365 · Warszawa',
    sceneNext: 'Kolejny rozdział jeszcze przed nami',
    sceneIllustrationNote: 'Wspomnienie z podróży',
    sceneReplay: 'Zobacz jeszcze raz',
    sceneLecture: 'Zajęcia na Uniwersytecie Rzeszowskim'
  },
  en: {
    title: 'Career Drive · Damian Jamroży',
    subtitle: 'AN INTERACTIVE JOURNEY',
    backCv: 'Leave the journey',
    language: 'Game language',
    journey: 'My journey',
    journeyHint: 'One road. Dates, places and new chapters.',
    discovered: 'Chapters discovered',
    nextStop: 'Next stop',
    driveTo: 'Drive here',
    start: 'Let’s drive',
    resume: 'Continue the journey',
    explore: 'Free drive',
    talk: 'Let’s talk',
    chooseQuestion: 'What would you like to ask?',
    showFullText: 'Show full text',
    continue: 'Back on the road',
    finishChapter: 'Discover chapter',
    chapterComplete: 'Stop discovered',
    story: 'Read the story',
    map: 'Journey map',
    mapTitle: 'My road through time',
    mapHint: 'Choose a date on the map and the car will drive you to that chapter.',
    mapKicker: 'DATES THAT SHAPE THE DIRECTION',
    openMap: 'Open map (M)',
    closeMap: 'Close map',
    driveChosen: 'Drive to the selected stop',
    nextMilestone: 'Next milestone',
    location: 'Location',
    timeRoad: 'The road through time',
    routeStart: 'The beginning of the road',
    routeEnd: 'The story continues',
    portraitAnimations: 'Scene and character animation',
    portraitAnimationsOn: 'Turn scene and character animation on',
    portraitAnimationsOff: 'Turn scene and character animation off',
    chapterLabel: 'Journey chapter',
    controls: 'Controls',
    controlsTitle: 'You set the pace',
    controlsIntro: 'Follow the road through the years of my story. Start a conversation yourself in the marked zone by a date, or keep driving. A side circuit with hairpins awaits after Netwise.',
    controlsDrive: '↑ / W - accelerate; ↓ / S - brake or reverse',
    controlsSteer: '← → / A D - steer the car, on and off the road',
    controlsMap: 'M - open the map and choose a destination',
    controlsInteract: 'E / Enter - talk in a zone or enter the circuit',
    controlsPause: 'Escape - pause or close a window',
    controlsMobile: 'On a phone or tablet, use the driving buttons. The map button opens the same route as the M key.',
    controlsAutopilot: 'Choose a date on the map. Autopilot parks beside it; press E, Enter or the talk button to start a conversation. After Netwise, turn right into the circuit or use the entry button in its marked zone.',
    close: 'Close',
    pause: 'Pause',
    paused: 'A little pit stop',
    pausedHint: 'The journey can wait. Come back when you’re ready.',
    restart: 'Start again',
    restartConfirm: 'Start a new journey? Your saved discoveries will be reset.',
    soundOn: 'Turn sound on',
    soundOff: 'Turn sound off',
    sound: 'Sound',
    saved: 'Progress is saved on this device',
    saveUnavailable: 'Saving is unavailable in this browser. You can still play.',
    progress: 'Journey progress',
    welcomeKicker: 'YOU TAKE THE WHEEL',
    welcomeTitle: 'Get to know me on the way.',
    welcomeText: 'From Staszów, through Rzeszów and Toruń, to Warsaw. Take a drive with me through the years.',
    welcomeHint: 'No rush. This is your journey.',
    destination: 'Destination',
    arriving: 'You’ve arrived',
    freeDrive: 'Free drive',
    autopilot: 'Autopilot',
    allComplete: 'The next story starts here.',
    allCompleteText: 'Thanks for sharing the journey. Now you know my story - let’s talk about what we could build together.',
    contact: 'Email me',
    viewCv: 'Finish the journey',
    replay: 'Back to the map',
    reduceMotion: 'Reduced motion',
    keyboardHint: 'WASD / arrows · drive     M · map     E / Enter · talk     H · horn     L · lights     Space · circuit drift',
    mobileHint: 'Use the driving buttons or open the map and choose a date.',
    chapter: 'Chapter',
    answerBack: 'Another question',
    portraitAlt: 'Damian Jamroży - telling my story',
    mapAlt: 'A road through the years of my story. Drive with the arrow keys or open the map with M to choose a date and travel to that stop automatically.',
    skipDriving: 'Go to the story',
    sourceNote: 'I’m sharing the places, people and decisions that brought me to what I do today.',
    loading: 'Getting the route ready…',
    loadError: 'The map could not start. You can still explore the story by choosing stops from the list.',
    routeKicker: 'THE PLACES THAT SHAPED ME',
    heroFirst: 'Every road has',
    heroSecond: 'a story to tell.',
    heroDescription: 'Staszów, Rzeszów, Toruń, Warsaw. From curiosity to creation.',
    mapCredit: 'PASSING YEARS. A REAL STORY.',
    yourGuide: 'YOUR GUIDE',
    driveLabel: 'drive',
    turnLeft: 'Steer left',
    turnRight: 'Steer right',
    reverse: 'Reverse / brake',
    accelerate: 'Accelerate',
    chapterVisited: 'Discovered chapter',
    mobileControls: 'Touch driving controls',
    moreOptions: 'More',
    journeyOptions: 'Journey options',
    joystick: 'Driving joystick',
    joystickInstructions: 'Move the joystick up to accelerate, down to brake or reverse, and sideways to steer. Release to slow down. You can also use the keyboard arrow keys.',
    joystickHelp: 'Joystick: up to accelerate, down to brake or reverse, sideways to steer. Release to slow down. Enable driving buttons in the More menu.',
    buttonDriving: 'Driving buttons',
    noStop: 'Drive closer to a stop or open the map and choose a date.',
    yourVehicle: 'YOUR CAR',
    driveGarage: 'Drive to the parking area',
    garageKicker: 'FOUR WHEELS, A PERSONAL STORY',
    garageChoose: 'Choose your car',
    garagePick: 'Change car',
    garageZone: 'Parking area - E / Enter',
    garageCurrent: 'You are driving this car',
    garageElsewhere: 'Waiting at the other parking area',
    garageLocked: 'Discover it at its parking area',
    garageBoarded: 'Keys in hand. Back on the road!',
    garageDrive: 'Autopilot - parking area',
    travelSpeed: 'Autopilot pace',
    travelNormal: 'Relaxed · 1×',
    travelFast: 'Quick journey · 3×',
    sideKicker: 'AN ENCOUNTER ALONG THE WAY',
    sideIllustration: 'An encounter along the road',
    dialogueDamian: 'Damian Jamroży',
    dialogueEncounter: 'A conversation by the road',
    sideHint: 'Side encounter · E / Enter',
    sideNearby: 'Someone is waiting by the road. Pull over on their side.',
    discoverSide: 'Let’s talk',
    horn: 'Horn (H)',
    lights: 'Headlights (L)',
    lightsOn: 'Headlights on',
    lightsOff: 'Headlights off',
    drift: 'Handbrake / drift',
    controlsDrift: 'Space - handbrake through a corner, on the road or circuit',
    zoneReady: 'Conversation zone · E / Enter',
    zoneArrival: 'You are beside a stop. E / Enter starts the conversation.',
    trackEntry: 'Enter the circuit',
    trackZone: 'Hairpin circuit · turn right or E / Enter',
    trackTitle: 'Hairpin circuit',
    trackKicker: 'CIRCUIT',
    trackDescription: 'Free driving and drift',
    trackAlt: 'A closed hairpin circuit. Arrow keys or WASD drive the car, Space applies the handbrake. Use the buttons on a phone. Return to the road leaves the circuit.',
    trackDriveHint: 'Throttle + steer + Space · drift',
    drifting: 'DRIFT · hold your line!',
    leaveTrack: 'Return to the road',
    laps: 'Laps',
    driftScore: 'Drift points',
    trackWelcome: 'Welcome to the circuit. Find your line and try the car through the corners.',
    trackReturn: 'Back on the road through my story.',
    trackMapHint: 'Visit the parking areas by UCI and Netwise to change cars and hear their stories. After Netwise, take the right-hand exit to the circuit. Every car can enter.',
    audioSettings: 'Sound and music',
    audioKicker: 'THE SOUND OF THE JOURNEY',
    audioIntro: 'Music and effects start when you begin playing. You can mute them together or separately here. I will remember your choice.',
    audioEnableAll: 'Enable sound and music',
    audioMuteAll: 'Mute all',
    effectsOn: 'Enable effects',
    effectsOff: 'Disable effects',
    musicOn: 'Enable music',
    musicOff: 'Disable music',
    audioPlaying: 'Ready. Audio resumes when you close this window.',
    audioMuted: 'Music and effects are off.',
    audioNote: 'Original music and stylised engines are generated locally. Each car has its own character and engine sound. Audio pauses with the game and when you leave the tab.',
    nextChapter: 'Next chapter',
    skipToGame: 'Skip to game',
    howToPlay: 'HOW TO PLAY',
    journeyComplete: 'JOURNEY COMPLETE',
    soundUnavailable: 'Sound is unavailable in this browser.',
    skillSoftwareEngineering: 'Software Engineering',
    skillDatabases: 'Databases',
    skillTeaching: 'Teaching',
    skillCommunity: 'Community',
    sceneSchool: 'The school court · Staszów',
    sceneInternship: 'First frontend projects',
    sceneStudies: 'A new city · Rzeszów',
    sceneUniversity: 'Working at university · Rzeszów',
    sceneSystems: 'Systems and data · University IT Center',
    sceneAward: '2024 · SEP competition final',
    sceneDesign: 'Interface sketches · Toruń',
    sceneCommunity: 'ASBiR · Poznań',
    sceneNetwise: '.NET and Dynamics 365 · Warsaw',
    sceneNext: 'The next chapter is still ahead',
    sceneIllustrationNote: 'A memory from the journey',
    sceneReplay: 'See it again',
    sceneLecture: 'Teaching at the University of Rzeszów'
  }
};
