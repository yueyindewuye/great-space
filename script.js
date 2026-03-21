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
