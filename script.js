const GRID_SIZE = 10;        // Total items needed to collect
let gridData = [];          // 2D array, each item is an individual cell in the grid
const NUM_BOMBS = 10;        // Number of contaminant cells to place in the grid

const startBtn = document.getElementById("start-game");
const playAgainBtn = document.getElementById("play-again");
const restartBtn = document.getElementById("restart-game");

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", goToStart);
restartBtn.addEventListener("click", goToStart);

function showScreen(screenId) {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "none";

  document.getElementById(screenId).style.display = "block";
}

// Creates the 10x10 game grid, each cell will be its own object,
// with its own data, stored in gridData
function createGrid() {
  const grid = document.querySelector('.game-grid');     // get the grid element
  grid.innerHTML = '';                       // clear the shown HTML (like a graphic or a number)

  gridData = [];             // clear the backend data from each cell/reset the objects

  for (let row = 0; row < GRID_SIZE; row++) {
    let currentRow = [];

    for (let col = 0; col < GRID_SIZE; col++) {
      // each cell will need to show something, so we create a div for it
      const cell = document.createElement('div');        
      cell.className = 'grid-cell';

      // Store position
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Add event listener
      cell.addEventListener('click', handleCellClick);

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

// randomly place bombs around the grid
function placeBombs() {
  let bombsPlaced = 0;

  // random positioning of bombs
  while (bombsPlaced < NUM_BOMBS) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    
      // if there is already a bomb at this spot, skip it and loop again
      // otherwise, place the bomb
      if (!gridData[row][col].isBomb) {
        gridData[row][col].isBomb = true;
        bombsPlaced++;
      }
  }
}

function calculateAdjBombs() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {

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
            newRow < 0 || newRow >= GRID_SIZE ||
            newCol < 0 || newCol >= GRID_SIZE
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

function handleCellClick(event) {
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;

  const cellData = gridData[row][col];

  // prevent clicking revealed cells
  if (cellData.isRevealed) return;

  cellData.isRevealed = true;

  if (cellData.isBomb) {
    event.target.textContent = "💣";
    endGame(false);
    return;
  } else {
    // this will show in HTML, whatever the # of adjacent bombs is for the clicked cell
    event.target.textContent = cellData.adjacentBombs;
  }

  // check if player has won
  if (checkWin()) {
    endGame(true);
  }
}

// upon each cell click, check if the user has won yet
function checkWin() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = gridData[row][col];
      if (!cell.isBomb && !cell.isRevealed) {
        // Found a safe cell that isn’t revealed yet → not a win
        return false;
      }
    }
  }
  return true;

}

function startGame() {
  showScreen("game-screen");
  createGrid();
  placeBombs();
  calculateAdjBombs();
}

function goToStart() {
  showScreen("start-screen");
}

function endGame(win) {
  const msg = document.getElementById("end-message");
  msg.textContent = win ? "You Win! 🎉" : "Game Over 💣";

  showScreen("end-screen");
}




