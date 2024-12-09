let maze = [];
let player;
let keysCollected = 0;
let score = 0;
let timeLeft = 60;
let timerInterval;
let totalKeys = 5;
let gameOverReason = '';

function playAudio(audioId) {
    const audioElement = document.getElementById(audioId);
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play();
    }
}

function showNextScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'start-screen') playAudio('start-audio');
    if (screenId === 'instructions-screen') playAudio('instructions-audio');
    if (screenId === 'name-screen') playAudio('name-audio');
    if (screenId === 'difficulty-screen') playAudio('difficulty-audio');
    if (screenId === 'game-screen') playAudio('gameplay-audio');
}

function startGame(difficulty) {
    totalKeys = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
    keysCollected = 0;
    score = 0;
    timeLeft = 60;
    gameOverReason = ''; 
    showNextScreen('game-screen');
    createMaze();
    startTimer();
}

function createMaze() {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.innerHTML = '';
    maze = [];

    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        mazeContainer.appendChild(cell);
        maze.push(cell);
    }

    player = maze[0];
    player.classList.add('player');

    placeItems('item', totalKeys);
    placeItems('exit', 1);
    placeItems('obstacle', 10);
}

function placeItems(type, count) {
    let placed = 0;
    while (placed < count) {
        let randomIndex = Math.floor(Math.random() * maze.length);
        if (!maze[randomIndex].classList.contains('wall') && !maze[randomIndex].classList.contains('player') &&
            !maze[randomIndex].classList.contains(type)) {
            maze[randomIndex].classList.add(type);
            placed++;
        }
    }
}

function movePlayer(direction) {
    let currentIndex = maze.indexOf(player);
    let nextIndex = currentIndex;

    switch (direction) {
        case 'up':
            if (currentIndex - 10 >= 0) nextIndex = currentIndex - 10;
            break;
        case 'down':
            if (currentIndex + 10 < maze.length) nextIndex = currentIndex + 10;
            break;
        case 'left':
            if (currentIndex % 10 !== 0) nextIndex = currentIndex - 1;
            break;
        case 'right':
            if (currentIndex % 10 !== 9) nextIndex = currentIndex + 1;
            break;
    }

    if (!maze[nextIndex].classList.contains('wall')) {
        player.classList.remove('player');
        maze[nextIndex].classList.add('player');
        player = maze[nextIndex];

        if (maze[nextIndex].classList.contains('item')) {
            maze[nextIndex].classList.remove('item');
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
            keysCollected++;
            playAudio('key-collected-audio');
            if (keysCollected === totalKeys) {
                document.getElementById('timer').textContent = `All Keys Collected!`;
                playAudio('all-keys-collected-audio');
            }
        }

        if (maze[nextIndex].classList.contains('exit')) {
            gameOverReason = 'exit'; 
            playAudio('exit-reached-audio');
            endGame();
        }

        if (maze[nextIndex].classList.contains('obstacle')) {
            gameOverReason = 'obstacle'; 
            playAudio('obstacle-alert-audio');
            endGame();
        }

        checkProximityToObstacles();
    }
}

function checkProximityToObstacles() {
    const currentIndex = maze.indexOf(player);
    const adjacentIndices = [
        currentIndex - 10, 
        currentIndex + 10, 
        currentIndex - 1,  
        currentIndex + 1 
    ];

    for (let index of adjacentIndices) {
        if (index >= 0 && index < maze.length && maze[index].classList.contains('obstacle')) {
            playAudio('proximity-warning-audio');
            break;
        }
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time Left: ${timeLeft}`;
        if (timeLeft <= 0) {
            gameOverReason = 'time'; // Time's up
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    showNextScreen('end-screen');

    const endMessage = document.getElementById('end-message');
    if (gameOverReason === 'time') {
        endMessage.textContent = `Game Over! Time's  up! Your score: ${score}`;
    } else if (gameOverReason === 'exit') {
        endMessage.textContent = `Congratulations! You reached the exit! Your score: ${score}`;
    } else if (gameOverReason === 'obstacle') {
        endMessage.textContent = `Game Over! You hit an obstacle! Your score: ${score}`;
    }
    playAudio('game-over-audio');
}

function restartGame() {
    score = 0;
    timeLeft = 60;
    keysCollected = 0;
    showNextScreen('start-screen');
}


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        movePlayer('up');
    } else if (e.key === 'ArrowDown') {
        movePlayer('down');
    } else if (e.key === 'ArrowLeft') {
        movePlayer('left');
    } else if (e.key === 'ArrowRight') {
        movePlayer('right');
    }
});

