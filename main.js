









const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let numbers = [];
let currentPlayer = 1;
let lastNumber = 0;
let isGameOver = false;
let gameMode = ''; // "single" or "multi"
let playerChoice = 1; // 1 for Player 1, 2 for Player 2
let playerNames = { 1: 'Player 1 (Human)', 2: 'Player 2 (Human)' };
let moveHistory = [];

function preload() {
    // Load assets if needed
}

function create() {
    numbers = [];
    if (gameMode === '') {
        createMenu(this);
    } else if (gameMode === 'single' && playerChoice === 0) {
        createPlayerChoiceMenu(this);
    } else {
        createGame(this);
    }
}

function createMenu(scene) {
    scene.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000);

    scene.add.text(window.innerWidth / 2 - 150, 100, 'Welcome to the 21 Game!', { font: '32px Arial', fill: '#00ff00' });

    // Single Player Button
    const singlePlayerButton = scene.add.text(window.innerWidth / 2 - 100, 200, 'Single Player', {
        font: '24px Arial',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 },
    }).setInteractive();

    singlePlayerButton.on('pointerover', () => singlePlayerButton.setStyle({ fill: '#00FFFF' }));
    singlePlayerButton.on('pointerout', () => singlePlayerButton.setStyle({ fill: '#00ff00' }));
    singlePlayerButton.on('pointerdown', () => startSinglePlayer(scene));

    // Multiplayer Button
    const multiplayerButton = scene.add.text(window.innerWidth / 2 - 100, 300, 'Multiplayer', {
        font: '24px Arial',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 },
    }).setInteractive();

    multiplayerButton.on('pointerover', () => multiplayerButton.setStyle({ fill: '#00FFFF' }));
    multiplayerButton.on('pointerout', () => multiplayerButton.setStyle({ fill: '#00ff00' }));
    multiplayerButton.on('pointerdown', () => startMultiplayer(scene));
}

function startSinglePlayer(scene) {
    gameMode = 'single';
    playerChoice = 0;
    playerNames[2] = 'Player 2 (Robot)';
    scene.scene.restart();
}

function startMultiplayer(scene) {
    gameMode = 'multi';
    playerNames[1] = 'Player 1 (Human)';
    playerNames[2] = 'Player 2 (Human)';
    currentPlayer = 1; // Player 1 starts first
    scene.scene.restart();
}

function createPlayerChoiceMenu(scene) {
    scene.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000);

    scene.add.text(window.innerWidth / 2 - 200, 100, 'Choose your role:', { font: '32px Arial', fill: '#00ff00' });

    const player1Button = scene.add.text(window.innerWidth / 2 - 150, 200, 'Player 1', {
        font: '24px Arial',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 }
    }).setInteractive();

    player1Button.on('pointerover', () => player1Button.setStyle({ fill: '#00FFFF' }));
    player1Button.on('pointerout', () => player1Button.setStyle({ fill: '#00ff00' }));
    player1Button.on('pointerdown', () => {
        playerChoice = 1;
        scene.scene.restart();
    });

    const player2Button = scene.add.text(window.innerWidth / 2 - 150, 300, 'Player 2', {
        font: '24px Arial',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 }
    }).setInteractive();

    player2Button.on('pointerover', () => player2Button.setStyle({ fill: '#00FFFF' }));
    player2Button.on('pointerout', () => player2Button.setStyle({ fill: '#00ff00' }));
    player2Button.on('pointerdown', () => {
        playerChoice = 2;
        scene.scene.restart();
    });

    const randomButton = scene.add.text(window.innerWidth / 2 - 150, 400, 'Random', {
        font: '24px Arial',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 }
    }).setInteractive();

    randomButton.on('pointerover', () => randomButton.setStyle({ fill: '#00FFFF' }));
    randomButton.on('pointerout', () => randomButton.setStyle({ fill: '#00ff00' }));
    randomButton.on('pointerdown', () => {
        playerChoice = Phaser.Math.Between(1, 2);
        scene.scene.restart();
    });
}

function createGame(scene) {
    scene.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth, window.innerHeight, 0x000000);

    scene.add.text(20, 20, 'Math Game: 21', { font: '32px Arial', fill: '#00ff00' });
    scene.add.text(20, 60, 'Rules: Take 1, 2, or 3 steps. Don’t say 21!', { font: '20px Arial', fill: '#00ff00' });

    for (let i = 1; i <= 21; i++) {
        let x = 100 + ((i - 1) % 7) * 80;
        let y = 120 + Math.floor((i - 1) / 7) * 50;

        let numberButton = scene.add.text(x, y, i, {
            font: '24px Arial',
            fill: '#00ff00',
            backgroundColor: '#000',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        numberButton.number = i;
        numberButton.on('pointerdown', () => handleNumberClick(numberButton, scene));
        numbers.push(numberButton);
    }

    scene.currentPlayerText = scene.add.text(20, window.innerHeight - 100, `Current Player: ${playerNames[currentPlayer]}`, { font: '24px Arial', fill: '#00ff00' });

    scene.resultText = scene.add.text(20, window.innerHeight - 60, '', { font: '28px Arial', fill: '#ff0000' });

    scene.moveHistoryText = scene.add.text(20, window.innerHeight - 140, 'Move History: ', { font: '20px Arial', fill: '#00ff00' });

    if (gameMode === 'single' && playerChoice === 2 && lastNumber === 0) {
        currentPlayer = 2; // Make it the robot's turn first
        makeRobotMove(scene);  // Robot makes its first move immediately
    }
}

function handleNumberClick(button, scene) {
    if (isGameOver) return;

    let clickedNumber = button.number;

    if (clickedNumber <= lastNumber || clickedNumber > lastNumber + 3) {
        scene.resultText.setText('Invalid move! Choose 1, 2, or 3 steps ahead.');
        return;
    }

    button.setStyle({ fill: currentPlayer === 1 ? '#0000ff' : '#ff0000', backgroundColor: '#444' });

    moveHistory.push(`${playerNames[currentPlayer]}: ${clickedNumber}`);
    scene.moveHistoryText.setText('Move History: ' + moveHistory.join(', '));

    lastNumber = clickedNumber;

    if (clickedNumber === 21) {
        scene.resultText.setText(`${playerNames[currentPlayer]} loses!`);
        isGameOver = true;
        return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    scene.currentPlayerText.setText(`Current Player: ${playerNames[currentPlayer]}`);

    if (currentPlayer === 2 && gameMode === 'single') {
        makeRobotMove(scene); // Robot makes its move after Player 1 in single-player mode
    }
}

function makeRobotMove(scene) {
    setTimeout(() => {
        let availableMoves = [];
        for (let i = 1; i <= 3; i++) {
            if (lastNumber + i <= 21) availableMoves.push(lastNumber + i);
        }

        let move = Phaser.Math.RND.pick(availableMoves);
        let button = numbers.find(b => b.number === move);
        handleNumberClick(button, scene);
    }, 1000);
}

function update() {
    // Game update logic
}