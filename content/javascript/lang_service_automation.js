/* 1) Słownik NAJPIERW */
const dict = {
    pl: {
        "html.lang": "pl",
        "meta.desc":
            "Mgr inż. Damian Jamroży - automatyzacje procesów biznesowych, integracje systemów i modele sztucznej inteligencji AI.",

        /* NAV / UI (wspólne) */
        "plat.nav.home": "Strona główna",
        "plat.nav.automation": "Automatyzacja",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Aplikacje",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administracja",


        /* SERVICE AUTOMATION */
        "sa.hero.tag": "Automatyzacja procesów &amp; modele AI",
        "sa.hero.title": "Zamiast ręcznego klikania - skrypty, integracje oraz dedykowane modele AI",
        "sa.hero.lead":
            "Pomagam zastąpić powtarzalną pracę automatyzacjami: od prostych skryptów i integracji między narzędziami, po niewielkie modele AI, które klasyfikują dane, streszczają treści lub podpowiadają kolejne kroki.",
        "sa.hero.cta_primary": "Kontakt",
        "sa.hero.cta_secondary": "Jak wygląda współpraca",

        "sa.hero.stats_1_value": "Tygodnie",
        "sa.hero.stats_1_label": "zaoszczędzonego czasu",
        "sa.hero.stats_2_value": "Python",
        "sa.hero.stats_2_label": "skrypty, API, mini-usługi",
        "sa.hero.stats_3_value": "Sztuczna inteligencja",
        "sa.hero.stats_3_label": "dedykowana do konkretnych zadań",

        "sa.hero.terminal_title": "python automations.py",
        "sa.hero.l1": "Pobieram dane z formularza / systemu.",
        "sa.hero.l2": "Czyszczę i łączę dane w jeden, spójny widok.",
        "sa.hero.l3": "Wywołuję mały model AI do klasyfikacji / streszczenia.",
        "sa.hero.l4": "Tworzę raport i wysyłam powiadomienie do zespołu.",
        "sa.hero.l5": "Zadanie zakończone – bez ręcznego kopiuj-wklej.",

        "sa.ov.tag": "Kiedy warto automatyzować?",
        "sa.ov.h2": "Powtarzasz proces w nieskończoność?",
        "sa.ov.lead":
            "Największy zwrot z automatyzacji pojawia się tam, gdzie ludzie wykonują dużo powtarzalnych zajęć, kopiuj-wklej i ręcznego przepisywania danych. Zamiast marnować cenny czas na wykonywanie powtarzalnych rzeczy, skorzystaj z moich usług i wspólnie zautomatyzujmy Twoją firmę! Nie musimy budować dużego systemu za ogromne kwoty. Często wystarczy skupić się na jednym procesie aby zwiększyć produktywność pracowników nawet kilkukrotnie.",
        "sa.ov.c1.label": "Dużo powtórzeń",
        "sa.ov.c1.text":
            "Zespół co tydzień wykonuje ten sam zestaw kroków. Pobiera dane, przerabia je w jakimś oprogramowaniu np. Excel, wysyła raporty lub wprowadza coś do systemu.",
        "sa.ov.c2.label": "Kopiuj-wklej między narzędziami",
        "sa.ov.c2.text":
            "Dane wędrują między formularzami, mailami, plikami i aplikacjami, a po drodze łatwo o błąd lub pomyłkę w wersjach.",
        "sa.ov.c3.label": "Ryzyko błędów i opóźnień",
        "sa.ov.c3.text":
            "Małe przeoczenie w ręcznej pracy potrafi opóźnić cały proces albo wygenerować kosztowną poprawkę - automatyzacja pomaga tego uniknąć.",

        "sa.flow.h2": "Jak wygląda wspólny proces przy automatyzacji",
        "sa.flow.lead":
            "Trzymam się prostego, powtarzalnego procesu, żebyś dokładnie wiedział, co dzieje się na każdym etapie i kiedy zobaczysz pierwsze efekty.",
        "sa.flow.s1.h3": "Rozmowa i mapowanie procesu",
        "sa.flow.s1.p":
            "Rozpisujemy, jak wygląda obecny proces: kto, co, kiedy i w jakim narzędziu robi. Szukamy miejsc, gdzie jest najwięcej powtarzalnej pracy lub ryzyko błędów.",
        "sa.flow.s2.h3": "Propozycja rozwiązania i mały proof-of-concept",
        "sa.flow.s2.p":
            "Proponuję konkretny scenariusz automatyzacji (Python / API / integracje / mały model AI) oraz przygotowuję prosty diagram, żeby szybko zwizualizować złożoność problemu.",
        "sa.flow.s3.h3": "Implementacja i testy na realnych danych",
        "sa.flow.s3.p":
            "Buduję docelowy skrypt / usługę i testujemy ją na Twoich danych. Wprowadzamy poprawki, dopracowujemy logikę wyjątków oraz sposób raportowania wyników.",
        "sa.flow.s4.h3": "Wdrożenie i krótkie przeszkolenie",
        "sa.flow.s4.p":
            "Pomagam we wdrożeniu: od konfiguracji środowiska (np. serwer, CRON, scheduler) po krótkie przeszkolenie zespołu i checklistę „co robić, gdy...”.",

        "sa.co.tag": "Co ode mnie dostajesz, a czego potrzebuję od Ciebie",
        "sa.co.h2": "Co ode mnie dostajesz, a czego potrzebuję od Ciebie",
        "sa.co.lead":
            "Jasne zasady na starcie ułatwiają szybkie wdrożenie automatyzacji i uniknięcie „niespodzianek” po drodze.",

        "sa.co.col.ineed": "Czego będę potrzebował od Ciebie",
        "sa.co.col.youget": "Co ode mnie dostajesz",

        "sa.co.row1.r": "Opisu aktualnego procesu (nawet w prostej formie: kilka punktów lub nagranie ekranu).",
        "sa.co.row1.l":
            "Skrypty / usługi z krótką dokumentacją w języku zrozumiałym dla nietechnicznych osób.",

        "sa.co.row2.r":
            "Dostępu do środowiska / narzędzi, z którymi automatyzacja ma się integrować (lub przykładowych plików/danych).",
        "sa.co.row2.l":
            "Konfigurację harmonogramu (np. zadania cykliczne) oraz sposób monitorowania, czy automatyzacja działa poprawnie.",

        "sa.co.row3.r":
            "Osoby kontaktowej, która zna proces „od środka” i może szybko odpowiedzieć na pytania.",
        "sa.co.row3.l":
            "Model AI skupiony na konkretnym zadaniu (np. klasyfikacja zgłoszeń, streszczenia, ekstrakcja danych).",

        "sa.co.row4.r":
            "Feedbacku na etapie wdrożenia i testów - najlepiej na realnych danych, z życia wziętych.",
        "sa.co.row4.l":
            "Sugestie dalszych usprawnień procesów, jeśli w trakcie pracy zauważę kolejne „wąskie gardła”.",

        "sa.co.cta.text":
            "Masz w głowie proces, który „zawsze robi się ręcznie”, ale czujesz, że da się go zautomatyzować?",
        "sa.co.cta.btn": "Napisz kilka zdań o swoim scenariuszu",

        /* CONTACT / FOOTER (wspólne) */
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
            "MSc Eng. Damian Jamroży — business process automation, system integrations, and dedicated AI models.",

        /* NAV / UI (wspólne) */
        "plat.nav.home": "Home",
        "plat.nav.automation": "Automation",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Applications",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administration",


        /* SERVICE AUTOMATION */
        "sa.hero.tag": "Process automation &amp; AI models",
        "sa.hero.title": "Instead of manual clicking — scripts, integrations, and dedicated AI models",
        "sa.hero.lead":
            "I help replace repetitive work with automation: from simple scripts and tool-to-tool integrations to small AI models that classify data, summarize content, or suggest next steps.",
        "sa.hero.cta_primary": "Contact",
        "sa.hero.cta_secondary": "How collaboration works",

        "sa.hero.stats_1_value": "Weeks",
        "sa.hero.stats_1_label": "of time saved",
        "sa.hero.stats_2_value": "Python",
        "sa.hero.stats_2_label": "scripts, APIs, mini-services",
        "sa.hero.stats_3_value": "Artificial intelligence",
        "sa.hero.stats_3_label": "tailored to specific tasks",

        "sa.hero.terminal_title": "python automations.py",
        "sa.hero.l1": "Fetching data from a form / system.",
        "sa.hero.l2": "Cleaning and merging data into one consistent view.",
        "sa.hero.l3": "Calling a small AI model for classification / summarization.",
        "sa.hero.l4": "Generating a report and notifying the team.",
        "sa.hero.l5": "Done — no manual copy-paste.",

        "sa.ov.tag": "When is automation worth it?",
        "sa.ov.h2": "Repeating the same process endlessly?",
        "sa.ov.lead":
            "The biggest ROI from automation appears where people do lots of repetitive tasks, copy-paste, and manual data rewriting. Instead of wasting valuable time on repeatable work, use my services and let’s automate your company together! You don’t need a huge system with a huge budget. Often, focusing on one process is enough to multiply productivity.",
        "sa.ov.c1.label": "Lots of repetition",
        "sa.ov.c1.text":
            "Every week, the team performs the same set of steps: pulls data, processes it (e.g., in Excel), sends reports, or enters something into a system.",
        "sa.ov.c2.label": "Copy-paste between tools",
        "sa.ov.c2.text":
            "Data moves between forms, emails, files, and apps — and it’s easy to make mistakes or lose track of versions along the way.",
        "sa.ov.c3.label": "Risk of errors and delays",
        "sa.ov.c3.text":
            "A small oversight in manual work can delay the whole process or cause costly rework — automation helps prevent that.",

        "sa.flow.h2": "What the automation process looks like",
        "sa.flow.lead":
            "I follow a simple, repeatable process so you always know what’s happening at each stage and when you’ll see the first results.",
        "sa.flow.s1.h3": "Discovery and process mapping",
        "sa.flow.s1.p":
            "We map the current process: who does what, when, and in which tool. We identify areas with the most repetitive work or the highest error risk.",
        "sa.flow.s2.h3": "Solution proposal + a small proof of concept",
        "sa.flow.s2.p":
            "I propose a concrete automation scenario (Python / APIs / integrations / small AI model) and prepare a simple diagram to visualize complexity quickly.",
        "sa.flow.s3.h3": "Implementation and testing on real data",
        "sa.flow.s3.p":
            "I build the target script/service and we test it on your data. We refine edge cases, exception handling, and reporting.",
        "sa.flow.s4.h3": "Deployment and a short training",
        "sa.flow.s4.p":
            "I help with deployment — from environment setup (e.g., server, CRON, scheduler) to a short team training and a checklist for “what to do if…”.",

        "sa.co.tag": "What you get from me, and what I need from you",
        "sa.co.h2": "What you get from me, and what I need from you",
        "sa.co.lead":
            "Clear rules from the start make automation faster to deploy and help avoid surprises along the way.",

        "sa.co.col.ineed": "What I’ll need from you",
        "sa.co.col.youget": "What you get from me",

        "sa.co.row1.r": "A description of the current process (even simple bullet points or a screen recording).",
        "sa.co.row1.l": "Scripts/services with short documentation in language understandable for non-technical users.",

        "sa.co.row2.r":
            "Access to the environment/tools the automation should integrate with (or sample files/data).",
        "sa.co.row2.l":
            "Scheduling setup (recurring jobs) and a way to monitor whether the automation is working correctly.",

        "sa.co.row3.r":
            "A point of contact who knows the process inside out and can quickly answer questions.",
        "sa.co.row3.l":
            "An AI model focused on a specific task (e.g., ticket classification, summaries, data extraction).",

        "sa.co.row4.r":
            "Feedback during deployment and testing — ideally on real-life data.",
        "sa.co.row4.l":
            "Suggestions for further process improvements if I spot additional bottlenecks during the work.",

        "sa.co.cta.text":
            "Do you have a process that’s “always done manually”, but you feel it could be automated?",
        "sa.co.cta.btn": "Write a few lines about your scenario",

        /* CONTACT / FOOTER (wspólne) */
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
