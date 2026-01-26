/* =========================================================
   lang_service_supportDatabase.js
   ========================================================= */

const dict = {
    pl: {
        "html.lang": "pl",
        "meta.desc":
            "Administracja baz danych MSSQL, MySQL i PostgreSQL. Wydajność, bezpieczeństwo, backupy, monitoring i warstwy raportowe.",

        /* NAV */
        "plat.nav.home": "Strona główna",
        "plat.nav.automation": "Automatyzacja",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Aplikacje",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administracja",
        "plat.side.portfolio": "PORTFOLIO",

        /* HERO */
        "sdb.hero.tag": "Administracja baz danych & systemów",
        "sdb.hero.h1":
            "Dbam o to, żeby Twoje dane były szybkie, bezpieczne i zawsze dostępne",
        "sdb.hero.lead":
            "Jeśli Twoja aplikacja stoi na MSSQL lub innej bazie danych, mogę przejąć na siebie <strong>administrację instancjami</strong>, <strong>optymalizację zapytań</strong>, monitoring wydajności i <strong>bezpieczne kopie zapasowe</strong> – tak, żebyś Ty mógł skupić się na biznesie, a nie na problemach z bazą.",
        "sdb.hero.cta.primary": "Porozmawiajmy o Twojej bazie",
        "sdb.hero.cta.secondary": "Zobacz, w czym pomagam",

        "sdb.hero.meta1.value": "MSSQL, MySQL, PostgreSQL",
        "sdb.hero.meta1.label": "tworzenie, zarządzanie",
        "sdb.hero.meta2.value": "Zestawienia & Monitoring",
        "sdb.hero.meta2.label": "raporty, korelacje",

        /* PANEL */
        "sdb.hero.panel.title": "DB Cluster · PROD-EU-1",
        "sdb.hero.panel.env": "ONLINE",

        "sdb.hero.panel.metric.cpu.label": "CPU",
        "sdb.hero.panel.metric.cpu.value": "42%",
        "sdb.hero.panel.metric.ram.label": "RAM",
        "sdb.hero.panel.metric.ram.value": "68%",
        "sdb.hero.panel.metric.iops.label": "IOPS",
        "sdb.hero.panel.metric.iops.value": "7.3k",
        "sdb.hero.panel.metric.qps.label": "Queries / s",
        "sdb.hero.panel.metric.qps.value": "5.6k",

        "sdb.hero.panel.node.primary.label": "Primary",
        "sdb.hero.panel.node.primary.meta": "MSSQL · 1,2 TB",
        "sdb.hero.panel.node.replica.label": "Replica-EU",
        "sdb.hero.panel.node.replica.meta": "Read-only",
        "sdb.hero.panel.node.reporting.label": "Reporting",
        "sdb.hero.panel.node.reporting.meta": "ETL & raporty",

        "sdb.hero.panel.footer.backup.label": "Ostatni backup",
        "sdb.hero.panel.footer.backup.value": "dziś · 02:15 · pełny",
        "sdb.hero.panel.footer.latency.label": "Średni czas odpowiedzi",
        "sdb.hero.panel.footer.latency.value": "< 40 ms",

        /* SERVICES */
        "sdb.services.kicker": "Zakres wsparcia",
        "sdb.services.h2":
            "Co mogę wziąć na siebie przy Twoich bazach danych",
        "sdb.services.lead":
            "Od pojedynczej instancji MSSQL po rozbudowane środowiska z replikami i raportowaniem – mogę przejąć na siebie <strong>utrzymanie, optymalizację i bezpieczeństwo</strong> Twoich baz.",

        "sdb.services.card1.h3": "Administracja instancjami MSSQL",
        "sdb.services.card1.p":
            "Konfiguracja serwerów, bazy systemowe, uprawnienia, plany utrzymania. Dbam o to, żeby środowisko było <strong>spójne i przewidywalne</strong>.",
        "sdb.services.card1.li1": "konfiguracja instancji (Windows / Linux)",
        "sdb.services.card1.li2": "zarządzanie logami i plikami danych",
        "sdb.services.card1.li3": "role, loginy, uprawnienia",

        "sdb.services.card2.h3": "Wydajność i zdrowie baz",
        "sdb.services.card2.p":
            "Szukam wąskich gardeł i poprawiam to, co naprawdę spowalnia aplikację: <strong>indeksy, statystyki, zapytania, blokady</strong>.",
        "sdb.services.card2.li1": "przegląd indeksów i statystyk",
        "sdb.services.card2.li2": "analiza najcięższych zapytań",
        "sdb.services.card2.li3": "monitoring blokad i deadlocków",

        "sdb.services.card3.h3": "Backup, odzyskiwanie i bezpieczeństwo",
        "sdb.services.card3.p":
            "Projektuję i testuję <strong>scenariusze awaryjne</strong> tak, żebyś wiedział, co się stanie gdy coś pójdzie nie tak.",
        "sdb.services.card3.li1": "strategie kopii zapasowych (full / diff / log)",
        "sdb.services.card3.li2": "testy odtworzeniowe",
        "sdb.services.card3.li3": "podstawowa twarda konfiguracja bezpieczeństwa",

        "sdb.services.card4.h3": "Raporty i dane pod analizy",
        "sdb.services.card4.p":
            "Przygotowuję dane tak, żeby raporty były <strong>szybkie i powtarzalne</strong>, a nie „na szybko” odpalane zapytania z produkcji.",
        "sdb.services.card4.li1": "widoki i procedury pod raporty",
        "sdb.services.card4.li2": "proste pipeline’y ETL / staging",
        "sdb.services.card4.li3": "dane pod Power BI / inne narzędzia BI",

        /* FLOW */
        "sdb.flow.kicker": "Jak to działa w praktyce",
        "sdb.flow.h2":
            "Prosty proces, dzięki któremu baza przestaje być „czarną skrzynką”",
        "sdb.flow.lead":
            "Nie potrzebujesz znać wszystkich DMV i widoków systemowych. <strong>Ja wchodzę w techniczne szczegóły</strong>, Ty dostajesz jasny obraz sytuacji i rekomendacje.",

        "sdb.flow.step1.num": "01",
        "sdb.flow.step1.h3": "Audyt bieżącego środowiska",
        "sdb.flow.step1.p":
            "Sprawdzam konfigurację instancji, plany backupów, indeksy, najcięższe zapytania i ogólny stan „zdrowia” bazy.",
        "sdb.flow.step1.note":
            "Efekt: krótki raport + lista problemów, które naprawdę bolą.",

        "sdb.flow.step2.num": "02",
        "sdb.flow.step2.h3": "Plan uporządkowania i optymalizacji",
        "sdb.flow.step2.p":
            "Ustalamy priorytety: co robimy najpierw, a co może poczekać. Rozbijam to na <strong>małe, zrozumiałe kroki</strong>.",
        "sdb.flow.step2.note":
            "Efekt: roadmapa zmian technicznych + szacowany wpływ na system.",

        "sdb.flow.step3.num": "03",
        "sdb.flow.step3.h3": "Regularne utrzymanie i rozwój",
        "sdb.flow.step3.p":
            "Wdrażamy zmiany, ustawiamy monitoring i cyklicznie sprawdzamy wydajność i bezpieczeństwo.",
        "sdb.flow.step3.note":
            "Efekt: baza, o której przypominasz sobie dopiero, gdy ktoś ją pochwali.",

        /* SCENARIOS */
        "sdb.scenarios.kicker": "Dla kogo",
        "sdb.scenarios.h2":
            "Wchodzę tam, gdzie baza zaczyna być krytyczna dla biznesu",
        "sdb.scenarios.lead":
            "Niezależnie od skali – liczy się to, jak bardzo polegasz na danych.",

        "sdb.scenarios.card1.h3":
            "Rosnąca aplikacja SaaS / wewnętrzny system",
        "sdb.scenarios.card1.p":
            "Więcej klientów, więcej danych i pierwsze spadki wydajności.",
        "sdb.scenarios.card1.li1":
            "problemy z wydajnością / blokadami",
        "sdb.scenarios.card1.li2": "brak dedykowanego DBA",
        "sdb.scenarios.card1.li3":
            "plany rozwoju produktu",

        "sdb.scenarios.card2.h3": "Raporty, które liczą się minutami",
        "sdb.scenarios.card2.p":
            "Raporty dla zarządu, księgowości czy sprzedaży są wolne i chaotyczne.",
        "sdb.scenarios.card2.li1":
            "brak warstwy raportowej",
        "sdb.scenarios.card2.li2":
            "zapytania na produkcji",
        "sdb.scenarios.card2.li3":
            "brak modelu danych",

        "sdb.scenarios.card3.h3":
            "Środowisko, którego boisz się dotknąć",
        "sdb.scenarios.card3.p":
            "Brak pewności co do backupów, aktualizacji i dokumentacji.",
        "sdb.scenarios.card3.li1":
            "niepewne backupy",
        "sdb.scenarios.card3.li2":
            "stare wersje MSSQL",
        "sdb.scenarios.card3.li3":
            "brak dokumentacji",

        "sdb.scenarios.cta.text":
            "Jeśli widzisz tu swoją sytuację — krótka rozmowa wiele wyjaśni.",
        "sdb.scenarios.cta.btn":
            "Opowiedz mi o swoim środowisku",

        /* CONTACT */
        "contact.h2": "Skontaktuj się ze mną",
        "contact.lead":
            "Opowiedz krótko o projekcie: cel, zakres, termin i budżet.",
        "contact.fast.h3": "Szybki kontakt",
        "contact.fast.cta": "Napisz e-mail",
        "contact.brief.h3": "Brief startowy",
        "contact.brief.i1":
            "Jaki problem chcesz rozwiązać?",
        "contact.brief.i2":
            "Do kogo kierujemy produkt?",
        "contact.brief.i3":
            "Co już masz?",
        "contact.brief.i4":
            "Deadline i budżet?",
        "contact.brief.p":
            "Możesz wkleić odpowiedzi bezpośrednio w mailu.",
        "contact.pill1": "Rzeszów, Polska",
        "contact.pill2": "Odpowiedź ≤ 24h",
        "footer.rights":
            "Wszystkie prawa zastrzeżone."
    },

    /* ======================= EN ======================= */
    en: {
        "html.lang": "en",
        "meta.desc":
            "Database administration for MSSQL, MySQL and PostgreSQL. Performance, security, backups, monitoring and reporting layers.",

        "plat.nav.home": "Home",
        "plat.nav.automation": "Automation",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Applications",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administration",
        "plat.side.portfolio": "PORTFOLIO",

        "sdb.hero.tag": "Database & system administration",
        "sdb.hero.h1":
            "I keep your data fast, secure, and always available",
        "sdb.hero.lead":
            "If your application runs on MSSQL or another database, I can handle <strong>instance administration</strong>, <strong>query optimization</strong>, performance monitoring and <strong>secure backups</strong> — so you can focus on the business.",
        "sdb.hero.cta.primary":
            "Let’s talk about your database",
        "sdb.hero.cta.secondary":
            "See how I can help",

        "sdb.hero.meta1.value":
            "MSSQL, MySQL, PostgreSQL",
        "sdb.hero.meta1.label":
            "setup & management",
        "sdb.hero.meta2.value":
            "Dashboards & Monitoring",
        "sdb.hero.meta2.label":
            "reports, correlations",

        "sdb.hero.panel.title":
            "DB Cluster · PROD-EU-1",
        "sdb.hero.panel.env": "ONLINE",

        "sdb.hero.panel.metric.cpu.label":
            "CPU",
        "sdb.hero.panel.metric.cpu.value":
            "42%",
        "sdb.hero.panel.metric.ram.label":
            "RAM",
        "sdb.hero.panel.metric.ram.value":
            "68%",
        "sdb.hero.panel.metric.iops.label":
            "IOPS",
        "sdb.hero.panel.metric.iops.value":
            "7.3k",
        "sdb.hero.panel.metric.qps.label":
            "Queries / s",
        "sdb.hero.panel.metric.qps.value":
            "5.6k",

        "sdb.hero.panel.node.primary.label":
            "Primary",
        "sdb.hero.panel.node.primary.meta":
            "MSSQL · 1.2 TB",
        "sdb.hero.panel.node.replica.label":
            "Replica-EU",
        "sdb.hero.panel.node.replica.meta":
            "Read-only",
        "sdb.hero.panel.node.reporting.label":
            "Reporting",
        "sdb.hero.panel.node.reporting.meta":
            "ETL & reports",

        "sdb.hero.panel.footer.backup.label":
            "Last backup",
        "sdb.hero.panel.footer.backup.value":
            "today · 02:15 · full",
        "sdb.hero.panel.footer.latency.label":
            "Average response time",
        "sdb.hero.panel.footer.latency.value":
            "< 40 ms",

        "sdb.services.kicker":
            "Scope of support",
        "sdb.services.h2":
            "How I can support your databases",
        "sdb.services.lead":
            "From a single MSSQL instance to complex environments — maintenance, optimization and security.",

        "sdb.services.card1.h3":
            "MSSQL instance administration",
        "sdb.services.card1.p":
            "Server setup, system databases, permissions and maintenance plans.",
        "sdb.services.card1.li1":
            "instance configuration (Windows / Linux)",
        "sdb.services.card1.li2":
            "log and data file management",
        "sdb.services.card1.li3":
            "roles, logins, permissions",

        "sdb.services.card2.h3":
            "Performance and database health",
        "sdb.services.card2.p":
            "Finding bottlenecks: indexes, statistics, queries and locks.",
        "sdb.services.card2.li1":
            "index and statistics review",
        "sdb.services.card2.li2":
            "analysis of heavy queries",
        "sdb.services.card2.li3":
            "lock and deadlock monitoring",

        "sdb.services.card3.h3":
            "Backups, recovery and security",
        "sdb.services.card3.p":
            "Designing and testing disaster recovery scenarios.",
        "sdb.services.card3.li1":
            "backup strategies (full / diff / log)",
        "sdb.services.card3.li2":
            "restore tests",
        "sdb.services.card3.li3":
            "basic security hardening",

        "sdb.services.card4.h3":
            "Reporting and analytics data",
        "sdb.services.card4.p":
            "Data prepared for fast, repeatable reporting.",
        "sdb.services.card4.li1":
            "reporting views and procedures",
        "sdb.services.card4.li2":
            "simple ETL / staging pipelines",
        "sdb.services.card4.li3":
            "data for Power BI / BI tools",

        "sdb.flow.kicker":
            "How it works",
        "sdb.flow.h2":
            "A simple process that removes database guesswork",
        "sdb.flow.lead":
            "I handle the technical details — you get clarity.",

        "sdb.flow.step1.num":
            "01",
        "sdb.flow.step1.h3":
            "Environment audit",
        "sdb.flow.step1.p":
            "Review of configuration, backups, indexes and performance.",
        "sdb.flow.step1.note":
            "Outcome: report and prioritized issues.",

        "sdb.flow.step2.num":
            "02",
        "sdb.flow.step2.h3":
            "Optimization plan",
        "sdb.flow.step2.p":
            "Clear priorities and small, understandable steps.",
        "sdb.flow.step2.note":
            "Outcome: technical roadmap.",

        "sdb.flow.step3.num":
            "03",
        "sdb.flow.step3.h3":
            "Ongoing maintenance",
        "sdb.flow.step3.p":
            "Monitoring, improvements and regular reviews.",
        "sdb.flow.step3.note":
            "Outcome: stable and predictable database.",

        "sdb.scenarios.kicker":
            "Who it’s for",
        "sdb.scenarios.h2":
            "When the database becomes business-critical",
        "sdb.scenarios.lead":
            "What matters is how much you rely on data.",

        "sdb.scenarios.card1.h3":
            "Growing SaaS / internal system",
        "sdb.scenarios.card1.p":
            "More data, more load, first performance issues.",
        "sdb.scenarios.card1.li1":
            "performance or locking problems",
        "sdb.scenarios.card1.li2":
            "no dedicated DB owner",
        "sdb.scenarios.card1.li3":
            "product growth plans",

        "sdb.scenarios.card2.h3":
            "Slow, painful reports",
        "sdb.scenarios.card2.p":
            "Reports take minutes and create chaos.",
        "sdb.scenarios.card2.li1":
            "no reporting layer",
        "sdb.scenarios.card2.li2":
            "ad-hoc production queries",
        "sdb.scenarios.card2.li3":
            "no analytics data model",

        "sdb.scenarios.card3.h3":
            "An environment you’re afraid to touch",
        "sdb.scenarios.card3.p":
            "Uncertainty around backups, upgrades and ownership.",
        "sdb.scenarios.card3.li1":
            "uncertain backups",
        "sdb.scenarios.card3.li2":
            "old MSSQL versions",
        "sdb.scenarios.card3.li3":
            "no documentation",

        "sdb.scenarios.cta.text":
            "If you recognize your situation here — a short call can help a lot.",
        "sdb.scenarios.cta.btn":
            "Tell me about your environment",

        "contact.h2": "Get in touch",
        "contact.lead":
            "Briefly describe your project: goal, scope, timeline and budget.",
        "contact.fast.h3": "Quick contact",
        "contact.fast.cta": "Send e-mail",
        "contact.brief.h3": "Starter brief",
        "contact.brief.i1":
            "What problem do you want to solve?",
        "contact.brief.i2":
            "Who is the product for?",
        "contact.brief.i3":
            "What do you already have?",
        "contact.brief.i4":
            "Deadline and budget?",
        "contact.brief.p":
            "You can paste answers directly into the e-mail.",
        "contact.pill1": "Rzeszów, Poland",
        "contact.pill2": "Reply ≤ 24h",
        "footer.rights":
            "All rights reserved."
    }
};

/* ================= ENGINE ================= */
function applyLang(lang) {
    const t = dict[lang] || dict.pl;

    document.documentElement.setAttribute("lang", t["html.lang"]);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t["meta.desc"]);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (t[key]) el.innerHTML = t[key];
    });

    localStorage.setItem("lang", lang);
    document.getElementById("btn-pl")?.setAttribute("aria-pressed", lang === "pl");
    document.getElementById("btn-en")?.setAttribute("aria-pressed", lang === "en");
}

function getInitialLang() {
    const usp = new URLSearchParams(location.search);
    const urlLang = usp.get("lang");
    const saved = localStorage.getItem("lang");
    return (urlLang === "pl" || urlLang === "en") ? urlLang : (saved || "pl");
}

document.addEventListener("DOMContentLoaded", () => {
    const lang = getInitialLang();
    applyLang(lang);

    document.getElementById("btn-pl")?.addEventListener("click", () => applyLang("pl"));
    document.getElementById("btn-en")?.addEventListener("click", () => applyLang("en"));
});
