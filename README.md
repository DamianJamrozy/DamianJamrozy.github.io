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

## SEO i dane osoby

Każda podstrona zawiera gotowe metadane PL i JSON-LD w HTML. Sekcja `seo-data` w jej `<head>` przechowuje tytuł i opis PL/EN. Skrypt `content/javascript/seo.js` aktualizuje metadane po zmianie języka przez istniejące tłumaczenia; nie zmienia treści ani stylów strony.

Przy zmianie tytułu lub opisu zachowaj zgodność między domyślnym `<title>`, meta description, Open Graph, Twitter, węzłem strony w JSON-LD oraz polskim wpisem `seo-data`. Dane osoby mają wspólny identyfikator `https://damianjamrozy.github.io/#person` i powinny pozostać identyczne na wszystkich stronach. Adres kanoniczny PL to podstawowy adres podstrony, a EN dodaje `?lang=en`.

Plik `lang_about.js` jest oznaczony jako wygenerowany i pozostaje bez ręcznych zmian; adapter SEO uwzględnia jego starszą obsługę opisu. Nowych metadanych nie dodawaj do słowników tłumaczeń interfejsu. `working_on.html` pozostaje poza indeksem i mapami. Nie dopisuj `lastmod`, jeśli nie znasz rzeczywistej daty zmiany treści.

Kontrola bez dodatkowych zależności:

```powershell
node --test tests/seo.test.mjs
```

Publikacja nadal polega na przesłaniu statycznych plików na GitHub Pages. SEO nie wymaga serwera aplikacyjnego ani budowania strony.
