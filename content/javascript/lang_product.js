/* 1) Słownik NAJPIERW */
const dict = {
    pl: {
        /* meta / nav / ui */
        "html.lang": "pl",
        "meta.desc": "Mgr inż. Damian Jamroży – Oprogramowanie UCI SoftHub to narzędzie dla organizacji, które ułatwia codzienną pracę na plikach w różnych formatach.",
        "plat.nav.home": "Strona główna",
        "plat.nav.platform": "UCISoftHub",
        "plat.side.portfolio": "PRODUKT",

        /* hero */
        "plat.hero.top": "Universal Code Integration Software Hub",
        "plat.hero.title": "UCI SoftHub",
        "plat.hero.sub": "UCISoftHub to projekt tworzony z pasją, dla ludzi – z myślą o efektywności, dostępności i cyfrowej przyszłości.",

        /* Sekcja 1 — Intro */
        "plat.intro.h2": "Platforma przetwarzania danych",
        "plat.intro.p1": "Opracowana przeze mnie platforma łączy konwersję, kompresję, szyfrowanie plików oraz inteligentne przetwarzanie obrazów w jedno wydajne środowisko. Dzięki integracji z modułami AI, system automatycznie dostosowuje zdjęcia użytkowników do wymogów formalnych - takich jak zdjęcia paszportowe lub legitymacyjne.",
        "plat.intro.p2": "Rozwiązanie wspiera zarówno użytkowników indywidualnych, jak i firmy, które przetwarzają duże ilości danych lub materiałów graficznych.",
        "plat.intro.cta": "Dostępna już niebawem",

        /* Sekcja 2 — Kluczowe funkcje */
        "plat.func.h2": "Kluczowe funkcje platformy",

        "plat.func.convert.h3": "Konwersja plików",
        "plat.func.convert.p": "Automatyczna konwersja między formatami, w tym PDF, DOCX, JPG, PNG i inne.",

        "plat.func.compress.h3": "Kompresja",
        "plat.func.compress.p": "Zaawansowane algorytmy redukujące rozmiar plików bez utraty jakości.",

        "plat.func.encrypt.h3": "Szyfrowanie danych",
        "plat.func.encrypt.p": "Bezpieczne szyfrowanie plików przy użyciu AES-256 oraz zarządzanie kluczami użytkownika.",

        "plat.func.photo.h3": "Zdjęcia formalne",
        "plat.func.photo.p": "Automatyczne dopasowanie zdjęć do wymogów paszportowych i legitymacyjnych.",

        /* Sekcja 3 — Jak działa */
        "plat.how.h2": "Jak działa platforma",
        "plat.how.1.h3": "Wgrywasz plik",
        "plat.how.1.p": "Użytkownik wybiera jeden lub wiele plików z komputera lub chmury.",
        "plat.how.2.h3": "Wybierasz operacje",
        "plat.how.2.p": "System pozwala wybrać konwersję, kompresję, szyfrowanie lub przetwarzanie zdjęć.",
        "plat.how.3.h3": "Sztuczna inteligencja",
        "plat.how.3.p": "Algorytmy SI analizują zawartość i dobierają najlepsze parametry przetwarzania.",
        "plat.how.4.h3": "Pobierasz wynik",
        "plat.how.4.p": "Gotowy plik można pobrać natychmiast na urządzenie, a kopia znika z serwera.",

        /* Sekcja — Cennik */
        "plat.pricing.h2": "Cennik",
        "plat.pricing.sub": "Wdrożenie w środowisku klienta (on-premise). Rozliczenie w modelu rocznej subskrypcji.",
        "plat.pricing.per": "/ rok",
        "plat.pricing.note": "Ceny netto. Subskrypcja obejmuje wdrożenie i wsparcie. Rozszerzenia/integracje wyceniane osobno.",

        "plat.pricing.starter.name": "Starter",
        "plat.pricing.starter.price": "5 000 zł",
        "plat.pricing.starter.desc": "Dla małych zespołów i podstawowych zadań.",
        "plat.pricing.starter.f1": "Wdrożenie on-premise",
        "plat.pricing.starter.f2": "Konwersja i kompresja plików",
        "plat.pricing.starter.f3": "Wsparcie e-mail (SLA 72h)",
        "plat.pricing.starter.cta": "Dostępne niebawem",

        "plat.pricing.pro.badge": "Najczęściej wybierany",
        "plat.pricing.pro.name": "Pro",
        "plat.pricing.pro.price": "10 000 zł",
        "plat.pricing.pro.desc": "Dla działów operacyjnych i większej skali.",
        "plat.pricing.pro.f1": "Wszystkie funkcje pakietu Starter",
        "plat.pricing.pro.f2": "Szyfrowanie plików",
        "plat.pricing.pro.f3": "Moduł zdjęć formalnych (AI)",
        "plat.pricing.pro.f4": "Aktualizacje oprogramowania",
        "plat.pricing.pro.f5": "Wsparcie e-mail + zdalne (SLA 48h)",
        "plat.pricing.pro.cta": "Tymczasowo niedostępne",

        "plat.pricing.ent.name": "Enterprise",
        "plat.pricing.ent.price": "wycena indywidualna",
        "plat.pricing.ent.desc": "Dla organizacji z wymaganiami bezpieczeństwa i integracji.",
        "plat.pricing.ent.f1": "Wszystkie funkcje pakietu PRO",
        "plat.pricing.ent.f2": "Dodatkowa konfiguracja",
        "plat.pricing.ent.f3": "Integracje (AD/SSO, inne)",
        "plat.pricing.ent.f4": "Zaawansowane polityki bezpieczeństwa",
        "plat.pricing.ent.f5": "Dedykowane raporty",
        "plat.pricing.ent.f6": "Godziny serwisowe",
        "plat.pricing.ent.cta": "Porozmawiajmy",

        /* Kontakt / stopka */
        "contact.h2": "Skontaktuj się ze mną",
        "contact.lead": "Opowiedz krótko o projekcie: cel, zakres, termin i budżet (widełki są ok).<br>Powrócę z odpowiedzią najszybciej jak to możliwe.",
        "contact.fast.h3": "Szybki kontakt",
        "contact.fast.cta": "Napisz e-mail",
        "contact.brief.h3": "Brief startowy",
        "contact.brief.i1": "Jaki problem chcesz rozwiązać?",
        "contact.brief.i2": "Do kogo kierujemy produkt?",
        "contact.brief.i3": "Co już masz: treści, logotyp, dane?",
        "contact.brief.i4": "Deadline i preferowany budżet?",
        "contact.brief.p": "Możesz wkleić gotowe odpowiedzi w mailu — ułatwi to wycenę i timeline.",
        "contact.pill1": "Rzeszów, Polska",
        "contact.pill2": "Odpowiedź ≤ 24h",

        "footer.rights": "Wszystkie prawa zastrzeżone."
        
    },

    en: {
        /* meta / nav / ui */
        "html.lang": "en",
        "meta.desc": "MSc Eng. Damian Jamroży – UCI SoftHub software solution designed for organizations to streamline daily work with multiple file formats.",
        "plat.nav.home": "Home",
        "plat.nav.platform": "UCISoftHub",
        "plat.side.portfolio": "PRODUCT",

        /* hero */
        "plat.hero.top": "Universal Code Integration Software Hub",
        "plat.hero.title": "UCI SoftHub",
        "plat.hero.sub": "UCISoftHub is a project created with passion for people – focused on efficiency, accessibility, and the digital future.",

        /* Section 1 — Intro */
        "plat.intro.h2": "Data Processing Platform",
        "plat.intro.p1": "The platform I developed combines file conversion, compression, encryption, and intelligent image processing into one efficient environment. Thanks to AI modules, the system automatically adjusts user photos to formal requirements — such as passport or student ID photos.",
        "plat.intro.p2": "The solution supports both individual users and organizations that process large volumes of data or graphic materials.",
        "plat.intro.cta": "Coming soon",

        /* Section 2 — Key Features */
        "plat.func.h2": "Key Platform Features",

        "plat.func.convert.h3": "File Conversion",
        "plat.func.convert.p": "Automatic conversion between formats, including PDF, DOCX, JPG, PNG, and more.",

        "plat.func.compress.h3": "Compression",
        "plat.func.compress.p": "Advanced algorithms reduce file size without compromising quality.",

        "plat.func.encrypt.h3": "Data Encryption",
        "plat.func.encrypt.p": "Secure file encryption using AES-256 with individual key management.",

        "plat.func.photo.h3": "Formal Photos",
        "plat.func.photo.p": "Automatic adjustment of photos to meet passport and ID requirements.",

        /* Section 3 — How It Works */
        "plat.how.h2": "How the Platform Works",
        "plat.how.1.h3": "Upload Files",
        "plat.how.1.p": "Users can select one or more files from their computer or cloud storage.",
        "plat.how.2.h3": "Choose Operations",
        "plat.how.2.p": "Select conversion, compression, encryption, or photo processing.",
        "plat.how.3.h3": "Artificial Intelligence",
        "plat.how.3.p": "AI algorithms analyze the content and choose the best processing parameters.",
        "plat.how.4.h3": "Download Result",
        "plat.how.4.p": "The processed file is ready for immediate download, and the copy is removed from the server.",

        /* Section — Pricing */
        "plat.pricing.h2": "Pricing",
        "plat.pricing.sub": "Deployed in the client’s environment (on-premise). Annual subscription model.",
        "plat.pricing.per": "/ year",
        "plat.pricing.note": "Net prices. Subscription includes deployment and support. Add-ons/integrations are quoted separately.",

        "plat.pricing.starter.name": "Starter",
        "plat.pricing.starter.price": "5,000 PLN",
        "plat.pricing.starter.desc": "For small teams and basic tasks.",
        "plat.pricing.starter.f1": "On-premise deployment",
        "plat.pricing.starter.f2": "File conversion and compression",
        "plat.pricing.starter.f3": "Email support (SLA 72h)",
        "plat.pricing.starter.cta": "Available soon",

        "plat.pricing.pro.badge": "Most popular",
        "plat.pricing.pro.name": "Pro",
        "plat.pricing.pro.price": "10,000 PLN",
        "plat.pricing.pro.desc": "For operational departments and larger-scale use.",
        "plat.pricing.pro.f1": "All Starter features",
        "plat.pricing.pro.f2": "File encryption",
        "plat.pricing.pro.f3": "Formal photo module (AI)",
        "plat.pricing.pro.f4": "Software updates",
        "plat.pricing.pro.f5": "Email and remote support (SLA 48h)",
        "plat.pricing.pro.cta": "Temporarily unavailable",

        "plat.pricing.ent.name": "Enterprise",
        "plat.pricing.ent.price": "custom pricing",
        "plat.pricing.ent.desc": "For organizations with security and integration requirements.",
        "plat.pricing.ent.f1": "All PRO features",
        "plat.pricing.ent.f2": "Additional configuration",
        "plat.pricing.ent.f3": "Integrations (AD/SSO, others)",
        "plat.pricing.ent.f4": "Advanced security policies",
        "plat.pricing.ent.f5": "Dedicated reports",
        "plat.pricing.ent.f6": "Service hours",
        "plat.pricing.ent.cta": "Let's talk",

        /* Contact / Footer */
        "contact.h2": "Get in touch",
        "contact.lead": "Briefly describe your project: goal, scope, timeline, and budget (a range is fine).<br>I’ll get back to you as soon as possible.",
        "contact.fast.h3": "Quick contact",
        "contact.fast.cta": "Send an e-mail",
        "contact.brief.h3": "Starter brief",
        "contact.brief.i1": "What problem do you want to solve?",
        "contact.brief.i2": "Who is the product intended for?",
        "contact.brief.i3": "What assets do you already have: content, logo, data?",
        "contact.brief.i4": "Deadline and preferred budget?",
        "contact.brief.p": "You can include your answers directly in the e-mail – it helps with estimation and timeline planning.",
        "contact.pill1": "Rzeszów, Poland",
        "contact.pill2": "Reply ≤ 24h",

        "footer.rights": "All rights reserved."
        
    }
};

/* 2) Funkcje */
function applyLang(lang) {
    const t = dict[lang] || dict.pl;

    // <html lang> + meta description
    document.documentElement.setAttribute('lang', t["html.lang"]);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t["meta.desc"]);

    // tłumacz wszystkie [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = t[key];
        if (typeof val === 'string') {
            el.innerHTML = val;
        }
    });

    // aria-pressed dla przełączników
    localStorage.setItem('lang', lang);
    const btnPl = document.getElementById('btn-pl');
    const btnEn = document.getElementById('btn-en');
    if (btnPl) btnPl.setAttribute('aria-pressed', lang === 'pl' ? 'true' : 'false');
    if (btnEn) btnEn.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');

    // sufiksy liczników
    document.querySelectorAll('[data-suffix-i18n]').forEach(el => {
        const key = el.getAttribute('data-suffix-i18n');
        const val = t[key];
        if (typeof val === 'string') el.dataset.suffix = val;
    });
    document.querySelectorAll('.num[data-suffix]').forEach(el => {
        const m = (el.textContent || '').match(/\d+/);
        if (m) el.textContent = m[0] + (el.dataset.suffix || '');
    });
}

function getInitialLang() {
    const usp = new URLSearchParams(location.search);
    const urlLang = usp.get('lang');
    const saved = localStorage.getItem('lang');
    return (urlLang === 'en' || urlLang === 'pl') ? urlLang : (saved || 'pl');
}

/* 3) Inicjalizacja po zparsowaniu DOM */
document.addEventListener('DOMContentLoaded', () => {
    const initial = getInitialLang();
    applyLang(initial);

    // Obsługa kliknięć – bez przeładowania strony:
    const btnPL = document.getElementById('btn-pl');
    const btnEN = document.getElementById('btn-en');

    const setLang = (lang) => {
        applyLang(lang);
        // aktualizuj URL ?lang=... ale bez reloadu
        const usp = new URLSearchParams(location.search);
        usp.set('lang', lang);
        history.replaceState(null, '', location.pathname + '?' + usp.toString() + location.hash);
    };

    if (btnPL) btnPL.addEventListener('click', () => setLang('pl'));
    if (btnEN) btnEN.addEventListener('click', () => setLang('en'));
});
