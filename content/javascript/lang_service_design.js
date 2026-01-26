/* 1) Słownik NAJPIERW */
const dict = {
    pl: {
        "html.lang": "pl",
        "meta.desc":
            "Mgr inż. Damian Jamroży - projektowanie UX/UI, redesign istniejących systemów i tworzenie nowoczesnych interfejsów.",

        /* NAV / UI */
        "plat.nav.home": "Strona główna",
        "plat.nav.automation": "Automatyzacja",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Aplikacje",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administracja",


        /* HERO (service.*) */
        "service.tag": "Projektowanie UX/UI",
        "service.title": "Tworzę nowoczesne interfejsy i doświadczenia, które naprawdę działają",
        "service.lead":
            "Od badań i prototypów, przez architekturę informacji, aż po gotowe projekty UI - pomagam budować intuicyjne, piękne i skalowalne produkty cyfrowe.",
        "service.cta_primary": "Skontaktuj się",
        "service.cta_secondary": "Zobacz jak pracuję",

        "service.stats_1_value": "2+",
        "service.stats_1_label": "lat doświadczenia",
        "service.stats_2_value": "10+",
        "service.stats_2_label": "projektów",
        "service.stats_3_value": "100%",
        "service.stats_3_label": "zadowolonych klientów",

        "service.mockup_preview": "Podgląd UI",
        "service.mockup_menu_1": "Dashboard",
        "service.mockup_menu_2": "Użytkownicy",
        "service.mockup_menu_3": "Analityka",
        "service.mockup_menu_4": "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
        "service.mockup_chip": "UI Mockup",

        /* OVERVIEW (sd.ov.*) */
        "sd.ov.tag": "Czym jest dla mnie service & UI design?",
        "sd.ov.h2": "Nie tylko ładne ekrany, ale spójna usługa",
        "sd.ov.lead":
            "Zanim powstanie projekt graficzny, mapuję kluczowe kroki usługi:\n                            kto, kiedy i po co korzysta z danego ekranu. Dzięki temu interfejs\n                            nie jest przypadkową zlepioną listą funkcji, ale logiczną ścieżką.",
        "sd.ov.l1": "Analiza istniejących ekranów, formularzy i komunikatów.",
        "sd.ov.l2":
            "Uporządkowanie ścieżek: od wejścia do systemu\n                                po zakończenie zadania.",
        "sd.ov.l3":
            "Projekt makiet low / mid / hi-fi w Figmie\n                                z opisem logiki i stanów.",
        "sd.ov.note":
            "W praktyce najczęściej pracuję nad systemami wewnętrznymi, złożonymi\n                            portalami i high-tech narzędziami, które muszą być <strong>używalne codziennie</strong>,\n                            a nie tylko „ładne na prezentacji”.",

        /* FLOW (sd.flow.*) */
        "sd.flow.h2": "Jak wygląda wspólny proces",
        "sd.flow.lead":
            "Proces jest prosty, żeby zespół wiedział, na jakim etapie jesteśmy\n                        i co będzie potrzebne w kolejnym kroku.",
        "sd.flow.s1.h3": "Rozmowa i zmapowanie kontekstu",
        "sd.flow.s1.p":
            "Zbieramy materiały: istniejące ekrany, regulaminy, procesy.\n                                Ustalamy cele: co ma być łatwiejsze, szybsze lub mniej frustrujące.",
        "sd.flow.s2.h3": "Ścieżki użytkownika i scenariusze",
        "sd.flow.s2.p":
            "Rozpisuję krok po kroku, co robi użytkownik, czym system\n                                odpowiada i gdzie pojawiają się decyzje. Tutaj zapadają\n                                kluczowe ustalenia biznesowe.",
        "sd.flow.s3.h3": "Makiety i projekt UI",
        "sd.flow.s3.p":
            "Na podstawie ścieżek powstają makiety w Figmie\n                                (low-fi → hi-fi), a następnie spójny interfejs:\n                                komponenty, stany, warianty.",
        "sd.flow.s4.h3": "Wsparcie przy wdrożeniu",
        "sd.flow.s4.p":
            "Pomagam doprecyzować wymagania, opisuję zachowania\n                                komponentów i jestem wsparciem dla devów podczas wdrożenia.",

        /* COLLAB (sd.collab.*) */
        "sd.collab.h2": "Jak wygląda współpraca w praktyce",
        "sd.collab.lead":
            "Jasne zasady na starcie ułatwiają dowiezienie projektu\n                        w rozsądnym czasie i budżecie.",
        "sd.collab.youget.h3": "Co ode mnie dostajesz",
        "sd.collab.youget.l1": "Makiety i UI w Figmie z opisem logiki ekranów.",
        "sd.collab.youget.l2":
            "Prosty mini-design-system dla projektu\n                                (styl tekstu, kolory, komponenty).",
        "sd.collab.youget.l3":
            "Rekomendacje zmian w procesie,\n                                jeśli wpływają na doświadczenie użytkownika.",
        "sd.collab.need.h3": "Czego będę potrzebował od Ciebie",
        "sd.collab.need.l1":
            "Dostępu do aktualnych ekranów / systemu\n                                lub zrzutów ekranu.",
        "sd.collab.need.l2":
            "Możliwości konsultacji z osobami,\n                                które korzystają z systemu na co dzień.",
        "sd.collab.need.l3":
            "Feedbacku na etapie makiet,\n                                zanim przejdziemy do dopracowanego UI.",
        "sd.collab.cta.text":
            "Masz w głowie konkretny system lub usługę, która „działa, ale mogłaby działać lepiej”?",
        "sd.collab.cta.btn": "Napisz kilka zdań o projekcie",

        /* CONTACT / FOOTER */
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
        "html.lang": "en",
        "meta.desc":
            "MSc Eng. Damian Jamroży — UX/UI design, redesign of existing systems, and modern interface creation.",

        /* NAV / UI */
        "plat.nav.home": "Home",
        "plat.nav.automation": "Automation",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Applications",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administration",


        /* HERO (service.*) */
        "service.tag": "UX/UI design",
        "service.title": "I create modern interfaces and experiences that actually work",
        "service.lead":
            "From research and prototypes, through information architecture, to final UI designs — I help build intuitive, beautiful, and scalable digital products.",
        "service.cta_primary": "Get in touch",
        "service.cta_secondary": "See how I work",

        "service.stats_1_value": "2+",
        "service.stats_1_label": "years of experience",
        "service.stats_2_value": "10+",
        "service.stats_2_label": "projects",
        "service.stats_3_value": "100%",
        "service.stats_3_label": "happy clients",

        "service.mockup_preview": "UI preview",
        "service.mockup_menu_1": "Dashboard",
        "service.mockup_menu_2": "Users",
        "service.mockup_menu_3": "Analytics",
        "service.mockup_menu_4": "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
        "service.mockup_chip": "UI mockup",

        /* OVERVIEW (sd.ov.*) */
        "sd.ov.tag": "What service & UI design means to me",
        "sd.ov.h2": "Not just pretty screens — a coherent service",
        "sd.ov.lead":
            "Before any visuals are created, I map the key steps of the service:\n                            who uses a screen, when, and why. This way the interface\n                            isn’t a random list of features, but a logical path.",
        "sd.ov.l1": "Analysis of existing screens, forms, and messages.",
        "sd.ov.l2": "Organizing journeys: from entering the system to finishing a task.",
        "sd.ov.l3": "Low / mid / hi-fi Figma wireframes with logic and states described.",
        "sd.ov.note":
            "In practice, I most often work on internal systems, complex\n                            portals, and high-tech tools that must be <strong>usable every day</strong>,\n                            not just “nice in a presentation.”",

        /* FLOW (sd.flow.*) */
        "sd.flow.h2": "What the collaboration process looks like",
        "sd.flow.lead":
            "The process is simple, so the team knows where we are\n                        and what will be needed in the next step.",
        "sd.flow.s1.h3": "Conversation and context mapping",
        "sd.flow.s1.p":
            "We gather materials: existing screens, rules, processes.\n                                We define goals: what should be easier, faster, or less frustrating.",
        "sd.flow.s2.h3": "User journeys and scenarios",
        "sd.flow.s2.p":
            "I describe step by step what the user does, how the system responds,\n                                and where decisions happen. This is where key business decisions are made.",
        "sd.flow.s3.h3": "Wireframes and UI design",
        "sd.flow.s3.p":
            "Based on journeys, Figma wireframes are created\n                                (low-fi → hi-fi), followed by a consistent UI:\n                                components, states, variants.",
        "sd.flow.s4.h3": "Implementation support",
        "sd.flow.s4.p":
            "I help clarify requirements, describe component behaviors,\n                                and support developers during implementation.",

        /* COLLAB (sd.collab.*) */
        "sd.collab.h2": "How collaboration works in practice",
        "sd.collab.lead":
            "Clear rules from the start make it easier to deliver\n                        within a reasonable time and budget.",
        "sd.collab.youget.h3": "What you get from me",
        "sd.collab.youget.l1": "Figma wireframes and UI with screen-logic descriptions.",
        "sd.collab.youget.l2":
            "A simple mini design system for the project\n                                (typography styles, colors, components).",
        "sd.collab.youget.l3":
            "Process improvement recommendations\n                                when they affect user experience.",
        "sd.collab.need.h3": "What I’ll need from you",
        "sd.collab.need.l1": "Access to current screens / the system, or screenshots.",
        "sd.collab.need.l2": "Ability to consult with daily system users.",
        "sd.collab.need.l3": "Feedback at the wireframe stage before moving to polished UI.",
        "sd.collab.cta.text":
            "Do you have a specific system or service that “works, but could work better”?",
        "sd.collab.cta.btn": "Write a few lines about the project",

        /* CONTACT / FOOTER */
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
            "You can paste your answers into the e-mail — it helps with estimation and timeline.",
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

    // (opcjonalnie) sufiksy liczników jeśli kiedyś dodasz
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

/* 3) Inicjalizacja */
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
