let moves = 0;
    let timer = 0;
    let timerInterval;
    let selectedPiece = null;
    let offset = { x: 0, y: 0 };
    let pieces = [];
    let currentLevel = 'computer';

    // SVGs for puzzles
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
        ${Array.from({ length: 30 }, (_, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          return `<rect x="${70 + col * 48}" y="${220 + row * 48}" width="40" height="40" rx="5" fill="#666" />`;
        }).join('')}
      </svg>
    `;

    const mouseSVG = `
      <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="300" cy="300" rx="150" ry="250" fill="#666" />
        <rect x="250" y="150" width="100" height="50" fill="#333" />
        <circle cx="300" cy="400" r="20" fill="#444" />
      </svg>
    `;

    const cpuSVG = `
      <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <rect x="150" y="200" width="300" height="200" fill="#4CAF50" />
        <rect x="200" y="250" width="200" height="100" fill="#333" />
        <rect x="180" y="180" width="240" height="20" fill="#777" />
        <rect x="180" y="400" width="240" height="20" fill="#777" />
      </svg>
    `;

    const pendriveSVG = `
      <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <rect x="250" y="150" width="100" height="300" fill="#666" />
        <rect x="270" y="100" width="60" height="50" fill="#444" />
        <rect x="280" y="110" width="40" height="30" fill="#999" />
      </svg>
    `;

    const speakerSVG = `
      <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <rect x="150" y="100" width="300" height="400" fill="#333" />
        <circle cx="300" cy="250" r="70" fill="#666" />
        <circle cx="300" cy="250" r="40" fill="#999" />
        <circle cx="300" cy="250" r="20" fill="#CCC" />
      </svg>
    `;

    const images = {
      computer: `data:image/svg+xml,${encodeURIComponent(computerSVG)}`,
      keyboard: `data:image/svg+xml,${encodeURIComponent(keyboardSVG)}`,
      mouse: `data:image/svg+xml,${encodeURIComponent(mouseSVG)}`,
      cpu: `data:image/svg+xml,${encodeURIComponent(cpuSVG)}`,
      pendrive: `data:image/svg+xml,${encodeURIComponent(pendriveSVG)}`,
      speaker: `data:image/svg+xml,${encodeURIComponent(speakerSVG)}`
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
      ],
      mouse: [
        "Precision at its finest! 🖱️",
        "You've conquered the mouse maze! 🌀",
        "Click-perfect! 🧠"
      ],
      cpu: [
        "CPU genius! 💡",
        "You've processed the puzzle! 🎉",
        "Central to your success! 🚀"
      ],
      pendrive: [
        "Data-driven mastery! 💾",
        "Pendrive perfection! 🔑",
        "Portable puzzle pro! 🌟"
      ],
      speaker: [
        "You've amplified your puzzle skills! 🔊",
        "Volume up for victory! 🎶",
        "You're loud and clear! 🚀"
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
      if (!selectedPiece) return;

      const containerRect = document.getElementById('game-container').getBoundingClientRect();
      const pieceWidth = selectedPiece.offsetWidth;
      const pieceHeight = selectedPiece.offsetHeight;

      // Ensure the piece stays within the bounds of the container
      const x = Math.min(
        containerRect.width - pieceWidth,
        Math.max(0, e.clientX - containerRect.left - offset.x)
      );
      const y = Math.min(
        containerRect.height - pieceHeight,
        Math.max(0, e.clientY - containerRect.top - offset.y)
      );

      selectedPiece.style.left = `${x}px`;
      selectedPiece.style.top = `${y}px`;
    }

    function stopDragging() {
      if (!selectedPiece) return;

      // Snap the piece to the nearest grid position
      const pieceIndex = pieces.findIndex(p => p.element === selectedPiece);
      if (pieceIndex !== -1) {
        const gridSize = 150; // Size of each puzzle piece
        const container = document.getElementById('game-container');
        const containerRect = container.getBoundingClientRect();

        const x = Math.round((selectedPiece.offsetLeft + offset.x) / gridSize) * gridSize;
        const y = Math.round((selectedPiece.offsetTop + offset.y) / gridSize) * gridSize;

        // Keep the snapped position within bounds
        const snappedX = Math.min(
          containerRect.width - gridSize,
          Math.max(0, x)
        );
        const snappedY = Math.min(
          containerRect.height - gridSize,
          Math.max(0, y)
        );

        // Update the current position of the piece
        pieces[pieceIndex].currentPos = { x: snappedX, y: snappedY };
        selectedPiece.style.left = `${snappedX}px`;
        selectedPiece.style.top = `${snappedY}px`;

        // Check if the piece is in its correct position
        if (
          snappedX === pieces[pieceIndex].correctPos.x &&
          snappedY === pieces[pieceIndex].correctPos.y
        ) {
          selectedPiece.classList.add('correct');
        } else {
          selectedPiece.classList.remove('correct');
        }

        moves++;
        updateStats();
        checkVictory();
      }

      // Cleanup
      selectedPiece.style.zIndex = 'auto';
      selectedPiece = null;
      document.removeEventListener('mousemove', dragPiece);
      document.removeEventListener('mouseup', stopDragging);
    }

    function checkVictory() {
      const allCorrect = pieces.every(p =>
        p.currentPos.x === p.correctPos.x && p.currentPos.y === p.correctPos.y
      );

      if (allCorrect) {
        clearInterval(timerInterval);
        displayVictoryScreen();
      }
    }

    function displayVictoryScreen() {
      const victoryScreen = document.getElementById('victory-screen');
      const completionMessage = getRandomMessage(currentLevel);

      document.getElementById('final-time').textContent = document.getElementById('timer').textContent;
      document.getElementById('final-moves').textContent = moves;
      document.getElementById('completion-message').textContent = completionMessage;
      victoryScreen.style.display = 'flex';
    }

    function startGame() {
      currentLevel = document.getElementById('level-select').value;
      moves = 0;
      updateStats();
      startTimer();
      createPieces();

      // Hide victory screen if visible
      document.getElementById('victory-screen').style.display = 'none';
    }

    function shufflePieces() {
      const container = document.getElementById('game-container');
      pieces.forEach(piece => {
        const randomX = Math.floor(Math.random() * container.offsetWidth / 150) * 150;
        const randomY = Math.floor(Math.random() * container.offsetHeight / 150) * 150;

        piece.currentPos = { x: randomX, y: randomY };
        piece.element.style.left = `${randomX}px`;
        piece.element.style.top = `${randomY}px`;
        piece.element.classList.remove('correct');
      });

      moves = 0;
      updateStats();
    }

    function showHint() {
      pieces.forEach(piece => {
        if (
          piece.currentPos.x !== piece.correctPos.x ||
          piece.currentPos.y !== piece.correctPos.y
        ) {
          gsap.to(piece.element, { 
            duration: 0.5, 
            left: `${piece.correctPos.x}px`, 
            top: `${piece.correctPos.y}px`,
            onComplete: () => {
              piece.currentPos = { ...piece.correctPos };
              piece.element.classList.add('correct');
              checkVictory();
            }
          });
        }
      });
    }

    // Initialize the game on page load
    window.onload = startGame;