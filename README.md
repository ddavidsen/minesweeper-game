# 💧 Watersweeper

A browser-based game inspired by *Minesweeper*, reimagined with a water contamination theme. Players must safely uncover clean water cells while avoiding hidden contaminants, using logic and deduction to win.

This project combines interactive gameplay with a social impact focus, encouraging awareness of global water issues through integration with **charity: water** and **The Global Career Accelerator**.

---

## 🎮 Gameplay Overview

Watersweeper follows classic Minesweeper mechanics:
- Each cell may contain a hidden contaminant
- Numbers indicate how many adjacent cells contain contaminants
- Use logic to reveal all safe cells without triggering a contaminated one
- Flag suspected contaminants using right-click

---

## ✨ Features

### 🧩 Core Gameplay
- Grid-based logic game with **dynamic board generation**
- **Recursive cell revealing** for empty regions
- **Right-click flagging system** for marking suspected contaminants
- **Win/Loss detection** based on game state

### ⚙️ Difficulty Levels
- Easy, Medium, Hard modes with:
  - Different grid sizes
  - Varying bomb counts
  - Adaptive spacing for responsiveness

### ⏱️ Game Tracking
- Real-time **timer**
- Tracks **revealed vs total safe cells**
- Displays final completion time on game end

### 🖥️ UI/UX Design
- Multi-screen interface:
  - Start screen (instructions + difficulty selection)
  - Game screen (interactive grid)
  - End screen (results + replay options)
- Responsive design using **CSS Grid + media queries**
- Visual feedback for:
  - Revealed cells
  - Flagged cells
  - Game states

### 🌍 Social Impact Integration
- Includes links to **charity: water** to promote awareness and donations
- Thematic design centered around clean vs contaminated water

---

## 🛠️ Tech Stack

- **HTML5** – Structure and layout  
- **CSS3** – Styling, responsive design, grid system  
- **JavaScript (Vanilla)** – Game logic and interactivity  

---

## 🧠 Key Technical Concepts

### 1. Dynamic Grid System
- Grid is generated programmatically using DOM manipulation
- Each cell is backed by a structured object:
```js
{
  row,
  col,
  isBomb,
  isRevealed,
  isFlagged,
  adjacentBombs
}