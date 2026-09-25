const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const bestScoreElement =  document.getElementById("best-score");
const messageElement = document.getElementById("message");
const newGameButton = document.getElementById("new-game");

let board = [];
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore2024")) || 0;
let gameOver = false;
let won = false;

bestScoreElement.textContent = bestScore;

function startGame() {
    board = Array(16).fill(0);
    score = 0;
    gameOver = false;
    won = false;
    messageElement.textContent = "Use the arrow keys to move.";
    addRandomTile();
    addRandomTile();
    updateScreen();
}
function addRandomTile() {
    const empty = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === 0) {
            empty.push(i);
		}
	}

    if (empty.length === 0) return;

    const randomIndex = empty[Math.floor(Math.random() * empty.length) ];
    board[randomIndex] = Math.random() < 0.9 ? 2 : 4;
}
function updateScreen() {
    boardElement.innerHTML = "";

    for (let i = 0; i < board.length; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if (board[i] !== 0) {
            cell.textContent = board[i];
            cell.classList.add("filled");

            if (board[i] >= 64 ) {
                cell.classList.add("big");
			}
		}

        boardElement.appendChild(cell);
	}

    scoreElement.textContent = score;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore2024", bestScore);
        bestScoreElement.textContent = bestScore;
	}
}
function slideLine(line) {
    const filtered = line.filter(value => value !== 0);
    const result = [];
    let gained = 0;

    for (let i = 0; i < filtered.length; i++) {
        if(filtered[i] === filtered[i + 1]) {
            const merged = filtered[i] * 2;
            result.push(merged);
            gained += merged;
            i++
		} else {
            result.push(filtered[i]);
		}
	}

    while (result.length < 4) {
        result.push(0);        
	}

    return { line: result, gained };
}
function getRow(row) {
    return [
        board[row * 4],
        board[row * 4 + 1],
        board[row * 4 + 2],
        board[row * 4 + 3]
	];
}
function setRow(row, values) {
    for (let col = 0; col < 4; col++) {
        board[row * 4 + col] = values[col];
	}
}
function getColumn(col) {
    return [
        board[col],
        board[col + 4],
        board[col + 8],
        board[col + 12]        
	];
}
function setColumn(col, values) {
    for (let row = 0; row < 4; row++) {
        board[row * 4 + col] = values[row];
	}
}
function moveLeft() {
     let changed = false;

      for (let row = 0; row < 4; row++) {
         const oldLine = getRow(row);
         const result = slideLine(oldLine);
         setRow(row, result.line);

         if (oldLine.join(",") !== result.line.join(",")) {
            changed = true;
		 }
        score += result.gained;
	  }

     return changed;
}
function moveRight() {
    let changed = false;

    for (let row = 0; row < 4; row++) {
        const oldLine = getRow(row);
        const reversed = [...oldLine].reverse();
        const result = slideLine(reversed);
        const newLine = result.line.reverse();

        setRow(row, newLine);

        if (oldLine.join(",") !== newLine.join(",")) {
            changed = true;
		}

        score += result.gained;
	}

    return changed;
}
function moveUp() {
    let changed = false;

    for (let col = 0; col < 4; col++) {
        const oldLine = getColumn(col);
        const result = slideLine(oldLine);        
        setColumn(col, result.line);

        if (oldLine.join(",") !== result.line.join(",")) {
            changed = true;
		}

        score += result.gained;
	}
    
    return changed;
}
function moveDown() {
    let changed = false;

    for (let col = 0; col < 4; col++) {
        const oldLine = getColumn(col);
        const reversed = [...oldLine].reverse();
        const result = slideLine(reversed);
        const newLine = result.line.reverse();

        setColumn(col, newLine);

        if (oldLine.join(",") !== newLine.join(",")) {
            changed = true;
		}

        score += result.gained;
	}

    return changed;
}
function has2048() {
    return board.includes(2024);
}
function canMove() {
    if (board.includes(0)) return true;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const index = row * 4 + col;

            if (col < 3 && board[index] === board[index + 1]) {
                return true;
			}

            if (row < 3 && board[index] === board[index + 4]) {
                return true;
			}
		}
	}

    return false;
}
function handleMove(direction) {
    if (gameOver) return;

    let changed = false;

    if (direction === "left") changed = moveLeft();
    if (direction === "right") changed = moveRight();
    if (direction === "up") changed = moveUp();
    if (direction === "down") changed = moveDown();

    if (!changed) return;

    addRandomTile();

    if (has2048() && !won) {
        won = true;
        messageElement.textContent = "You reached 2024! Keep playing or start a new game.";
	} else if (!canMove()) {
        gameOver = true;
        messageElement.textContent = "No more moves. Start a new game.";
	}

updateScreen();
}
document.addEventListener("keydown", event => {
    const keys = {          
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
	};

    if (keys[event.key]) {
        event.preventDefault();
        handleMove(keys[event.key]);
	}
});

let touchStartX = 0;
let touchStartY = 0;

boardElement.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
}, { passive: true });

boardElement.addEventListener("touchend", event => {
 const touch = event.changedTouches[0];
 const dx = touch.screenX - touchStartX;
 const dy = touch.screenY - touchStartY;

 if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;

 if (Math.abs(dx) > Math.abs(dy)) {
    handleMove(dx > 0 ? "right" : "left");
 } else {
    handleMove(dy > 0 ? "down" : "up");
 }
}, { passive: true });

newGameButton.addEventListener("click", startGame);

startGame();