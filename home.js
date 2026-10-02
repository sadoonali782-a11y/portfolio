// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme){
  if(theme === 'dark'){
    root.setAttribute('data-theme','dark');
    themeToggle.textContent = '☀️';
  } else {
    root.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
  }
}

applyTheme(localStorage.getItem('theme') || 'light');

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

 //mobile menue toggle
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
 
(function () {
  const el = document.getElementById('typed');
  if (!el) return;

  const phrases = [
    'student.',
    'web page builder.',
    'HTML & CSS learner.',
    'future full-stack developer.'
  ];

   
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = phrases[0];
    return;
  }

  let p = 0, i = 0, deleting = false;

  function tick() {
    const word = phrases[p];
    el.textContent = word.slice(0, i);

    let delay = deleting ? 40 : 90;           

    if (!deleting && i === word.length) {     
      deleting = true;
      delay = 1400;
    } else if (deleting && i === 0) {        
      deleting = false;
      p = (p + 1) % phrases.length;
      delay = 400;
    } else {
      i += deleting ? -1 : 1;
    }
    setTimeout(tick, delay);
  }
  tick();
})();
 // Top-right weather badge (Open-Meteo, no API key), refreshes every 6 seconds
(function () {
  const CITY = 'Faisalabad';   // name shown
  const LAT = 31.4504;         // coordinates of the city
  const LON = 73.1350;
  const REFRESH_MS = 6000;     // 6 seconds

  const nav = document.querySelector('.nav');
  const themeBtn = document.getElementById('themeToggle');
  if (!nav) return;

  const style = document.createElement('style');
  style.textContent = `
    .w-badge{margin-left:auto;margin-right:10px;display:inline-flex;align-items:center;gap:6px;
      border:1px solid var(--line);border-radius:100px;padding:7px 14px;
      font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--ink);white-space:nowrap}
    .w-badge .w-temp{color:var(--accent);font-weight:500}
    @media (max-width:420px){.w-badge{padding:6px 10px;font-size:.68rem}}
  `;
  document.head.appendChild(style);

  const badge = document.createElement('span');
  badge.className = 'w-badge';
  badge.textContent = CITY + ' · …';
  nav.insertBefore(badge, themeBtn);

  let loading = false;

  async function load() {
    if (loading || document.hidden) return;   // skip if already loading or the tab is in the background
    loading = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON +
        '&current=temperature_2m&timezone=auto',
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();

      badge.textContent = CITY + ' ';
      const t = document.createElement('span');
      t.className = 'w-temp';
      t.textContent = Math.round(data.current.temperature_2m) + '°C';
      badge.appendChild(t);
    } catch (e) {
      // keep the last temperature on screen if one refresh fails
    } finally {
      clearTimeout(timer);
      loading = false;
    }
  }

  load();                          // first load right away
  setInterval(load, REFRESH_MS);   // then every 6 seconds
})();