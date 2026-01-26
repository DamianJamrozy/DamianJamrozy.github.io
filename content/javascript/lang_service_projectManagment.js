/* 1) Słownik NAJPIERW */
const dict = {
    pl: {
        "html.lang": "pl",
        "meta.desc":
            "Mgr inż. Damian Jamroży — inżynieria oprogramowania i project management: architektura, backlog, plan wdrożenia i prowadzenie realizacji.",

        /* NAV / UI (wspólne) */
        "plat.nav.home": "Strona główna",
        "plat.nav.automation": "Automatyzacja",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Aplikacje",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administracja",


        /* SPM — HERO */
        "spm.hero.tag": "Inżynieria oprogramowania &amp; Project Management",
        "spm.hero.h1":
            "Przekuwam pomysł na aplikację w&nbsp;konkretną architekturę i&nbsp;plan działania",
        "spm.hero.lead":
            "Masz wizję produktu, ale nie chcesz gubić się w szczegółach technicznych? Pomogę Ci zaprojektować funkcjonalności, przepływy informacji, strukturę systemu oraz poprowadzę projekt tak, żeby zespół developerski dokładnie wiedział, co i w jakiej kolejności ma zbudować.",
        "spm.hero.cta.primary": "Porozmawiajmy o Twojej aplikacji",
        "spm.hero.cta.secondary": "Zobacz jak poprowadzę projekt",

        "spm.hero.meta1.value": "2+",
        "spm.hero.meta1.label": "lata doświadczenia komercyjnego",
        "spm.hero.meta2.value": "5+",
        "spm.hero.meta2.label": "zaprojektowanych systemów / modułów",
        "spm.hero.meta3.value": "100%",
        "spm.hero.meta3.label": "pracy zdalnej / asynchronicznej",

        "spm.hero.board.title": "Mapa projektu",
        "spm.hero.board.badge": "SE &amp; PM",

        "spm.hero.board.col1.title": "Produkt",
        "spm.hero.board.col1.item1": "User stories",
        "spm.hero.board.col1.item2": "Backlog funkcjonalny",
        "spm.hero.board.col1.item3": "Priorytety biznesowe",

        "spm.hero.board.col2.title": "Technika",
        "spm.hero.board.col2.item1": "Moduły i komponenty",
        "spm.hero.board.col2.item2": "API &amp; integracje",
        "spm.hero.board.col2.item3": "Baza danych / dane",

        "spm.hero.board.col3.title": "Przepływy",
        "spm.hero.board.col3.item1": "Logowanie &amp; onboarding",
        "spm.hero.board.col3.item2": "Proces zakupu / zgłoszenia",
        "spm.hero.board.col3.item3": "Panel admina",

        "spm.hero.board.nodes.user": "Użytkownik",
        "spm.hero.board.nodes.frontend": "Frontend",
        "spm.hero.board.nodes.backend": "Backend",
        "spm.hero.board.nodes.db": "Baza danych",

        "spm.hero.board.caption":
            "Ja spinam całość – zespół dev dostaje jasny, uporządkowany plan.",

        /* SPM — OVERVIEW */
        "spm.overview.kicker": "Od wizji do konkretów",
        "spm.overview.h2": "Najpierw łapiemy pomysł, potem rysujemy system",
        "spm.overview.lead":
            "Ty opowiadasz o produkcie i użytkownikach swoim językiem. Ja układam z tego <strong>logikę, przepływy i wymagania</strong>, z którymi zespół dev wie dokładnie, co ma zbudować.",

        "spm.overview.story1.num": "01",
        "spm.overview.story1.h3": "Rozmowa, w której łapiemy sedno produktu",
        "spm.overview.story1.p":
            "Zamiast od razu mówić o technologiach, rozmawiamy o tym, <strong>co ma się zmienić dla Twoich użytkowników</strong>. Zbieram kontekst biznesowy, ograniczenia i to, co jest absolutnym „must have” w pierwszej wersji.",

        "spm.overview.story2.num": "02",
        "spm.overview.story2.h3": "Przekładam pomysł na logikę systemu",
        "spm.overview.story2.p":
            "Ustalamy role użytkowników, scenariusze i reguły. Na tej podstawie powstają <strong>diagramy systemu i przepływów</strong>, które pokazują jak dane i użytkownicy przechodzą przez aplikację.",

        "spm.overview.story3.num": "03",
        "spm.overview.story3.h3": "Dostajesz materiały startowe dla devów",
        "spm.overview.story3.p":
            "Zbieram całość w przejrzysty pakiet: opis modułów, ścieżki użytkownika, pierwszą wersję backlogu. Zespół dev dostaje <strong>konkretny plan, a nie luźne pomysły</strong>.",

        "spm.overview.footer.label": "Najczęściej wchodzę w projekt, gdy:",
        "spm.overview.footer.li1":
            "masz pomysł na aplikację, ale <strong>nie masz jeszcze sensownej specyfikacji</strong>,",
        "spm.overview.footer.li2":
            "chcesz przygotować <strong>zakres pod rozmowę z software house’em</strong> lub własnym zespołem,",
        "spm.overview.footer.li3":
            "potrzebujesz kogoś, kto <strong>poukłada wymagania i kolejność prac</strong> przed startem developmentu.",

        /* SPM — FLOW */
        "spm.flow.kicker": "Jak to wygląda w praktyce",
        "spm.flow.h2":
            "Ty opowiadasz o produkcie, ja układam z tego plan dla zespołu dev",
        "spm.flow.lead":
            "Poniżej masz <strong>realny flow współpracy</strong> – bez buzzwordów. Od pierwszej rozmowy do dokumentacji i backlogu gotowego do wdrożenia.",

        "spm.flow.step1.num": "01",
        "spm.flow.step1.h3": "Discovery call / warsztat startowy",
        "spm.flow.step1.p":
            "Zbieram wszystko, co wiesz o produkcie: kontekst biznesowy, użytkownicy, konkurencja, ograniczenia czasowe i budżetowe. Ustalamy, co absolutnie <strong>musi znaleźć się w pierwszej wersji (MVP)</strong>.",

        "spm.flow.step2.num": "02",
        "spm.flow.step2.h3": "Mapa ról, modułów i ekranów",
        "spm.flow.step2.p":
            "Rozpisuję system na role (np. klient, admin, partner) oraz moduły (panel klienta, panel admina, integracje). Powstaje mapa tego, <strong>co faktycznie budujemy</strong>.",

        "spm.flow.step3.num": "03",
        "spm.flow.step3.h3": "Przepływy informacji i procesy",
        "spm.flow.step3.p":
            "Projektuję, krok po kroku, jak użytkownik przechodzi przez procesy: rejestracja, logowanie, zakup, zgłoszenie, obsługa w panelu. To tutaj powstają <strong>diagramy systemu i przepływów</strong>.",

        "spm.flow.step4.num": "04",
        "spm.flow.step4.h3": "Dokumentacja i backlog",
        "spm.flow.step4.p":
            "Zbieram całość w <strong>zrozumiałe dla devów materiały</strong>: opis modułów, user stories, kryteria akceptacji, propozycja sprintów. Wszystko w narzędziu, którego używa Twój zespół (np. Jira, ClickUp, Trello).",

        "spm.flow.step5.num": "05",
        "spm.flow.step5.h3": "Nadzór nad realizacją (opcjonalnie)",
        "spm.flow.step5.p":
            "Jeśli chcesz, zostaję w projekcie jako PM / Proxy PO: <strong>pilnuję zakresu, doprecyzowuję wymagania</strong>, odpowiadam devom, pomagam Ci decydować, co wchodzi do kolejnych iteracji.",

        /* SPM — COLLAB */
        "spm.collab.kicker": "Forma współpracy",
        "spm.collab.h2":
            "Na koniec masz jasny obraz systemu i konkrety dla devów",
        "spm.collab.lead":
            "Zamiast „zobaczymy w trakcie” – dostajesz <strong>konkretny zestaw materiałów</strong>, na których można oprzeć development.",

        "spm.collab.outcomes.eyebrow": "Po naszej współpracy masz:",
        "spm.collab.outcomes.li1":
            '<span class="spm-outcome-dot"></span><div><strong>Zakres funkcjonalny</strong><p>Spójny opis ról użytkowników, modułów i głównych scenariuszy. Wystarczająco konkretny, żeby wycenić i zaplanować projekt.</p></div>',
        "spm.collab.outcomes.li2":
            '<span class="spm-outcome-dot"></span><div><strong>Diagramy i przepływy</strong><p>Proste schematy pokazujące, jak użytkownicy i dane „przechodzą” przez system – przydatne dla devów, biznesu i UX.</p></div>',
        "spm.collab.outcomes.li3":
            '<span class="spm-outcome-dot"></span><div><strong>Backlog dla zespołu dev</strong><p>User stories, kryteria akceptacji i priorytety – tak opisane, żeby można je było od razu wrzucić w sprinty.</p></div>',
        "spm.collab.outcomes.li4":
            '<span class="spm-outcome-dot"></span><div><strong>Plan iteracji / MVP</strong><p>Propozycja pierwszych wydań: co musi być w MVP, co później, a co można odłożyć bez utraty wartości.</p></div>',

        "spm.collab.modes.eyebrow": "W jakiej formule możemy to zrobić:",
        "spm.collab.modes.li1":
            '<div class="spm-mode-header"><span class="spm-mode-name">Project blueprint</span><span class="spm-mode-tag">najczęstsza opcja</span></div><p>Kilka tygodni pracy nad zakresem, diagramami i backlogiem. Kończymy, gdy masz <strong>komplet materiałów startowych</strong> dla zespołu dev lub software house’u.</p>',
        "spm.collab.modes.li2":
            '<div class="spm-mode-header"><span class="spm-mode-name">PM / Proxy PO przy wdrożeniu</span></div><p>Dołączam do projektu, pomagam dowozić sprinty, doprecyzowywać wymagania, odpowiadać devom i pilnować, żeby produkt nie rozjechał się względem założeń.</p>',
        "spm.collab.modes.li3":
            '<div class="spm-mode-header"><span class="spm-mode-name">Konsultacje „on demand”</span></div><p>Dla projektów, które już trwają – gdy trzeba uporządkować wymagania, kolejność prac albo przygotować projekt pod rozmowę z zespołem dev / software house’em.</p>',

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
        "contact.brief.p":
            "Możesz wkleić gotowe odpowiedzi w mailu — ułatwi to wycenę i timeline.",
        "contact.pill1": "Rzeszów, Polska",
        "contact.pill2": "Odpowiedź ≤ 24h",
        "footer.rights": "Wszystkie prawa zastrzeżone."
    },

    en: {
        "html.lang": "en",
        "meta.desc":
            "MSc Eng. Damian Jamroży — software engineering & project management: architecture, backlog, delivery plan, and project leadership.",

        /* NAV / UI (wspólne) */
        "plat.nav.home": "Home",
        "plat.nav.automation": "Automation",
        "plat.nav.redesign": "Redesign",
        "plat.nav.apps": "Applications",
        "plat.nav.sepm": "SE & PM",
        "plat.nav.administration": "Administration",


        /* SPM — HERO */
        "spm.hero.tag": "Software Engineering &amp; Project Management",
        "spm.hero.h1":
            "I turn your app idea into a clear architecture and an execution plan",
        "spm.hero.lead":
            "You have a product vision but don’t want to get lost in technical details? I’ll help you design features, information flows, and system structure — and run the project so the dev team knows exactly what to build and in what order.",
        "spm.hero.cta.primary": "Let’s talk about your app",
        "spm.hero.cta.secondary": "See how I run the project",

        "spm.hero.meta1.value": "2+",
        "spm.hero.meta1.label": "years of commercial experience",
        "spm.hero.meta2.value": "5+",
        "spm.hero.meta2.label": "designed systems / modules",
        "spm.hero.meta3.value": "100%",
        "spm.hero.meta3.label": "remote / async work",

        "spm.hero.board.title": "Project map",
        "spm.hero.board.badge": "SE &amp; PM",

        "spm.hero.board.col1.title": "Product",
        "spm.hero.board.col1.item1": "User stories",
        "spm.hero.board.col1.item2": "Functional backlog",
        "spm.hero.board.col1.item3": "Business priorities",

        "spm.hero.board.col2.title": "Engineering",
        "spm.hero.board.col2.item1": "Modules & components",
        "spm.hero.board.col2.item2": "APIs & integrations",
        "spm.hero.board.col2.item3": "Database / data",

        "spm.hero.board.col3.title": "Flows",
        "spm.hero.board.col3.item1": "Login & onboarding",
        "spm.hero.board.col3.item2": "Purchase / ticket process",
        "spm.hero.board.col3.item3": "Admin panel",

        "spm.hero.board.nodes.user": "User",
        "spm.hero.board.nodes.frontend": "Frontend",
        "spm.hero.board.nodes.backend": "Backend",
        "spm.hero.board.nodes.db": "Database",

        "spm.hero.board.caption":
            "I connect the dots — the dev team gets a clear, structured plan.",

        /* SPM — OVERVIEW */
        "spm.overview.kicker": "From vision to specifics",
        "spm.overview.h2": "First we capture the idea, then we map the system",
        "spm.overview.lead":
            "You explain the product and users in your own words. I translate it into <strong>logic, flows, and requirements</strong> that help the dev team know exactly what to build.",

        "spm.overview.story1.num": "01",
        "spm.overview.story1.h3": "A conversation to capture the core of the product",
        "spm.overview.story1.p":
            "Instead of starting with tech, we talk about <strong>what should change for your users</strong>. I gather business context, constraints, and what’s an absolute must-have for the first version.",

        "spm.overview.story2.num": "02",
        "spm.overview.story2.h3": "I translate the idea into system logic",
        "spm.overview.story2.p":
            "We define user roles, scenarios, and rules. Based on that, we create <strong>system and flow diagrams</strong> showing how users and data move through the application.",

        "spm.overview.story3.num": "03",
        "spm.overview.story3.h3": "You get a solid starter package for developers",
        "spm.overview.story3.p":
            "I compile everything into a clear package: module descriptions, user journeys, and the first backlog version. The dev team gets <strong>a concrete plan, not loose ideas</strong>.",

        "spm.overview.footer.label": "Most often I join when:",
        "spm.overview.footer.li1":
            "you have an app idea but <strong>don’t have a sensible specification yet</strong>,",
        "spm.overview.footer.li2":
            "you want to prepare <strong>scope for talks with a software house</strong> or your own team,",
        "spm.overview.footer.li3":
            "you need someone to <strong>organize requirements and work order</strong> before development starts.",

        /* SPM — FLOW */
        "spm.flow.kicker": "How it works in practice",
        "spm.flow.h2":
            "You talk about the product — I turn it into a plan for the dev team",
        "spm.flow.lead":
            "Below is a <strong>real collaboration flow</strong> — no buzzwords. From the first call to documentation and a backlog ready for implementation.",

        "spm.flow.step1.num": "01",
        "spm.flow.step1.h3": "Discovery call / kickoff workshop",
        "spm.flow.step1.p":
            "I collect everything you know about the product: business context, users, competitors, timeline and budget constraints. We define what absolutely <strong>must be in the first version (MVP)</strong>.",

        "spm.flow.step2.num": "02",
        "spm.flow.step2.h3": "Map of roles, modules, and screens",
        "spm.flow.step2.p":
            "I break the system down into roles (e.g., customer, admin, partner) and modules (customer panel, admin panel, integrations). We create a map of <strong>what we’re actually building</strong>.",

        "spm.flow.step3.num": "03",
        "spm.flow.step3.h3": "Information flows and processes",
        "spm.flow.step3.p":
            "I design, step by step, how users move through key processes: registration, login, purchase, tickets, and admin workflows. This is where <strong>system and flow diagrams</strong> are created.",

        "spm.flow.step4.num": "04",
        "spm.flow.step4.h3": "Documentation and backlog",
        "spm.flow.step4.p":
            "I compile everything into <strong>developer-friendly materials</strong>: module descriptions, user stories, acceptance criteria, and sprint proposals — in the tool your team uses (e.g., Jira, ClickUp, Trello).",

        "spm.flow.step5.num": "05",
        "spm.flow.step5.h3": "Delivery oversight (optional)",
        "spm.flow.step5.p":
            "If you want, I stay as PM / Proxy PO: <strong>I protect scope and clarify requirements</strong>, answer dev questions, and help you decide what goes into the next iterations.",

        /* SPM — COLLAB */
        "spm.collab.kicker": "Collaboration format",
        "spm.collab.h2":
            "In the end, you get a clear system picture and concrete dev-ready materials",
        "spm.collab.lead":
            "Instead of “we’ll see as we go” — you receive a <strong>concrete set of deliverables</strong> you can base development on.",

        "spm.collab.outcomes.eyebrow": "After our work, you have:",
        "spm.collab.outcomes.li1":
            '<span class="spm-outcome-dot"></span><div><strong>Functional scope</strong><p>A coherent description of user roles, modules, and main scenarios — concrete enough to estimate and plan the project.</p></div>',
        "spm.collab.outcomes.li2":
            '<span class="spm-outcome-dot"></span><div><strong>Diagrams and flows</strong><p>Simple schemes showing how users and data move through the system — useful for devs, business, and UX.</p></div>',
        "spm.collab.outcomes.li3":
            '<span class="spm-outcome-dot"></span><div><strong>Dev team backlog</strong><p>User stories, acceptance criteria, and priorities — written so they can be put into sprints right away.</p></div>',
        "spm.collab.outcomes.li4":
            '<span class="spm-outcome-dot"></span><div><strong>Iteration / MVP plan</strong><p>A proposal for releases: what must be in MVP, what comes later, and what can be postponed without losing value.</p></div>',

        "spm.collab.modes.eyebrow": "We can do it in these formats:",
        "spm.collab.modes.li1":
            '<div class="spm-mode-header"><span class="spm-mode-name">Project blueprint</span><span class="spm-mode-tag">most common option</span></div><p>A few weeks focused on scope, diagrams, and backlog. We finish when you have a <strong>complete starter package</strong> for your dev team or software house.</p>',
        "spm.collab.modes.li2":
            '<div class="spm-mode-header"><span class="spm-mode-name">PM / Proxy PO during delivery</span></div><p>I join the project to help ship sprints, clarify requirements, answer dev questions, and make sure the product stays aligned with the original assumptions.</p>',
        "spm.collab.modes.li3":
            '<div class="spm-mode-header"><span class="spm-mode-name">On-demand consultations</span></div><p>For projects already in progress — when you need to organize requirements, work order, or prepare scope for talks with a dev team / software house.</p>',

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
