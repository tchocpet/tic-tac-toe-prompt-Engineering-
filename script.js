let fields = [null, null, null, null, null, null, null, null, null];
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
let currentPlayer = "circle";
let gameMode = "player";
let circleScore = 0;
let crossScore = 0;

function startGame(mode) {
  gameMode = mode;
  document.getElementById("modeSelection").style.display = "none";
  document.getElementById("content").style.display = "flex";
  restartGame();
}

function init() {
  render();
}

function render() {
  const contentDiv = document.getElementById("content");

  let tableHtml = "<table>";
  for (let i = 0; i < 3; i++) {
    tableHtml += "<tr>";
    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j;
      let symbol = "";
      if (fields[index] === "circle") {
        symbol = generateCircleSVG();
      } else if (fields[index] === "cross") {
        symbol = generateCrossSVG();
      }
      tableHtml += `<td data-index="${index}" onclick="handleClick(this, ${index})">${symbol}</td>`;
    }
    tableHtml += "</tr>";
  }
  tableHtml += "</table>";

  contentDiv.innerHTML = tableHtml;
}

function handleClick(cell, index) {
  if (fields[index] === null) {
    document.getElementById("clickSound").play();
    fields[index] = currentPlayer;
    cell.innerHTML =
      currentPlayer === "circle" ? generateCircleSVG() : generateCrossSVG();
    cell.onclick = null;

    if (isGameFinished()) {
      const winCombination = getWinningCombination();
      if (winCombination) {
        drawWinningLine(winCombination);
        document.getElementById("winSound").play();
        if (currentPlayer === "circle") circleScore++;
        else crossScore++;
        updateScoreboard();
        showGameOverModal(`${currentPlayer.toUpperCase()} hat gewonnen!`);
      } else {
        document.getElementById("drawSound").play();
        showGameOverModal("Unentschieden!");
      }
    } else {
      currentPlayer = currentPlayer === "circle" ? "cross" : "circle";
      if (gameMode === "computer" && currentPlayer === "cross") {
        computerMove();
      }
    }
  }
}

function computerMove() {
  const emptyFields = fields
    .map((field, index) => (field === null ? index : null))
    .filter((index) => index !== null);

  // Versuche zu gewinnen
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (fields[a] === "cross" && fields[b] === "cross" && fields[c] === null) {
      handleClick(document.querySelector(`td[data-index='${c}']`), c);
      return;
    }
    if (fields[a] === "cross" && fields[c] === "cross" && fields[b] === null) {
      handleClick(document.querySelector(`td[data-index='${b}']`), b);
      return;
    }
    if (fields[b] === "cross" && fields[c] === "cross" && fields[a] === null) {
      handleClick(document.querySelector(`td[data-index='${a}']`), a);
      return;
    }
  }

  // Blockiere den Spieler
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (
      fields[a] === "circle" &&
      fields[b] === "circle" &&
      fields[c] === null
    ) {
      handleClick(document.querySelector(`td[data-index='${c}']`), c);
      return;
    }
    if (
      fields[a] === "circle" &&
      fields[c] === "circle" &&
      fields[b] === null
    ) {
      handleClick(document.querySelector(`td[data-index='${b}']`), b);
      return;
    }
    if (
      fields[b] === "circle" &&
      fields[c] === "circle" &&
      fields[a] === null
    ) {
      handleClick(document.querySelector(`td[data-index='${a}']`), a);
      return;
    }
  }

  // Zufälliger Zug
  const randomIndex =
    emptyFields[Math.floor(Math.random() * emptyFields.length)];
  const cell = document.querySelector(`td[data-index='${randomIndex}']`);
  handleClick(cell, randomIndex);
}

function isGameFinished() {
  return (
    fields.every((field) => field !== null) || getWinningCombination() !== null
  );
}

function getWinningCombination() {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (
      fields[a] === fields[b] &&
      fields[b] === fields[c] &&
      fields[a] !== null
    ) {
      return WINNING_COMBINATIONS[i];
    }
  }
  return null;
}

function generateCircleSVG() {
  const color = "#00B0EF";
  const width = 70;
  const height = 70;

  return `
    <svg width="${width}" height="${height}">
      <circle cx="35" cy="35" r="30" stroke="${color}" stroke-width="5" fill="none">
        <animate attributeName="r" from="0" to="30" dur="0.3s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="0 188.5" to="188.5 0" dur="0.3s" fill="freeze" />
      </circle>
    </svg>`;
}

function generateCrossSVG() {
  const color = "#FFC000";
  const width = 70;
  const height = 70;

  return `
    <svg width="${width}" height="${height}">
      <line x1="0" y1="0" x2="${width}" y2="${height}"
        stroke="${color}" stroke-width="5">
        <animate attributeName="x2" values="0; ${width}" dur="0.3s"/>
        <animate attributeName="y2" values="0; ${height}" dur="0.3s"/>
      </line>
      <line x1="${width}" y1="0" x2="0" y2="${height}"
        stroke="${color}" stroke-width="5">
        <animate attributeName="x2" values="${width}; 0" dur="0.3s"/>
        <animate attributeName="y2" values="0; ${height}" dur="0.3s"/>
      </line>
    </svg>`;
}

function drawWinningLine(combination) {
  const winner = fields[combination[0]];
  const lineColor = winner === "circle" ? "#00B0EF" : "#FFC000";
  const lineWidth = 5;

  const startCell = document.querySelector(
    `td[data-index='${combination[0]}']`
  );
  const endCell = document.querySelector(`td[data-index='${combination[2]}']`);
  const startRect = startCell.getBoundingClientRect();
  const endRect = endCell.getBoundingClientRect();

  const contentRect = document
    .getElementById("content")
    .getBoundingClientRect();

  const lineLength = Math.sqrt(
    Math.pow(endRect.left - startRect.left, 2) +
      Math.pow(endRect.top - startRect.top, 2)
  );

  const lineAngle = Math.atan2(
    endRect.top - startRect.top,
    endRect.left - startRect.left
  );

  const line = document.createElement("div");
  line.classList.add("line");
  line.style.width = `${lineLength}px`;
  line.style.transform = `rotate(${lineAngle}rad)`;
  line.style.top = `${
    startRect.top + startRect.height / 2 - contentRect.top - lineWidth / 2
  }px`;
  line.style.left = `${
    startRect.left + startRect.width / 2 - contentRect.left
  }px`;
  line.style.backgroundColor = lineColor;

  document.getElementById("content").appendChild(line);
}

function restartGame() {
  fields = [null, null, null, null, null, null, null, null, null];
  currentPlayer = "circle";

  const existingLine = document.querySelector(".line");
  if (existingLine) {
    existingLine.remove();
  }

  render();
}

function updateScoreboard() {
  document.getElementById("circleScore").textContent = circleScore;
  document.getElementById("crossScore").textContent = crossScore;
}

function showGameOverModal(message) {
  const modal = document.getElementById("gameOverModal");
  const messageElement = document.getElementById("gameOverMessage");
  messageElement.textContent = message;
  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("gameOverModal");
  modal.style.display = "none";
}

// Initialisierung
init();
