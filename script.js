const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealElements.forEach((element) => observer.observe(element));

const frenchForm = document.querySelector("#french-form");
const clearLogButton = document.querySelector("#clear-log");
const historyList = document.querySelector("#history-list");
const trackerMessage = document.querySelector("#tracker-message");
const studyDaysDisplay = document.querySelector("#study-days");
const totalMinutesDisplay = document.querySelector("#study-total-minutes");
const streakDisplay = document.querySelector("#study-streak");
const studyDateInput = document.querySelector("#study-date");

const frenchStorageKey = "life-site-french-log";

function getTodayString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function loadFrenchLogs() {
  try {
    return JSON.parse(window.localStorage.getItem(frenchStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveFrenchLogs(logs) {
  window.localStorage.setItem(frenchStorageKey, JSON.stringify(logs));
}

function computeStreak(logs) {
  if (logs.length === 0) {
    return 0;
  }

  const timestamps = logs
    .map((log) => new Date(`${log.date}T00:00:00`).getTime())
    .sort((a, b) => b - a);

  let streak = 1;

  for (let index = 0; index < timestamps.length - 1; index += 1) {
    const current = timestamps[index];
    const next = timestamps[index + 1];
    const difference = current - next;

    if (difference === 24 * 60 * 60 * 1000) {
      streak += 1;
    } else if (difference === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

function renderFrenchLogs() {
  const logs = loadFrenchLogs().sort((a, b) => b.date.localeCompare(a.date));
  const totalMinutes = logs.reduce((sum, log) => sum + Number(log.minutes || 0), 0);

  studyDaysDisplay.textContent = logs.length;
  totalMinutesDisplay.textContent = totalMinutes;
  streakDisplay.textContent = computeStreak(logs);

  historyList.innerHTML = "";

  if (logs.length === 0) {
    trackerMessage.textContent = "先保存一条记录，这里会自动生成你的学习历史。";
    const emptyState = document.createElement("p");
    emptyState.className = "empty-history";
    emptyState.textContent = "还没有学习记录，今天就来写第一条。";
    historyList.appendChild(emptyState);
    return;
  }

  trackerMessage.textContent = "这些记录会保存在当前浏览器里，方便你每天回来继续更新。";

  logs.slice(0, 7).forEach((log) => {
    const item = document.createElement("article");
    item.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.innerHTML = `<span>${log.date}</span><span>${log.minutes} 分钟</span><span>${log.words || 0} 个新词</span>`;

    const title = document.createElement("h4");
    title.textContent = log.topic;

    const note = document.createElement("p");
    note.textContent = log.note || "今天完成了一次稳定学习。";

    item.append(meta, title, note);
    historyList.appendChild(item);
  });
}

studyDateInput.value = getTodayString();

frenchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(frenchForm);
  const newLog = {
    date: String(formData.get("study-date")),
    minutes: Number(formData.get("study-minutes")),
    topic: String(formData.get("study-topic")).trim(),
    words: Number(formData.get("study-words") || 0),
    note: String(formData.get("study-note")).trim(),
  };

  const logs = loadFrenchLogs().filter((log) => log.date !== newLog.date);
  logs.push(newLog);
  saveFrenchLogs(logs);
  renderFrenchLogs();
  frenchForm.reset();
  studyDateInput.value = getTodayString();
});

clearLogButton.addEventListener("click", () => {
  window.localStorage.removeItem(frenchStorageKey);
  renderFrenchLogs();
  frenchForm.reset();
  studyDateInput.value = getTodayString();
});

renderFrenchLogs();

const starNodes = Array.from(document.querySelectorAll(".star-node"));
const startButton = document.querySelector("#start-game");
const roundDisplay = document.querySelector("#round");
const progressDisplay = document.querySelector("#progress");
const bestScoreDisplay = document.querySelector("#best-score");
const gameMessage = document.querySelector("#game-message");

const bestScoreKey = "life-site-memory-best-round";

let sequence = [];
let playerSequence = [];
let currentRound = 0;
let acceptingInput = false;
let playbackTimeoutId = null;
let savedBest = Number(window.localStorage.getItem(bestScoreKey) || 0);

bestScoreDisplay.textContent = savedBest;

function setMessage(message) {
  gameMessage.textContent = message;
}

function updateStats() {
  roundDisplay.textContent = currentRound;
  progressDisplay.textContent = `${playerSequence.length} / ${sequence.length}`;
}

function randomIndex() {
  return Math.floor(Math.random() * starNodes.length);
}

function clearLightState() {
  starNodes.forEach((node) => node.classList.remove("is-lit"));
}

function lightNode(index) {
  const node = starNodes[index];
  node.classList.add("is-lit");
  window.setTimeout(() => {
    node.classList.remove("is-lit");
  }, 420);
}

function playbackSequence() {
  acceptingInput = false;
  clearLightState();
  setMessage("认真看顺序，等闪烁结束后再点击。");

  sequence.forEach((index, order) => {
    window.setTimeout(() => {
      lightNode(index);
    }, order * 700);
  });

  playbackTimeoutId = window.setTimeout(() => {
    acceptingInput = true;
    setMessage("轮到你了，按刚才的顺序点击星点。");
  }, sequence.length * 700 + 120);
}

function updateBestScore() {
  if (currentRound > savedBest) {
    savedBest = currentRound;
    window.localStorage.setItem(bestScoreKey, String(savedBest));
    bestScoreDisplay.textContent = savedBest;
  }
}

function finishGame(success) {
  acceptingInput = false;
  startButton.disabled = false;
  updateBestScore();

  if (success) {
    setMessage(`你完成了第 ${currentRound} 轮，已经很厉害了。想继续可以再来一局。`);
    return;
  }

  setMessage(`顺序错了，游戏结束。你到达了第 ${currentRound} 轮，点击“开始挑战”重新开始。`);
}

function nextRound() {
  playerSequence = [];
  currentRound += 1;
  sequence.push(randomIndex());
  updateStats();
  playbackSequence();
}

function startGame() {
  window.clearTimeout(playbackTimeoutId);
  sequence = [];
  playerSequence = [];
  currentRound = 0;
  acceptingInput = false;
  startButton.disabled = true;
  setMessage("星空正在生成新的顺序...");
  updateStats();

  window.setTimeout(() => {
    nextRound();
  }, 450);
}

function handleStarClick(index) {
  if (!acceptingInput) {
    return;
  }

  playerSequence.push(index);
  lightNode(index);
  updateStats();

  const currentStep = playerSequence.length - 1;

  if (playerSequence[currentStep] !== sequence[currentStep]) {
    finishGame(false);
    return;
  }

  if (playerSequence.length === sequence.length) {
    acceptingInput = false;
    updateBestScore();

    if (currentRound >= 8) {
      finishGame(true);
      return;
    }

    setMessage("记对了，下一轮会更长。");
    window.setTimeout(() => {
      nextRound();
    }, 850);
  }
}

starNodes.forEach((node, index) => {
  node.addEventListener("click", () => handleStarClick(index));
});

startButton.addEventListener("click", startGame);

updateStats();
