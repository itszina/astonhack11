const screens = [...document.querySelectorAll(".screen")];
const navBtns = [...document.querySelectorAll(".bottomNav .nav")];
const backBtn = document.getElementById("backBtn");

let stack = ["signin"];
let selectedSubject = "AI 1";

function show(id, push = true) {
  screens.forEach(s => s.classList.toggle("active", s.dataset.screen === id));

  // bottom nav visible only for main app screens like screenshots
  const showNav = ["home","notes","progress","forest","lecture","weeks","editor","profile","store"].includes(id);
  document.querySelector(".bottomNav").style.display = showNav ? "flex" : "none";

  // back button only for nested screens
  const needsBack = !["signin","home","notes","progress","forest"].includes(id);
  backBtn.hidden = !needsBack;

  if (push) stack.push(id);

  // nav highlight
  const main = ["home","notes","progress","forest"].includes(id) ? id : null;
  if (main) navBtns.forEach(b => b.classList.toggle("active", b.dataset.go === main));
}

function go(id) { show(id, true); }

document.querySelectorAll("[data-go]").forEach(el => {
  el.addEventListener("click", () => {
    const target = el.dataset.go;
    if (target === "weeks") selectedSubject = el.dataset.subject || selectedSubject;

    if (target === "weeks") {
      const hdr = document.getElementById("weeksHdr");
      if (hdr) hdr.textContent = `My Notes → ${selectedSubject}`;
    }
    go(target);
  });
});

// sign in -> home
document.getElementById("signinBtn").addEventListener("click", () => go("home"));

// add session -> lecture
document.getElementById("goLecture").addEventListener("click", () => go("lecture"));

// profile icon buttons
["openProfile","openProfile2","openProfile3","openProfile4","openProfile5"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", () => go("profile"));
});

// bottom nav
navBtns.forEach(b => b.addEventListener("click", () => go(b.dataset.go)));

// back
backBtn.addEventListener("click", () => {
  stack.pop(); // current
  const prev = stack.pop() || "home";
  show(prev, true);
});

/* ---------------- Timer (Lecture) ---------------- */
let total = 30 * 60;
let running = false;
let timerInt = null;
const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("timerStart");
const resetBtn = document.getElementById("timerReset");

function fmt(sec){
  const m = String(Math.floor(sec/60)).padStart(2,"0");
  const s = String(sec%60).padStart(2,"0");
  return `${m}:${s}`;
}
function renderTimer(){ if (timerEl) timerEl.textContent = fmt(total); }
renderTimer();

if (startBtn) {
  startBtn.addEventListener("click", () => {
    running = !running;
    startBtn.textContent = running ? "Pause" : "Start";
    if (running) {
      timerInt = setInterval(() => {
        total = Math.max(0, total - 1);
        renderTimer();
        if (total === 0) {
          running = false;
          startBtn.textContent = "Start";
          clearInterval(timerInt);
        }
      }, 1000);
    } else {
      clearInterval(timerInt);
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    clearInterval(timerInt);
    running = false;
    if (startBtn) startBtn.textContent = "Start";
    total = 30 * 60;
    renderTimer();
  });
}

// segment buttons
document.querySelectorAll(".seg").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    clearInterval(timerInt);
    running = false;
    if (startBtn) startBtn.textContent = "Start";
    total = btn.dataset.mode === "focus" ? 30*60 : btn.dataset.mode === "break" ? 10*60 : 5*60;
    renderTimer();
  });
});

/* ---------------- Progress chart ---------------- */
const canvas = document.getElementById("chart");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;

  const points = [
    {x: 0.05, y: 0.35},
    {x: 0.35, y: 0.88},
    {x: 0.55, y: 0.72},
    {x: 0.75, y: 0.58},
    {x: 0.95, y: 0.42},
  ];

  function draw(){
    ctx.clearRect(0,0,w,h);

    // grid
    ctx.globalAlpha = 0.20;
    ctx.strokeStyle = "#000";
    for (let i=1;i<=4;i++){
      const x = (w/5)*i;
      ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, h-10); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // axis
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.moveTo(20, h-20); ctx.lineTo(w-10, h-20); ctx.stroke();
    ctx.globalAlpha = 1;

    // red line
    ctx.strokeStyle = "#E0322B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((p,i) => {
      const x = 20 + p.x*(w-40);
      const y = 20 + p.y*(h-40);
      if (i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    });
    ctx.stroke();
  }
  draw();
}

/* ---------------- Invite Modal (Forest) ---------------- */
const inviteModal = document.getElementById("inviteModal");
const openInvite = document.getElementById("openInvite");
const closeInvite = document.getElementById("closeInvite");
const inviteList = document.getElementById("inviteList");
const inviteSearchInput = document.getElementById("inviteSearchInput");

const friends = [
  "Rachel Mellie",
  "Leo Carter",
  "Maya Collins",
  "Daniel Brooks",
  "Ethan Walsh",
  "Sofia Moreno",
  "Ryan Fletcher"
];

function renderFriends(filter="") {
  if (!inviteList) return;
  inviteList.innerHTML = "";
  friends
    .filter(name => name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(name => {
      const row = document.createElement("div");
      row.className = "inviteRow";
      row.innerHTML = `
        <div class="inviteNameCell">
          <div class="userIcon">👤</div>
          <div style="font-weight:800; font-size:12px;">${name}</div>
        </div>
        <div class="vSep"></div>
        <button class="sendBtn">Send</button>
      `;
      row.querySelector(".sendBtn").addEventListener("click", () => {
        row.querySelector(".sendBtn").textContent = "Sent";
        row.querySelector(".sendBtn").style.opacity = "0.7";
        row.querySelector(".sendBtn").disabled = true;
      });
      inviteList.appendChild(row);
    });
}

if (openInvite) {
  openInvite.addEventListener("click", () => {
    renderFriends("");
    inviteModal.classList.add("show");
    inviteModal.setAttribute("aria-hidden","false");
  });
}

if (closeInvite) {
  closeInvite.addEventListener("click", () => {
    inviteModal.classList.remove("show");
    inviteModal.setAttribute("aria-hidden","true");
  });
}

if (inviteModal) {
  inviteModal.addEventListener("click", (e) => {
    if (e.target === inviteModal) {
      inviteModal.classList.remove("show");
      inviteModal.setAttribute("aria-hidden","true");
    }
  });
}

if (inviteSearchInput) {
  inviteSearchInput.addEventListener("input", (e) => renderFriends(e.target.value));
}

/* ---------------- Store ---------------- */
const openStore = document.getElementById("openStore");
const storeGrid = document.getElementById("storeGrid");
const storeSearchInput = document.getElementById("storeSearchInput");

const storeItems = [
  {name:"potted-plant", price:20, icon:"🪴"},
  {name:"palm-tree", price:25, icon:"🌴"},
  {name:"Watermelon", price:15, icon:"🍉"},
  {name:"Cherry", price:10, icon:"🍒"},
];

function renderStore(filter="") {
  if (!storeGrid) return;
  storeGrid.innerHTML = "";
  storeItems
    .filter(i => i.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(item => {
      const card = document.createElement("div");
      card.className = "storeCard";
      card.innerHTML = `
        <div class="itemImg">${item.icon}</div>
        <div class="itemName">${item.name}</div>
        <div class="priceRow"><span>🪙</span><span>${item.price}</span></div>
        <button class="addBtn"><span class="lockIcon"></span> Add To Bag</button>
      `;
      storeGrid.appendChild(card);
    });
}

if (openStore) {
  openStore.addEventListener("click", () => {
    renderStore("");
    go("store");
  });
}

if (storeSearchInput) {
  storeSearchInput.addEventListener("input", (e) => renderStore(e.target.value));
}

// init store list if screen exists
renderStore("");
