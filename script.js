const DIFFICULTY_SETTINGS = {
  easy: { gridSize: 7, bombs: 6, gap: 15 },
  medium: { gridSize: 10, bombs: 10, gap: 10 },
  hard: { gridSize: 13, bombs: 35, gap: 6 }
};

let gridSize = DIFFICULTY_SETTINGS.medium.gridSize;
let numBombs = DIFFICULTY_SETTINGS.medium.bombs;
let gridGap = DIFFICULTY_SETTINGS.medium.gap;
let totalSafeSpaces = (gridSize * gridSize) - numBombs;

let gridData = [];          // 2D array, each item is an individual cell in the grid
let revealedSafeSpaces = 0;
let isFirstClick = true;
let gameStartTime = 0;
let timerIntervalId = null;

const easyBtn = document.getElementById("start-easy");
const mediumBtn = document.getElementById("start-medium");
const hardBtn = document.getElementById("start-hard");
const backToMainBtn = document.getElementById("back-to-main");
const playAgainBtn = document.getElementById("play-again");
const restartBtn = document.getElementById("restart-game");
const revealedSpacesEl = document.getElementById("revealed-spaces");
const totalSafeSpacesEl = document.getElementById("total-safe-spaces");
const finalTimeEl = document.getElementById("final_time");
let selectedDifficulty = "medium";

totalSafeSpacesEl.textContent = totalSafeSpaces;

easyBtn.addEventListener("click", () => {
  selectedDifficulty = "easy";
  startGame();
});
mediumBtn.addEventListener("click", () => {
  selectedDifficulty = "medium";
  startGame();
});
hardBtn.addEventListener("click", () => {
  selectedDifficulty = "hard";
  startGame();
});
backToMainBtn.addEventListener("click", goToStart);
playAgainBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", goToStart);

function showScreen(screenId) {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "none";

  document.getElementById(screenId).style.display = "block";
}

function updateRevealedSpacesTracker() {
  revealedSpacesEl.textContent = revealedSafeSpaces;
}

function formatElapsedTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateFinalTimeDisplay() {
  const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
  finalTimeEl.textContent = formatElapsedTime(elapsedSeconds);
}

function startTimer() {
  clearInterval(timerIntervalId);
  gameStartTime = Date.now();
  finalTimeEl.textContent = "0:00";
  timerIntervalId = setInterval(updateFinalTimeDisplay, 1000);
}

function stopTimer() {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  updateFinalTimeDisplay();
}

// Creates the 10x10 game grid, each cell will be its own object,
// with its own data, stored in gridData
function createGrid() {
  const grid = document.querySelector('.game-grid');     // get the grid element
  grid.innerHTML = '';                       // clear the shown HTML (like a graphic or a number)
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  grid.style.gap = `${gridGap}px`;

  gridData = [];             // clear the backend data from each cell/reset the objects

  for (let row = 0; row < gridSize; row++) {
    let currentRow = [];

    for (let col = 0; col < gridSize; col++) {
      // each cell will need to show something, so we create a div for it
      const cell = document.createElement('div');        
      cell.className = 'grid-cell';

      // Store position
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Add event listener
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('contextmenu', handleCellRightClick);

      grid.appendChild(cell);

      // Create matching data object
      currentRow.push({
        row: row,
        col: col,
        isBomb: false,
        isRevealed: false,
        isFlagged: false,
        adjacentBombs: 0
      });
    }

    gridData.push(currentRow);
  }
}

function isInProtectedZone(row, col, safeRow, safeCol) {
  return Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1;
}

// randomly place bombs around the grid
function placeBombs(safeRow, safeCol) {
  let bombsPlaced = 0;

  // random positioning of bombs
  while (bombsPlaced < numBombs) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);

    // Keep the first-click area clear so the game opens with a safe region.
    if (isInProtectedZone(row, col, safeRow, safeCol)) continue;
    
      // if there is already a bomb at this spot, skip it and loop again
      // otherwise, place the bomb
      if (!gridData[row][col].isBomb) {
        gridData[row][col].isBomb = true;
        bombsPlaced++;
      }
  }
}

function calculateAdjBombs() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {

      // skip bombs
      if (gridData[row][col].isBomb) continue;

      let count = 0;

      // check neighbors here
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let newRow = row + i;
          let newCol = col + j;

          // skip out-of-bounds cells
          if (
            newRow < 0 || newRow >= gridSize ||
            newCol < 0 || newCol >= gridSize
          ) continue;

          // skip the cell itself
          if (i === 0 && j === 0) continue;

          if (gridData[newRow][newCol].isBomb) {
            count++;
          
          }
        }
      }

      gridData[row][col].adjacentBombs = count;
    }
  }
}

function getCellElement(row, col) {
  return document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
}

function revealCell(row, col) {
  const cellData = gridData[row][col];

  // Stop if the cell is already open, flagged, or a bomb.
  if (cellData.isRevealed || cellData.isFlagged || cellData.isBomb) return;

  cellData.isRevealed = true;
  revealedSafeSpaces++;

  const cellEl = getCellElement(row, col);
  if (cellEl) {
    cellEl.classList.add("revealed");
    cellEl.textContent = cellData.adjacentBombs === 0 ? "" : cellData.adjacentBombs;
  }

  // Expand out from empty cells, just like classic Minesweeper.
  if (cellData.adjacentBombs !== 0) return;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const newRow = row + i;
      const newCol = col + j;

      if (
        newRow < 0 || newRow >= gridSize ||
        newCol < 0 || newCol >= gridSize
      ) continue;

      if (i === 0 && j === 0) continue;

      revealCell(newRow, newCol);
    }
  }
}

function handleCellRightClick(event) {
  event.preventDefault();

  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);
  const cellData = gridData[row][col];

  // Flags are only for hidden tiles.
  if (cellData.isRevealed) return;

  cellData.isFlagged = !cellData.isFlagged;
  event.currentTarget.classList.toggle("flagged", cellData.isFlagged);
  event.currentTarget.textContent = cellData.isFlagged ? "🚩" : "";
}

function handleCellClick(event) {
  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);
  const cellData = gridData[row][col];

  // prevent clicking revealed or flagged cells
  if (cellData.isRevealed || cellData.isFlagged) return;

  if (isFirstClick) {
    placeBombs(row, col);
    calculateAdjBombs();
    isFirstClick = false;
  }

    if (cellData.isBomb) {
      event.currentTarget.textContent = "🧪";
    endGame(false);
    return;
  } else {
    revealCell(row, col);
    updateRevealedSpacesTracker();
  }

  // check if player has won
  if (checkWin()) {
    endGame(true);
  }
}

// upon each cell click, check if the user has won yet
function checkWin() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = gridData[row][col];
      if (!cell.isBomb && !cell.isRevealed) {
        // Found a safe cell that isn’t revealed yet → not a win
        return false;
      }
    }
  }
  return true;

}

function setDifficulty(difficulty) {
  const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
  gridSize = settings.gridSize;
  numBombs = settings.bombs;
  gridGap = settings.gap;
  totalSafeSpaces = (gridSize * gridSize) - numBombs;
  totalSafeSpacesEl.textContent = totalSafeSpaces;
}

function startGame() {
  setDifficulty(selectedDifficulty);
  revealedSafeSpaces = 0;
  isFirstClick = true;
  updateRevealedSpacesTracker();
  startTimer();
  showScreen("game-screen");
  createGrid();
}

function goToStart() {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  finalTimeEl.textContent = "0:00";
  showScreen("start-screen");
}

function endGame(win) {
  stopTimer();

  const msg = document.getElementById("end-message");
  if (win) {
    msg.textContent = "You Win! 🎉";
  } else {
    msg.textContent = "Game Over 🧪";
  }

  showScreen("end-screen");
}




