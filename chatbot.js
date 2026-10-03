(function () {
  const API_URL = "/api/chat"; // if the site stays on GitHub Pages, use your full Vercel URL here
  const GREETING = "Hi! I'm Sadoon. Ask me about my skills, projects or background.";
  const CHIPS = ["What projects have you built?", "What skills do you have?", "Who are you?", "How can I contact you?"];

  let history = [];
  try { history = JSON.parse(sessionStorage.getItem("cb-history")) || []; } catch (e) {}
  const save = () => { try { sessionStorage.setItem("cb-history", JSON.stringify(history)); } catch (e) {} };

  const widget = document.createElement("div");
  widget.innerHTML = `
    <button class="cb-toggle" id="cbToggle" aria-label="Open chat">💬</button>
    <div class="cb-window" id="cbWindow" role="dialog" aria-label="Ask My Portfolio">
      <div class="cb-header">Ask My Portfolio <button class="cb-close" id="cbClose" aria-label="Close chat">&times;</button></div>
      <div class="cb-messages" id="cbMessages"></div>
      <div class="cb-chips" id="cbChips"></div>
      <div class="cb-input">
        <input type="text" id="cbInput" placeholder="Type a message..." maxlength="500" autocomplete="off">
        <button id="cbSend">Send</button>
      </div>
    </div>`;
  document.body.appendChild(widget);

  const $ = (id) => document.getElementById(id);
  const win = $("cbWindow"), toggle = $("cbToggle"), box = $("cbMessages"),
        input = $("cbInput"), send = $("cbSend"), chips = $("cbChips");

  const typing = document.createElement("div");
  typing.className = "cb-typing";
  typing.innerHTML = "<span></span><span></span><span></span>";

  function addMsg(text, cls) {
    const d = document.createElement("div");
    d.className = "cb-msg " + cls;
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }
  function setTyping(on) {
    if (on) { box.appendChild(typing); typing.style.display = "flex"; }
    else { typing.style.display = "none"; if (typing.parentNode) typing.remove(); }
    box.scrollTop = box.scrollHeight;
  }
  function toggleChat(open) {
    const show = open !== undefined ? open : !win.classList.contains("active");
    win.classList.toggle("active", show);
    toggle.classList.toggle("active", show);
    if (show) setTimeout(() => input.focus(), 50);
  }

  async function sendMessage(text) {
    text = (text || input.value).trim();
    if (!text) return;
    chips.style.display = "none";
    input.value = "";
    addMsg(text, "cb-user");
    history.push({ role: "user", content: text });
    send.disabled = true; setTyping(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(API_URL, {
        method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); } catch (e) {}
      if (!res.ok || !data || !data.reply) throw new Error((data && data.error) || "Empty response from server");
      history.push({ role: "assistant", content: data.reply });
      save();
      setTyping(false);
      addMsg(data.reply, "cb-bot");
    } catch (err) {
      history.pop();
      setTyping(false);
      addMsg(err.name === "AbortError" ? "Sorry, that took too long. Please try again." :
             "Something went wrong. Please try again, or email sadoonali782@gmail.com.", "cb-bot cb-error");
    } finally {
      clearTimeout(timer);
      send.disabled = false; input.focus();
    }
  }

  if (history.length) {
    history.forEach((m) => addMsg(m.content, m.role === "user" ? "cb-user" : "cb-bot"));
    chips.style.display = "none";
  } else {
    addMsg(GREETING, "cb-bot");
    CHIPS.forEach((c) => {
      const b = document.createElement("button");
      b.className = "cb-chip"; b.textContent = c;
      b.onclick = () => sendMessage(c);
      chips.appendChild(b);
    });
  }

  toggle.onclick = () => toggleChat();
  $("cbClose").onclick = () => toggleChat(false);
  send.onclick = () => sendMessage();
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });
})();
// Popup message above the chat button
(function () {
  const toggle = document.getElementById('cbToggle');
  const win = document.getElementById('cbWindow');
  if (!toggle || !win) return;

  const MESSAGE = "Hi! 👋 Ask me about Sadoon's projects and skills.";
  const SHOW_AFTER = 3000;    // 3 seconds after the page loads
  const HIDE_AFTER = 10000;   // disappears after 10 seconds

  // show only once per visit (per browser tab session)
  try { if (sessionStorage.getItem('cb-popup-seen')) return; } catch (e) {}

  const style = document.createElement('style');
  style.textContent = `
    .cb-popup{position:fixed;right:20px;bottom:88px;max-width:240px;display:flex;align-items:flex-start;gap:8px;
      background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:16px;
      padding:12px 14px;font-family:'Space Grotesk',sans-serif;font-size:.88rem;line-height:1.4;
      box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:998;cursor:pointer;
      opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .3s ease,transform .3s ease}
    .cb-popup.show{opacity:1;transform:none;pointer-events:auto}
    .cb-popup::after{content:"";position:absolute;bottom:-7px;right:24px;width:12px;height:12px;
      background:var(--bg);border-right:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg)}
    .cb-popup-close{background:none;border:none;color:var(--muted);font-size:18px;line-height:1;cursor:pointer;padding:0}
    .cb-popup-close:hover{color:var(--ink)}
    @media (max-width:500px){.cb-popup{right:12px;bottom:80px;max-width:200px}}
  `;
  document.head.appendChild(style);

  const pop = document.createElement('div');
  pop.className = 'cb-popup';
  const text = document.createElement('span');
  text.textContent = MESSAGE;
  const close = document.createElement('button');
  close.className = 'cb-popup-close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Dismiss message');
  pop.append(text, close);
  document.body.appendChild(pop);

  let hideTimer;
  function hide() {
    pop.classList.remove('show');
    clearTimeout(hideTimer);
  }

  setTimeout(() => {
    if (win.classList.contains('active')) return;   // chat already open
    pop.classList.add('show');
    try { sessionStorage.setItem('cb-popup-seen', '1'); } catch (e) {}
    hideTimer = setTimeout(hide, HIDE_AFTER);
  }, SHOW_AFTER);

  close.addEventListener('click', (e) => { e.stopPropagation(); hide(); });
  pop.addEventListener('click', () => { hide(); toggle.click(); });
  toggle.addEventListener('click', hide);
})();
// Animations: page fade-in, hover effects, floating photo, scroll reveal
(function () {
  // respect visitors who turn off motion in their system settings
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    body{animation:pageIn .6s ease}
    @keyframes pageIn{from{opacity:0}to{opacity:1}}

    .reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
    .reveal.visible{opacity:1;transform:none}

    .btn{transition:transform .2s ease,background .2s,color .2s,border-color .2s}
    .btn:hover{transform:translateY(-3px)}
    .btn:active{transform:scale(.97)}

    .project-card{transition:transform .25s ease,box-shadow .25s ease,opacity .7s ease}
    .project-card.visible:hover{transform:translateY(-6px);box-shadow:0 12px 28px rgba(0,0,0,.12)}

    .hero-img{animation:float 4s ease-in-out infinite}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  `;
  document.head.appendChild(style);

  // mark the elements that should fade up when scrolled into view
  const targets = document.querySelectorAll('.project-card, .page-title, .eyebrow, .hero-text');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 0.1 + 's';   // small stagger
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);   // animate only once
      }
    });
  }, { threshold: 0.15 });

  targets.forEach((el) => observer.observe(el));
})();