/* 1) Słownik NAJPIERW */
const dict = {
    pl: {
        /* meta / nav / ui */
        "html.lang": "pl",
        "meta.desc":
            "Mgr inż. Damian Jamroży - aplikacje webowe i desktopowe, dedykowane narzędzia dla firm oraz integracje z istniejącymi systemami.",

        "plat.nav.home": "Strona główna",
        "plat.nav.automation": "Automatyzacja",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Aplikacje",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administracja",

        /* HERO */
        "apps.hero.tag": "Aplikacje webowe &amp; desktopowe",
        "apps.hero.title": "Tworzę aplikacje, które odciążają ludzi z ich codziennych zadań",
        "apps.hero.lead":
            "Projektuję i wdrażam aplikacje webowe i desktopowe, które wspierają realne procesy: od prostych narzędzi dla kilku osób, po większe systemy z rolami użytkowników, integracjami i raportowaniem.",
        "apps.hero.cta_primary": "Porozmawiajmy",
        "apps.hero.cta_secondary": "Jak wygląda proces",

        "apps.hero.stats_1_value": "Od prototypu",
        "apps.hero.stats_1_label": "do działającego wdrożenia",
        "apps.hero.stats_2_value": "Aplikacje",
        "apps.hero.stats_2_label": "webowe, desktopowe, bazodanowe i integracje",

        "apps.hero.preview_title": "Widok aplikacji dla zespołu",
        "apps.hero.pill_1_label": "Panel pracownika",
        "apps.hero.pill_1_desc": "dodawanie zgłoszeń, zadań, wpisów",
        "apps.hero.pill_2_label": "Panel administratora",
        "apps.hero.pill_2_desc": "zarządzanie użytkownikami, uprawnieniami i ustawieniami",
        "apps.hero.pill_3_label": "Raporty &amp; integracje",
        "apps.hero.pill_3_desc": "przegląd danych, eksport, połączenia z innymi systemami",

        /* SECTION 1 — Overview */
        "apps.overview.tag": "Zakres aplikacji",
        "apps.overview.h2": "Od prostych narzędzi po aplikacje wspierające całe zespoły",
        "apps.overview.lead":
            "Nie zawsze potrzebny jest ogromny system. Często więcej daje dobrze zaprojektowana aplikacja do konkretnego procesu: raportowania, obsługi zgłoszeń, pracy na danych czy komunikacji w zespole.",
        "apps.overview.copy1":
            "Pomagam przełożyć „zlepek Excela, maili i komunikatorów” na przejrzystą aplikację, która prowadzi użytkownika krok po kroku przez proces. Dzięki doświadczeniu w UX/UI dbam o to, żeby narzędzie było zrozumiałe także dla osób nietechnicznych.",
        "apps.overview.copy2":
            "Wspieram zarówno projekty komercyjne, jak i wewnętrzne narzędzia dla działów administracji, obsługi klienta, IT czy kadr.",

        "apps.overview.web.h3": "Aplikacje webowe &amp; portale",
        "apps.overview.web.p":
            "Panele administracyjne, systemy zgłoszeń, portale z logowaniem, moduły raportowe, lekkie CRM-y i narzędzia do zarządzania zadaniami.",

        "apps.overview.desktop.h3": "Narzędzia desktopowe",
        "apps.overview.desktop.p":
            "Aplikacje w C# /.NET lub Pythonie do pracy na danych, integracji systemów, generowania dokumentów, wsadowych operacji i zadań cyklicznych.",

        "apps.overview.integrations.h3": "Integracje &amp; API",
        "apps.overview.integrations.p":
            "Warstwa backendowa i integracje między systemami: REST API, bazy danych, kolejki zadań, wyzwalacze CRON – tak, żeby aplikacja nie była „wyspą”.",

        /* SECTION 2 — Stack */
        "apps.stack.tag": "Technologie",
        "apps.stack.h2": "Stos technologiczny dobrany do wielkości projektu",
        "apps.stack.lead":
            "Zamiast „najmodniejszego frameworka” wybieram technologie, które pasują do Twojej organizacji: łatwe w utrzymaniu, bez zbędnego skomplikowania i z dobrą dokumentacją.",

        "apps.stack.frontend.h3": "Frontend &amp; UX",
        "apps.stack.frontend.p":
            "Nowoczesny, responsywny interfejs bez przeładowania efektami – skupiony na czytelności i szybkości pracy.",

        "apps.stack.backend.h3": "Backend &amp; integracje",
        "apps.stack.backend.p":
            "Stabilna logika biznesowa, połączenia z bazami danych i zewnętrznymi systemami.",

        "apps.stack.desktop.h3": "Aplikacje desktopowe",
        "apps.stack.desktop.p":
            "Narzędzia na Windows (C# / .NET / Python) tam, gdzie web nie jest wygodny lub potrzebny jest bezpośredni dostęp do zasobów.",

        "apps.stack.ai.h3": "Elementy AI",
        "apps.stack.ai.p":
            "Proste modele AI jako część aplikacji – klasyfikacja, podsumowania, analiza tekstu, wsparcie w podejmowaniu decyzji.",

        /* SECTION 3 — When */
        "apps.when.tag": "Kiedy ma to sens",
        "apps.when.h2": "Kiedy warto porozmawiać o dedykowanej aplikacji?",

        "apps.when.i1.h3": "Excel i maile przestają wystarczać",
        "apps.when.i1.p":
            "Gdy coraz trudniej ogarnąć proces w arkuszach i wiadomościach, a każdy zespół ma „swoją wersję prawdy” i brakuje jednego, spójnego programu.",

        "apps.when.i2.h3": "Masz proces, ale brakuje narzędzi",
        "apps.when.i2.p":
            "Procedury są spisane, zespół wie co robić, ale systemy IT nie nadążają i wszystko finalnie ląduje w „ręcznych obejściach”.",

        "apps.when.i3.h3": "Potrzebujesz przewidywalnego rozwoju",
        "apps.when.i3.p":
            "Chcesz mieć wpływ na roadmapę aplikacji, dostęp do kodu i możliwość dalszej rozbudowy – zamiast być ograniczonym gotowym SaaS-em.",

        /* Contact / Footer (wspólne) */
        "contact.h2": "Skontaktuj się ze mną",
        "contact.lead":
            "Opowiedz krótko o projekcie: cel, zakres, termin i budżet (widełki są ok).<br>Powrócę z odpowiedzią najszybciej jak to możliwe.",
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
        "meta.desc":
            "MSc Eng. Damian Jamroży — web and desktop applications, dedicated business tools, and integrations with existing systems.",

        "plat.nav.home": "Home",
        "plat.nav.automation": "Automation",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Applications",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administration",


        /* HERO */
        "apps.hero.tag": "Web &amp; desktop applications",
        "apps.hero.title": "I build applications that take everyday work off people’s shoulders",
        "apps.hero.lead":
            "I design and deliver web and desktop applications that support real processes: from simple tools for small teams to larger systems with user roles, integrations, and reporting.",
        "apps.hero.cta_primary": "Let’s talk",
        "apps.hero.cta_secondary": "What the process looks like",

        "apps.hero.stats_1_value": "From prototype",
        "apps.hero.stats_1_label": "to a working deployment",
        "apps.hero.stats_2_value": "Applications",
        "apps.hero.stats_2_label": "web, desktop, database-driven, and integrations",

        "apps.hero.preview_title": "Team app view",
        "apps.hero.pill_1_label": "Employee panel",
        "apps.hero.pill_1_desc": "submitting tickets, tasks, entries",
        "apps.hero.pill_2_label": "Admin panel",
        "apps.hero.pill_2_desc": "managing users, permissions, and settings",
        "apps.hero.pill_3_label": "Reports &amp; integrations",
        "apps.hero.pill_3_desc": "data overview, exports, connections to other systems",

        /* SECTION 1 — Overview */
        "apps.overview.tag": "Application scope",
        "apps.overview.h2": "From simple tools to apps that support entire teams",
        "apps.overview.lead":
            "You don’t always need a huge system. Often, a well-designed app tailored to a specific process delivers more: reporting, ticket handling, data work, or team communication.",
        "apps.overview.copy1":
            "I help transform a “mix of Excel, emails, and messengers” into a clear application that guides users step by step. With UX/UI experience, I make sure the tool is understandable even for non-technical users.",
        "apps.overview.copy2":
            "I support both commercial projects and internal tools for administration, customer service, IT, or HR departments.",

        "apps.overview.web.h3": "Web applications &amp; portals",
        "apps.overview.web.p":
            "Admin panels, ticketing systems, login-based portals, reporting modules, lightweight CRMs, and task management tools.",

        "apps.overview.desktop.h3": "Desktop tools",
        "apps.overview.desktop.p":
            "C#/.NET or Python apps for data processing, system integrations, document generation, batch operations, and scheduled tasks.",

        "apps.overview.integrations.h3": "Integrations &amp; APIs",
        "apps.overview.integrations.p":
            "Backend layers and integrations between systems: REST APIs, databases, task queues, CRON triggers — so the app isn’t an “island”.",

        /* SECTION 2 — Stack */
        "apps.stack.tag": "Technology",
        "apps.stack.h2": "A tech stack matched to the project size",
        "apps.stack.lead":
            "Instead of chasing the “trendiest framework”, I choose technologies that fit your organization: maintainable, not overcomplicated, and well-documented.",

        "apps.stack.frontend.h3": "Frontend &amp; UX",
        "apps.stack.frontend.p":
            "A modern, responsive interface without effect overload — focused on clarity and fast work.",

        "apps.stack.backend.h3": "Backend &amp; integrations",
        "apps.stack.backend.p":
            "Stable business logic, database connections, and integrations with external systems.",

        "apps.stack.desktop.h3": "Desktop applications",
        "apps.stack.desktop.p":
            "Windows tools (C# / .NET / Python) where the web isn’t convenient, or direct access to resources is required.",

        "apps.stack.ai.h3": "AI elements",
        "apps.stack.ai.p":
            "Simple AI models as part of the app — classification, summaries, text analysis, decision support.",

        /* SECTION 3 — When */
        "apps.when.tag": "When it makes sense",
        "apps.when.h2": "When is it worth discussing a dedicated application?",

        "apps.when.i1.h3": "Excel and emails are no longer enough",
        "apps.when.i1.p":
            "When it’s getting harder to manage the process in spreadsheets and messages, each team has its “own version of truth”, and there’s no single, consistent system.",

        "apps.when.i2.h3": "You have a process, but lack the tools",
        "apps.when.i2.p":
            "Procedures are written down and the team knows what to do, but IT systems can’t keep up — and everything ends up in manual workarounds.",

        "apps.when.i3.h3": "You need predictable growth",
        "apps.when.i3.p":
            "You want control over the app’s roadmap, access to the code, and the ability to expand — instead of being constrained by an off-the-shelf SaaS.",

        /* Contact / Footer (wspólne) */
        "contact.h2": "Get in touch",
        "contact.lead":
            "Briefly describe your project: goal, scope, timeline, and budget (a range is fine).<br>I’ll get back to you as soon as possible.",
        "contact.fast.h3": "Quick contact",
        "contact.fast.cta": "Send an e-mail",
        "contact.brief.h3": "Starter brief",
        "contact.brief.i1": "What problem do you want to solve?",
        "contact.brief.i2": "Who is the product intended for?",
        "contact.brief.i3": "What assets do you already have: content, logo, data?",
        "contact.brief.i4": "Deadline and preferred budget?",
        "contact.brief.p":
            "You can include your answers directly in the e-mail — it helps with estimation and timeline planning.",
        "contact.pill1": "Rzeszów, Poland",
        "contact.pill2": "Reply ≤ 24h",
        "footer.rights": "All rights reserved."
    }
};

/* 2) Funkcje */
function applyLang(lang) {
    const t = dict[lang] || dict.pl;

    // <html lang> + meta description
    document.documentElement.setAttribute("lang", t["html.lang"]);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t["meta.desc"]);

    // tłumacz wszystkie [data-i18n]
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const val = t[key];
        if (typeof val === "string") el.innerHTML = val;
    });

    // aria-pressed dla przełączników
    localStorage.setItem("lang", lang);
    const btnPl = document.getElementById("btn-pl");
    const btnEn = document.getElementById("btn-en");
    if (btnPl) btnPl.setAttribute("aria-pressed", lang === "pl" ? "true" : "false");
    if (btnEn) btnEn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");

    // sufiksy liczników (jeśli kiedyś użyjesz na tej stronie)
    document.querySelectorAll("[data-suffix-i18n]").forEach((el) => {
        const key = el.getAttribute("data-suffix-i18n");
        const val = t[key];
        if (typeof val === "string") el.dataset.suffix = val;
    });
    document.querySelectorAll(".num[data-suffix]").forEach((el) => {
        const m = (el.textContent || "").match(/\d+/);
        if (m) el.textContent = m[0] + (el.dataset.suffix || "");
    });
}

function getInitialLang() {
    const usp = new URLSearchParams(location.search);
    const urlLang = usp.get("lang");
    const saved = localStorage.getItem("lang");
    return urlLang === "en" || urlLang === "pl" ? urlLang : saved || "pl";
}

/* 3) Inicjalizacja po zparsowaniu DOM */
document.addEventListener("DOMContentLoaded", () => {
    const initial = getInitialLang();
    applyLang(initial);

    // Obsługa kliknięć – bez przeładowania strony
    const btnPL = document.getElementById("btn-pl");
    const btnEN = document.getElementById("btn-en");

    const setLang = (lang) => {
        applyLang(lang);
        const usp = new URLSearchParams(location.search);
        usp.set("lang", lang);
        history.replaceState(null, "", location.pathname + "?" + usp.toString() + location.hash);
    };

    if (btnPL) btnPL.addEventListener("click", () => setLang("pl"));
    if (btnEN) btnEN.addEventListener("click", () => setLang("en"));
});
