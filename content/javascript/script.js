// ustaw automatycznie liczbę lat doświadczenia
(function(){
  const start = new Date(2017, 11, 1); // ROK, MIESIĄC(0-11), DZIEŃ  -> 1 listopad 2017 (praktyki zawodowe - początek pracy zawodowej)
  const today = new Date();

  let years = today.getFullYear() - start.getFullYear();
  const beforeAnniversary =
    today.getMonth() < start.getMonth() ||
    (today.getMonth() === start.getMonth() && today.getDate() < start.getDate());
  if (beforeAnniversary) years--;

  const num = document.getElementById('expYears');
  if (num){
    num.dataset.target = Math.max(0, years);
    // jeśli sekcja nie ma klasy .reveal/observera, uruchom ręcznie:
    // startCounters([num]);
  }
})();
   

   /* year */
    document.getElementById('year').textContent=new Date().getFullYear();

    /* reveal on view + counters */
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          if(e.target.querySelectorAll && e.target.querySelectorAll('.num').length){ startCounters(e.target.querySelectorAll('.num')); }
          io.unobserve(e.target);
        }
      });
    },{threshold:0.15});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

    /* progress */
    const progress = document.getElementById('progress');
    function onScroll(){
      const scrollTop = window.scrollY;
      const docH = document.body.scrollHeight - window.innerHeight;
      const p = docH>0 ? (scrollTop/docH)*100 : 0; progress.style.width = p+'%';
    }
    document.addEventListener('scroll', onScroll, {passive:true}); onScroll();

    /* project spotlight */
    document.querySelectorAll('.project').forEach(card=>{
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left)/r.width)*100; const y = ((e.clientY - r.top)/r.height)*100;
        card.style.setProperty('--mx', x+'%'); card.style.setProperty('--my', y+'%');
      });
    });

    /* tilt */
    document.querySelectorAll('.tilt').forEach(function(card){
      const strength = 6;
      card.addEventListener('mousemove', function(e){
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width/2; const cy = r.top + r.height/2;
        const dx = (e.clientX - cx) / (r.width/2);
        const dy = (e.clientY - cy) / (r.height/2);
        card.style.transform = 'perspective(900px) rotateX(' + (-dy*strength) + 'deg) rotateY(' + (dx*strength) + 'deg)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; });
    });

    /* counters */
	function startCounters(nodes){
	  nodes.forEach(node=>{
		const target = +node.dataset.target || 0;
		const dur = 1200;
		const t0 = performance.now();

		function step(t){
		  const k = Math.min(1, (t - t0)/dur);
		  const eased = 1 - Math.pow(1-k, 3);
		  const suffix = node.dataset.suffix || "";   // <-- CZYTAJ SUFIKS ZA KAŻDYM KROKIEM
		  node.textContent = Math.round(target * eased) + suffix;
		  if(k<1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	  });
	}


    /* smooth scroll for header links (desktop) */
    document.querySelectorAll('header.nav nav a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if(el){
          e.preventDefault();
          el.scrollIntoView({ behavior:'smooth', block:'start' });
          history.pushState(null, '', '#'+id);
        }
      });
    });

    /* ===== Mobile menu logic ===== */
    const btn = document.getElementById('hamburger');
    const panel = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('backdrop');
	const langToggle = document.querySelector('.lang-toggle');


    function openMenu() {
	  panel.classList.add('open');
	  panel.setAttribute('aria-hidden', 'false');
	  btn.setAttribute('aria-expanded', 'true');
	  backdrop.classList.add('show');

	  if (langToggle) langToggle.classList.add('hide-lang'); // <— ukryj języki
	  const first = panel.querySelector('a');
	  if (first) first.focus({ preventScroll: true });
	}

	function closeMenu() {
	  panel.classList.remove('open');
	  panel.setAttribute('aria-hidden', 'true');
	  btn.setAttribute('aria-expanded', 'false');
	  backdrop.classList.remove('show');

	  if (langToggle) langToggle.classList.remove('hide-lang'); // <— pokaż języki
	  btn.focus({ preventScroll: true });
	}

    btn.addEventListener('click', ()=> (panel.classList.contains('open')? closeMenu():openMenu()));
    backdrop.addEventListener('click', closeMenu);
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && panel.classList.contains('open')) closeMenu(); });

    // smooth scroll + close on click within mobile panel
    panel.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if(el){
          e.preventDefault();
          closeMenu();
          setTimeout(()=>{ el.scrollIntoView({behavior:'smooth', block:'start'}); history.pushState(null,'','#'+id); }, 50);
        }
      });
    });
	



/* === Slider "Certyfikaty" — wersja z geometrią krańców === */
(function () {
  const track = document.getElementById('certs-track');
  if (!track) return;

  const prevBtn = document.querySelector('#certs .hbtn.prev');
  const nextBtn = document.querySelector('#certs .hbtn.next');

  /* ---------- Drag-to-scroll ---------- */
  let isDown = false, startX = 0, startScroll = 0, activePointer = null;

  track.addEventListener('pointerdown', (e) => {
    isDown = true; activePointer = e.pointerId;
    startX = e.clientX; startScroll = track.scrollLeft;
    track.setPointerCapture(activePointer);
    track.style.scrollBehavior = 'auto';
  });
  track.addEventListener('pointermove', (e) => {
    if (!isDown || e.pointerId !== activePointer) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);
  track.addEventListener('pointercancel', endDrag);
  function endDrag(e){
    if (e.pointerId && e.pointerId !== activePointer) return;
    isDown = false; activePointer = null;
    track.style.scrollBehavior = '';
    // po snapie odśwież przyciski
    requestAnimationFrame(() => setTimeout(updateButtons, 60));
  }

  /* ---------- krok przewijania ---------- */
  function cardSize() {
    const first = track.querySelector('.skill-item');
    if (!first) return 300;
    const gap = parseFloat(getComputedStyle(track).gap || '14');
    return first.getBoundingClientRect().width + gap;
  }
  function pageStep() {
    const size = cardSize();
    const perView = Math.max(1, Math.floor(track.clientWidth / size));
    return perView * size;
  }
  function scrollByStep(dir) {
    track.scrollBy({ left: dir * pageStep(), behavior: 'smooth' });
    setTimeout(updateButtons, 280); // poczekaj aż snap „dociągnie”
  }

  /* ---------- wykrywanie krańców geometrią ---------- */
  function updateButtons() {
    const EPS = 1.5; // tolerancja
    const rect = track.getBoundingClientRect();

    const first = track.querySelector('.skill-item');
    const last  = track.querySelector('.skill-item:last-of-type');

    // jeśli brak kart — wyłącz obie
    if (!first || !last) {
      if (prevBtn) prevBtn.classList.add('is-disabled'), prevBtn.setAttribute('aria-disabled','true');
      if (nextBtn) nextBtn.classList.add('is-disabled'), nextBtn.setAttribute('aria-disabled','true');
      return;
    }

    const f = first.getBoundingClientRect();
    const l = last.getBoundingClientRect();

    // atStart: lewa krawędź pierwszej karty nie wychodzi poza lewą krawędź toru
    const atStart = f.left >= rect.left - EPS;

    // atEnd: prawa krawędź ostatniej karty nie wychodzi poza prawą krawędź toru
    const atEnd   = l.right <= rect.right + EPS;

    if (prevBtn) {
      prevBtn.classList.toggle('is-disabled', atStart);
      prevBtn.setAttribute('aria-disabled', String(atStart));
    }
    if (nextBtn) {
      nextBtn.classList.toggle('is-disabled', atEnd);
      nextBtn.setAttribute('aria-disabled', String(atEnd));
    }
  }

  /* ---------- zdarzenia ---------- */
  if (prevBtn) prevBtn.addEventListener('click', () => scrollByStep(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByStep(1));

  track.addEventListener('scroll', updateButtons, { passive: true });
  track.addEventListener('scrollend', updateButtons);
  window.addEventListener('resize', () => setTimeout(updateButtons, 50));

  // dostępność: klawiatura
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByStep(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByStep(-1); }
  });

  // start
  updateButtons();
})();




/* === Back to top: pojawia się od sekcji "Usługi" w dół === */
(function(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;

  // spróbuj znaleźć referencję do sekcji "Usługi"
  let ref = document.getElementById('services');
  if(!ref){
    const h2 = document.querySelector('h2[data-i18n="services.h2"]');
    if(h2) ref = h2.closest('.section');
  }

  // fallback: jeśli nie znaleziono, pokaż po 1 ekranie przewinięcia
  function thresholdY(){
    return ref ? (ref.offsetTop - 80) : (window.innerHeight * 0.9);
  }

  function toggleBtn(){
    const show = window.scrollY >= thresholdY();
    btn.classList.toggle('show', show);
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.addEventListener('scroll', toggleBtn, { passive: true });
  window.addEventListener('resize', () => setTimeout(toggleBtn, 50));
  window.addEventListener('load', toggleBtn);
  toggleBtn();
})();


/* === Liczba publicznych repozytoriów GitHub (bez forków) === */
(function () {
  const username = "DamianJamrozy"; // <- jeśli potrzeba, zmień

  // Znajdź licznik "Projektów na github" bez zmian w HTML:
  // 1) po etykiecie z data-i18n="about.m3", 2) fallback: element #ghRepos (gdybyś przeniósł ID)
  function findGithubCounterNode() {
    const label = document.querySelector('.metric .label[data-i18n="about.m3"]');
    if (label && label.previousElementSibling && label.previousElementSibling.classList.contains('num')) {
      return label.previousElementSibling; // to jest <div class="num"> obok etykiety
    }
    return document.getElementById('ghRepos') || null; // awaryjnie
  }

  async function countPublicOwnedRepos(user) {
    let page = 1, perPage = 100, total = 0;
    while (true) {
      const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=${perPage}&page=${page}&type=owner&sort=updated`);
      if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
      const repos = await res.json();
      total += repos.filter(r => !r.fork && !r.archived).length;
      if (repos.length < perPage) break; // ostatnia strona
      page++;
    }
    return total;
  }

  async function updateGithubProjects() {
    const node = findGithubCounterNode();
    if (!node) return;

    try {
      const n = await countPublicOwnedRepos(username);
      node.dataset.target = String(n);

      // jeśli sekcja już jest w widoku – uruchom animację ręcznie
      if (typeof startCounters === 'function') startCounters([node]);
      else node.textContent = String(n);
    } catch (err) {
      // awaryjnie spróbuj prostszego endpointu (zlicza też forki)
      try {
        const r = await fetch(`https://api.github.com/users/${username}`);
        const user = await r.json();
        const fallback = user.public_repos || 0;
        node.dataset.target = String(fallback);
        if (typeof startCounters === 'function') startCounters([node]);
        else node.textContent = String(fallback);
      } catch(e){
        console.error(err);
      }
    }
  }

  // uruchom po załadowaniu
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateGithubProjects);
  } else {
    updateGithubProjects();
  }
})();
