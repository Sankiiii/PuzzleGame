let moves = 0;
let timer = 0;
let timerInterval;
let selectedPiece = null;
let offset = { x: 0, y: 0 };
let pieces = [];
let currentLevel = 'computer';

// Create SVG-based images for puzzles
const computerSVG = `
  <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect x="100" y="100" width="400" height="300" fill="#333" />
    <rect x="120" y="120" width="360" height="240" fill="#4CAF50" />
    <rect x="50" y="400" width="500" height="20" fill="#555" />
    <rect x="250" y="420" width="100" height="80" fill="#777" />
  </svg>
`;

const keyboardSVG = `
  <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="200" width="500" height="200" rx="10" fill="#333" />
    ${Array.from({length: 30}, (_, i) => {
      const row = Math.floor(i / 10);
      const col = i % 10;
      return `<rect x="${70 + col * 48}" y="${220 + row * 48}" width="40" height="40" rx="5" fill="#666" />`;
    }).join('')}
  </svg>
`;

  

const images = {
  computer: `data:image/svg+xml,${encodeURIComponent(computerSVG)}`,
  keyboard: `data:image/svg+xml,${encodeURIComponent(keyboardSVG)}`
};

const completionMessages = {
  computer: [
    "You've mastered the digital realm! 🖥️",
    "Your computer expertise is showing! 💻",
    "Tech wizardry at its finest! ⚡"
  ],
  keyboard: [
    "Key perfect! Your typing skills must be amazing! ⌨️",
    "You've unlocked the power of the keyboard! 🎹",
    "QWERTY mastery achieved! 🎯"
  ]
};

function getRandomMessage(level) {
  const messages = completionMessages[level];
  return messages[Math.floor(Math.random() * messages.length)];
}

function updateStats() {
  document.getElementById('moves').textContent = moves;
  document.getElementById('level-display').textContent = currentLevel;
}

function updateTimer() {
  const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
  const seconds = (timer % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 0;
  updateTimer();
  timerInterval = setInterval(() => {
    timer++;
    updateTimer();
  }, 1000);
}

function createPieces() {
  const container = document.getElementById('game-container');
  container.innerHTML = '';
  pieces = [];

  for (let i = 0; i < 16; i++) {
    const piece = document.createElement('div');
    const row = Math.floor(i / 4);
    const col = i % 4;
    
    piece.className = 'puzzle-piece';
    piece.style.backgroundImage = `url(${images[currentLevel]})`;
    piece.style.backgroundPosition = `-${col * 150}px -${row * 150}px`;
    
    const correctPos = {
      x: col * 150,
      y: row * 150
    };
    
    pieces.push({
      element: piece,
      correctPos,
      currentPos: { ...correctPos }
    });
    
    piece.style.left = `${correctPos.x}px`;
    piece.style.top = `${correctPos.y}px`;
    
    piece.addEventListener('mousedown', startDragging);
    container.appendChild(piece);
  }
}

function startDragging(e) {
  selectedPiece = e.target;
  const rect = selectedPiece.getBoundingClientRect();
  offset.x = e.clientX - rect.left;
  offset.y = e.clientY - rect.top;
  
  selectedPiece.style.zIndex = '1000';
  document.addEventListener('mousemove', dragPiece);
  document.addEventListener('mouseup', stopDragging);
}

function dragPiece(e) {
  selectedPiece.style.left = `${e.clientX - offset.x}px`;
  selectedPiece.style.top = `${e.clientY - offset.y}px`;
}

function stopDragging() {
  document.removeEventListener('mousemove', dragPiece);
  document.removeEventListener('mouseup', stopDragging);

  const col = Math.round((parseInt(selectedPiece.style.left) / 150));
  const row = Math.round((parseInt(selectedPiece.style.top) / 150));

  const snappedX = col * 150;
  const snappedY = row * 150;

  selectedPiece.style.left = `${snappedX}px`;
  selectedPiece.style.top = `${snappedY}px`;
  
  const pieceData = pieces.find(piece => piece.element === selectedPiece);
  pieceData.currentPos = { x: snappedX, y: snappedY };

  moves++;
  updateStats();
  checkVictory();
}

function checkVictory() {
  if (pieces.every(piece => piece.currentPos.x === piece.correctPos.x && piece.currentPos.y === piece.correctPos.y)) {
    clearInterval(timerInterval);
    document.getElementById('victory-screen').style.display = 'flex';
    document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
    document.getElementById('final-moves').textContent = moves;
    document.getElementById('completion-message').textContent = getRandomMessage(currentLevel);
    document.getElementById('completed-preview').style.backgroundImage = `url(${images[currentLevel]})`;
  }
}

function startGame() {
  moves = 0;
  updateStats();
  startTimer();
  createPieces();
  document.getElementById('victory-screen').style.display = 'none';
}

function shufflePieces() {
  pieces.forEach(piece => {
    const randomX = Math.floor(Math.random() * 4) * 150;
    const randomY = Math.floor(Math.random() * 4) * 150;
    piece.element.style.left = `${randomX}px`;
    piece.element.style.top = `${randomY}px`;
    piece.currentPos = { x: randomX, y: randomY };
  });
  moves = 0;
  updateStats();
}

function showHint() {
  alert("Try aligning the pieces with the image grid! Start from top-left.");
}

document.getElementById('level-select').addEventListener('change', (e) => {
  currentLevel = e.target.value;
  startGame();
});

startGame();
