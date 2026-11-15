// @ts-check
import { FESTIVAL } from './festival.js';

/** @typedef {{pl:string,en:string}} Localized */
/** @typedef {{label:Localized,answer:Localized,topic:string}} SideQuestion */
/** @typedef {{id:string,chapterId:string,distance:number,side:-1|1,offset?:number,kind:'games'|'scholarship'|'music'|'festival'|'robot'|'sport',label:Localized,speaker:Localized,greeting:Localized,topic:string,intro:Localized,questions:SideQuestion[],source?:{label:Localized,url:string}}} SideStory */

/** Optional conversations beside the main route. @type {SideStory[]} */
export const SIDE_STORIES = [
  {
    id:'games',chapterId:'school',distance:900,side:1,kind:'games',topic:'games',
    label:{pl:'Salon gier',en:'Games corner'},speaker:{pl:'Gracz przy automacie',en:'A fellow player'},
    greeting:{pl:'Hej, Damian! Co było pierwsze: granie czy programowanie?',en:'Hey, Damian! What came first: playing games or programming?'},
    intro:{pl:'Zdecydowanie granie. Zanim napisałem pierwszy kod, spędzałem czas w światach stworzonych przez innych. W końcu zacząłem się zastanawiać, jak samemu zrobić coś takiego. Tak zaczęła się moja fascynacja IT i marzenie o własnym studiu gier.',en:'Playing games, definitely. Before I wrote my first line of code, I spent time in worlds other people had built. Eventually I started wondering how to make something like that myself. That is where my interest in IT and the dream of a game studio began.'},
    questions:[
      {label:{pl:'Jaką grę chciałbyś stworzyć?',en:'What sort of game would you like to make?'},answer:{pl:'Chciałbym mieć własne studio i łączyć w nim programowanie z opowiadaniem historii. Lubię wymyślać światy, postacie i to, co może się im przydarzyć. Zależy mi też na tym, jak gracz będzie się w takim świecie czuł.',en:'I would love to have my own studio and combine programming with storytelling. I enjoy imagining worlds, characters and the things that might happen to them. I also care about how it feels to be a player in that world.'},topic:'games'},
      {label:{pl:'Czy kreatywność pomaga Ci w IT?',en:'Does creativity help you in IT?'},answer:{pl:'Bardzo. Lubię wymyślać rozwiązanie, ale równie mocno interesuje mnie to, jak będzie wyglądało i jak ktoś z niego skorzysta. Dlatego obok programowania zajmuję się grafiką i projektowaniem interfejsów.',en:'Very much. I enjoy figuring out a solution, but I am just as interested in how it will look and how someone will use it. That is why I work with graphics and interface design alongside programming.'},topic:'graphics'}
    ]
  },
  {
    id:'scholarship',chapterId:'studies',distance:2350,side:-1,kind:'scholarship',topic:'scholarship',
    label:{pl:'Wyróżnienie · 250',en:'Scholarship · 250'},speaker:{pl:'Opiekun szkolnej gabloty',en:'The school display guide'},
    greeting:{pl:'Damian, to Twój dyplom w gablocie? Opowiesz, za co go dostałeś?',en:'Damian, is that your certificate in the display? What did you receive it for?'},
    intro:{pl:'Tak. W 2019 roku dostałem Stypendium Marszałka Województwa Świętokrzyskiego. Znalazłem się wśród 250 najlepszych uczniów województwa. W tym samym roku kończyłem technikum i szykowałem się do rozpoczęcia studiów w Rzeszowie.',en:'Yes. In 2019 I received the Marshal of Świętokrzyskie Voivodeship Scholarship. I was among 250 top students in the region. That same year I was finishing technical school and getting ready to begin university in Rzeszów.'},
    questions:[
      {label:{pl:'Co wybrałeś po technikum?',en:'What did you choose after technical school?'},answer:{pl:'Informatykę na Uniwersytecie Rzeszowskim. W 2019 roku skończyłem technikum w Staszowie i zacząłem studia ze specjalizacją aplikacje internetowe. Później zostałem na uczelni także na studiach magisterskich.',en:'Computer science at the University of Rzeszów. In 2019 I finished technical school in Staszów and began a degree specialising in web applications. Later I stayed at university for a master’s degree as well.'},topic:'graduation'},
      {label:{pl:'Jakie kwalifikacje wtedy zdobyłeś?',en:'Which qualifications did you earn?'},answer:{pl:'Zdobyłem E12, E13 i E14. Uczyłem się sprzętu komputerowego, sieci, aplikacji internetowych i baz danych. Później korzystałem z tego przy pracy z infrastrukturą, systemami i oprogramowaniem.',en:'I earned E12, E13 and E14. I studied computer hardware, networks, web applications and databases. Later I used that knowledge while working with infrastructure, systems and software.'},topic:'qualifications'}
    ]
  },
  {
    id:'festival',chapterId:'university',distance:FESTIVAL.distance,side:1,offset:FESTIVAL.offset,kind:'festival',topic:'festival',
    label:{pl:'KultURalia · imprezy masowe',en:'KultURalia · large events'},speaker:{pl:'Znajomy z samorządu',en:'A student government friend'},
    greeting:{pl:'Damian, scena, koncerty i tyle ludzi! Też pomagałeś to organizować?',en:'Damian, a stage, concerts and all these people! Did you help organise this too?'},
    intro:{pl:'Tak. W czasie studiów współorganizowałem KultURalia w samorządzie studentów. Znam ten festiwal także od strony zaplecza, z której na co dzień publiczność go nie widzi.',en:'Yes. During my studies I helped organise KultURalia through student government. I also know the festival from behind the scenes, a side the audience rarely gets to see.'},
    questions:[
      {label:{pl:'Za co odpowiadałeś przy artystach?',en:'What was your role with the artists?'},answer:{pl:'Odpowiadałem za kontakt z artystami podczas imprezy. Dbałem, żeby czuli się dobrze na jej terenie i mieli wszystko, czego potrzebowali na miejscu. Dzięki tej pracy poznałem osobiście wielu znanych artystów.',en:'I was the artists’ point of contact during the event. I looked after their wellbeing on site and made sure they had everything they needed. Through that work I got to meet many well-known artists in person.'},topic:'festival'},
      {label:{pl:'Co wyniosłeś z pracy w samorządzie?',en:'What did you take away from student government?'},answer:{pl:'Uczyłem się współpracy z ludźmi i jasnego przekazywania informacji. W samorządzie zajmowałem się też tworzeniem treści i komunikacją. Przy dużym wydarzeniu trzeba się dogadać i działać razem.',en:'I learned to work with people and communicate clearly. In student government I also created content and worked on communication. A large event takes people coordinating and working together.'},topic:'collaboration'},
      {label:{pl:'Jak duża była to impreza?',en:'How big was the festival?'},answer:{pl:'To była impreza masowa - duża scena, koncerty i wielotysięczny tłum imprezowiczów. Dla edycji 2024 organizatorzy zapowiadali kilkanaście tysięcy uczestników.',en:'It was a large-scale festival with a big stage, concerts and a crowd of thousands. For the 2024 edition, the organisers expected over ten thousand guests.'},topic:'festival'}
    ],
    source:{label:{pl:'Zapowiedź KultURaliów 2024 · skala imprezy',en:'KultURalia 2024 announcement · event scale'},url:'https://rzeszow-news.pl/kulturalia-2024-znamy-pierwszych-artystow-impreza-bez-korowodu-studentow/'}
  },
  {
    id:'music',chapterId:'university',distance:4850,side:-1,kind:'music',topic:'radio',
    label:{pl:'feniks.fm · radio',en:'feniks.fm · radio'},speaker:{pl:'Prowadzący audycję',en:'The radio host'},
    greeting:{pl:'Cześć, Damian! Podobno nie zawsze siedziałeś po drugiej stronie mikrofonu?',en:'Hi, Damian! I hear you have been on the other side of the microphone too?'},
    intro:{pl:'Zgadza się. W feniks.fm prowadziłem audycje i wywiady. Zajmowałem się też dźwiękiem, wideo i stroną internetową radia. Muzyka i praca z ludźmi były sporą częścią mojego życia na uczelni.',en:'That is right. At feniks.fm I hosted shows and interviews. I also worked on audio, video and the station’s website. Music and working with people were a big part of my university life.'},
    questions:[
      {label:{pl:'Czego nauczyło Cię prowadzenie audycji?',en:'What did hosting shows teach you?'},answer:{pl:'Uczyłem się przygotowywać materiał, prowadzić rozmowę i słuchać drugiej osoby. Do tego dochodziła realizacja dźwięku i wideo. Lubiłem, że mogłem połączyć techniczne zajęcia z tworzeniem czegoś wspólnie z innymi.',en:'I learned to prepare material, lead a conversation and listen to the person I was speaking with. There was audio and video production too. I enjoyed bringing technical work together with creating something alongside other people.'},topic:'radio'},
      {label:{pl:'A czego słuchasz poza radiem?',en:'And do you keep listening outside the studio?'},answer:{pl:'Muzyka towarzyszy mi właściwie wszędzie: przy pracy, nauce czy gotowaniu. Lubię też czasem usiąść do fortepianu. Nie nazwałbym tego wielkim graniem, ale sprawia mi to przyjemność.',en:'Music follows me pretty much everywhere: work, studying or cooking. I also like sitting down at the piano sometimes. I would not call it great playing, but I enjoy it.'},topic:'hobbies'}
    ]
  },
  {
    id:'robot',chapterId:'learning',distance:7350,side:1,kind:'robot',topic:'robot',
    label:{pl:'Robot · gesty PJM',en:'Robot · PJM gestures'},speaker:{pl:'Robot PJM',en:'PJM robot'},
    greeting:{pl:'Bip! Damian, słyszałem o Twojej pracy z uczeniem maszynowym. Co próbowałeś rozpoznać?',en:'Beep! Damian, I heard about your machine learning project. What were you trying to recognise?'},
    intro:{pl:'W pracy magisterskiej zająłem się polskim językiem migowym. Interesowało mnie połączenie rozpoznawania gestów z uczeniem maszynowym.',en:'My master’s thesis focused on Polish Sign Language. I was interested in combining gesture recognition with machine learning.'},
    questions:[
      {label:{pl:'Co rozpoznawała platforma?',en:'What did the platform recognise?'},answer:{pl:'Gesty polskiego języka migowego, czyli PJM. Chodziło o rozpoznawanie ich w czasie rzeczywistym, z wykorzystaniem metod uczenia maszynowego.',en:'Gestures in Polish Sign Language, or PJM. The aim was to recognise them in real time using machine learning methods.'},topic:'ai'},
      {label:{pl:'Jaki był Twój udział w projekcie?',en:'What was your part in the project?'},answer:{pl:'Przygotowałem prototyp platformy i analizowałem jej działanie. To właśnie ten prototyp był przedmiotem mojej pracy magisterskiej.',en:'I prepared the prototype platform and analysed how it worked. That prototype was the subject of my master’s thesis.'},topic:'robot'}
    ],
    source:{label:{pl:'Wyniki konkursu · SEP przy PRz',en:'Competition results · SEP at RUT'},url:'https://sep.w.prz.edu.pl/dzialalnosc/konkursy/konkurs-2024-wyniki'}
  },
  {
    id:'sport',chapterId:'next',distance:9900,side:1,kind:'sport',topic:'training',
    label:{pl:'Przerwa na trening',en:'Training break'},speaker:{pl:'Znajomy z treningu',en:'A training partner'},
    greeting:{pl:'Damian, odkładasz już laptop? Chodź się trochę poruszać.',en:'Damian, putting the laptop away? Come on, let’s get moving.'},
    intro:{pl:'Chętnie. Po czasie spędzonym przy komputerze lubię się trochę poruszać. Trudno mi długo siedzieć bezczynnie.',en:'Gladly. After spending time at the computer, I like to get moving. I find it hard to sit still for long.'},
    questions:[
      {label:{pl:'Co jeszcze robisz po pracy?',en:'What else do you enjoy after work?'},answer:{pl:'Teraz po pracy głównie ćwiczę siłowo na siłowni i trenuję kickboxing.',en:'These days, my main activities after work are strength training at the gym and kickboxing.'},topic:'training'},
      {label:{pl:'Dalej masz czas na gry?',en:'Do you still find time for games?'},answer:{pl:'Jest go mniej, niż bym chciał, ale dalej gram. To od gier zaczęła się moja fascynacja IT. Nadal myślę też o tworzeniu własnych światów i historii.',en:'Less than I would like, but I still play. Games are where my fascination with IT began. I still think about making worlds and stories of my own too.'},topic:'games'},
      {label:{pl:'A poza treningiem?',en:'And outside training?'},answer:{pl:'Słucham muzyki, oglądam filmy i gram. Czasem siadam też do fortepianu. Lubię mieć kilka różnych zajęć i nie ograniczać się do samego komputera.',en:'I listen to music, watch films and play games. Sometimes I sit down at the piano too. I like having a few different things to do instead of spending all my time at the computer.'},topic:'hobbies'}
    ]
  }
];
