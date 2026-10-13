import { theme, ink } from "./colors";
import type { Files, Palette } from "./types";

export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function clean(t: string): string {
  t = t.trim().replace(/[.!?]+$/, "");
  t = t.replace(/^(please\s+)?(can you\s+)?(i\s+)?(want|need|would like)?\s*(to\s+)?(make|build|create|design|do)?\s*(me\s+)?(an?|the|my)?\s*/i, "").trim();
  if (!t) t = "My new page";
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t.length > 56 ? t.slice(0, 54).replace(/\s+\S*$/, "") + "…" : t;
}
export type Kind = "landing" | "todo" | "calc" | "invite";
export function kindOf(t: string): Kind {
  t = t.toLowerCase();
  if (/to-?do|task|checklist|reminder/.test(t)) return "todo";
  if (/calculat/.test(t)) return "calc";
  if (/invit|birthday|party|wedding|celebrat/.test(t)) return "invite";
  return "landing";
}

export function baseCss(p: Palette): string {
  const t=theme(p);
  return `:root {
  --bg: ${t.bg};
  --surface: ${t.surface};
  --text: ${t.text};
  --accent: ${p.accent};
  --accent-text: ${ink(p.accent)};
  --radius: 14px;
  --size: 16px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: var(--size)/1.6 system-ui, -apple-system, "Segoe UI", sans-serif;
}

h1, h2, h3 { line-height: 1.15; margin: 0 0 12px; }
a { color: var(--accent); }

.btn {
  display: inline-block;
  background: var(--accent);
  color: var(--accent-text);
  border: 0;
  border-radius: var(--radius);
  padding: 12px 22px;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px;
  border: 1px solid rgba(128, 128, 128, 0.25);
}
`;
}
interface TplOpts { title: string; brand: string; sub: string; img: boolean; p: Palette }
interface Tpl { html: string; css: string; js: string }
export const T: Record<Kind, (o: TplOpts) => Tpl> = {
landing:(o: TplOpts): Tpl=>({
html:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${o.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="nav">
    <strong>${o.brand}</strong>
    <nav><a href="#about">About</a> <a href="#contact">Contact</a></nav>
  </header>

  <main>
    <section class="hero">
      <div>
        <h1>${o.title}</h1>
        <p>${o.sub}</p>
        <a class="btn" href="#contact">Get in touch</a>
      </div>${o.img?`
      <img class="hero-img" src="reference.jpg" alt="Your reference image">`:""}
    </section>

    <section id="about">
      <h2>What this is about</h2>
      <div class="cards">
        <article class="card"><h3>First idea</h3><p>Write one sentence about it here.</p></article>
        <article class="card"><h3>Second idea</h3><p>Another sentence goes here.</p></article>
        <article class="card"><h3>Third idea</h3><p>And one more for good measure.</p></article>
        <!-- more cards go here -->
      </div>
    </section>

    <section id="contact">
      <h2>Say hello</h2>
      <p>you@example.com</p>
      <button class="btn" id="hi">Say hi</button>
      <p id="msg"></p>
    </section>
  </main>

  <script src="script.js"><\/script>
</body>
</html>
`,
css:baseCss(o.p)+`
.nav { display: flex; justify-content: space-between; align-items: center; padding: 18px 6vw; }
.nav a { margin-left: 16px; text-decoration: none; }
section { padding: 36px 6vw; }
.hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: center; padding-top: 56px; }
.hero h1 { font-size: clamp(32px, 6vw, 54px); letter-spacing: -0.02em; }
.hero p { font-size: 1.15em; opacity: 0.8; max-width: 46ch; }
.hero-img { width: 100%; max-height: 340px; object-fit: cover; border-radius: var(--radius); }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
@media (max-width: 700px) { .hero { grid-template-columns: 1fr; } }
`,
js:`// Runs when the button is clicked.
var button = document.getElementById("hi");
var message = document.getElementById("msg");

button.addEventListener("click", function () {
  message.textContent = "Thanks for saying hi!";
});
`}),
todo:(o: TplOpts): Tpl=>({
html:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${o.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="wrap">${o.img?`
    <img class="banner" src="reference.jpg" alt="Your reference image">`:""}
    <h1>${o.title}</h1>
    <p class="sub">${o.sub}</p>

    <form id="form" class="row">
      <input id="item" placeholder="Add something to do" aria-label="New task">
      <button class="btn" type="submit">Add</button>
    </form>

    <ul id="list"></ul>
    <p id="count" class="sub"></p>
  </main>
  <script src="script.js"><\/script>
</body>
</html>
`,
css:baseCss(o.p)+`
.wrap { max-width: 520px; margin: 0 auto; padding: 40px 20px; }
.banner { width: 100%; height: 150px; object-fit: cover; border-radius: var(--radius); margin-bottom: 18px; }
.sub { opacity: 0.7; }
.row { display: flex; gap: 8px; margin: 18px 0; }
input { flex: 1; padding: 12px 14px; border-radius: var(--radius); border: 1px solid rgba(128, 128, 128, 0.4); background: var(--surface); color: var(--text); font: inherit; }
ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
li { display: flex; align-items: center; gap: 10px; background: var(--surface); border-radius: var(--radius); padding: 12px 14px; border: 1px solid rgba(128, 128, 128, 0.25); }
li.done span { text-decoration: line-through; opacity: 0.5; }
li span { flex: 1; }
li button { background: none; border: 0; color: inherit; opacity: 0.6; cursor: pointer; font-size: 18px; }
`,
js:`var tasks = ["Try Tinker", "Change a colour"];
var list = document.getElementById("list");
var count = document.getElementById("count");

function draw() {
  list.innerHTML = "";
  tasks.forEach(function (t, i) {
    var li = document.createElement("li");
    li.className = t.done ? "done" : "";
    li.innerHTML = '<input type="checkbox"><span></span><button aria-label="Delete">×</button>';
    li.querySelector("span").textContent = t.text || t;
    li.querySelector("input").checked = !!t.done;
    li.querySelector("input").onchange = function () {
      tasks[i] = { text: t.text || t, done: !t.done };
      draw();
    };
    li.querySelector("button").onclick = function () { tasks.splice(i, 1); draw(); };
    list.appendChild(li);
  });
  var left = tasks.filter(function (t) { return !t.done; }).length;
  count.textContent = left + " left to do";
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  var box = document.getElementById("item");
  if (box.value.trim()) { tasks.push({ text: box.value.trim(), done: false }); box.value = ""; draw(); }
});

draw();
`}),
calc:(o: TplOpts): Tpl=>({
html:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${o.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="wrap">
    <h1>${o.title}</h1>
    <div class="calc card">
      <div id="screen" class="screen">0</div>
      <div class="keys" id="keys"></div>
    </div>
  </main>
  <script src="script.js"><\/script>
</body>
</html>
`,
css:baseCss(o.p)+`
.wrap { max-width: 340px; margin: 0 auto; padding: 40px 20px; text-align: center; }
.screen { text-align: right; font-size: 2.2em; font-weight: 700; padding: 14px 6px 18px; overflow: hidden; }
.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.keys button { padding: 16px 0; border-radius: var(--radius); border: 0; font: inherit; font-size: 1.15em; font-weight: 600; background: rgba(128, 128, 128, 0.2); color: var(--text); cursor: pointer; }
.keys button.op { background: var(--accent); color: var(--accent-text); }
`,
js:`var screen = document.getElementById("screen");
var keys = ["7","8","9","÷","4","5","6","×","1","2","3","−","0",".","=","+","C"];
var current = "0", first = null, op = null, fresh = true;

function show() { screen.textContent = current; }

function compute(a, b, o) {
  if (o === "+") return a + b;
  if (o === "−") return a - b;
  if (o === "×") return a * b;
  if (o === "÷") return b === 0 ? 0 : a / b;
  return b;
}

keys.forEach(function (k) {
  var b = document.createElement("button");
  b.textContent = k;
  if ("÷×−+=".indexOf(k) > -1) b.className = "op";
  if (k === "C") b.style.gridColumn = "span 4";
  b.onclick = function () {
    if (k === "C") { current = "0"; first = null; op = null; fresh = true; }
    else if ("÷×−+".indexOf(k) > -1) { first = parseFloat(current); op = k; fresh = true; }
    else if (k === "=") {
      if (op !== null) { current = String(Math.round(compute(first, parseFloat(current), op) * 1e8) / 1e8); op = null; fresh = true; }
    } else {
      current = (fresh || current === "0") && k !== "." ? k : current + k;
      fresh = false;
    }
    show();
  };
  document.getElementById("keys").appendChild(b);
});
show();
`}),
invite:(o: TplOpts): Tpl=>({
html:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${o.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="wrap">
    <article class="invite card">${o.img?`
      <img class="banner" src="reference.jpg" alt="Your reference image">`:`
      <div class="emoji">🎈</div>`}
      <p class="kicker">You're invited</p>
      <h1>${o.title}</h1>
      <p>${o.sub}</p>
      <ul class="details">
        <li><strong>When</strong> Saturday, 6:00 pm</li>
        <li><strong>Where</strong> Add the place here</li>
        <li><strong>Bring</strong> Your best smile</li>
      </ul>
      <button class="btn" id="rsvp">I'll be there</button>
      <p id="thanks"></p>
    </article>
  </main>
  <script src="script.js"><\/script>
</body>
</html>
`,
css:baseCss(o.p)+`
.wrap { min-height: 100vh; display: grid; place-items: center; padding: 28px 16px; }
.invite { max-width: 460px; width: 100%; text-align: center; padding: 30px 26px; }
.emoji { font-size: 56px; }
.banner { width: 100%; height: 190px; object-fit: cover; border-radius: var(--radius); margin-bottom: 14px; }
.kicker { text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.8em; color: var(--accent); font-weight: 700; margin: 6px 0; }
h1 { font-size: 2.1em; }
.details { list-style: none; padding: 0; margin: 18px 0 22px; text-align: left; display: grid; gap: 8px; }
.details li { background: var(--bg); border-radius: 10px; padding: 10px 14px; }
.details strong { display: inline-block; min-width: 64px; color: var(--accent); }
`,
js:`var button = document.getElementById("rsvp");
button.addEventListener("click", function () {
  document.getElementById("thanks").textContent = "See you there! 🎉";
  button.disabled = true;
});
`})
};

export function buildProject(prompt: string, hasImage: boolean, pal: Palette): Files {
  const kind = kindOf(prompt), title = clean(prompt);
  const o: TplOpts = { title: esc(title), brand: "My site", sub: esc(clean(prompt) + " — made with Tinker. Click this text in the code to change it."), img: hasImage, p: pal };
  if (kind === "invite") o.sub = "Join us for a fun celebration. Add the details below.";
  if (kind === "todo") o.sub = "Add a task, tick it off, delete it.";
  const f = T[kind](o);
  return {
    html: { name: "index.html", lang: "html", text: f.html },
    css: { name: "style.css", lang: "css", text: f.css },
    js: { name: "script.js", lang: "js", text: f.js },
  };
}
export function blankFiles(pal: Palette): Files {
  return {
    html: { name: "index.html", lang: "html", text: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>My page</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello!</h1>\n  <p>Start typing here.</p>\n  <script src="script.js"><\/script>\n</body>\n</html>\n' },
    css: { name: "style.css", lang: "css", text: baseCss(pal) },
    js: { name: "script.js", lang: "js", text: "// Your JavaScript goes here.\n" },
  };
}
