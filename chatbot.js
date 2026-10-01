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