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