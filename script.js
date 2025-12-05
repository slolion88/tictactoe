/** 
 ** TIC-TAC-TOE PROGRAM
 ** 
 ** Tic-Tac-Toe is a game played by two contestants on a 3x3 board of squares. A winner is declared if 3 of the same 
 ** markers are placed adjacently in either a row, column, or diagonal. A tie occurs when the board has been filled and
 ** no other moves can be made.
*/

/** 
 * Person Object
 * Creates a new Player with a name, marker, and score (initially 0). Getter and Setter methods for each, 
 * except score which can only be increased, not set.
*/
function Player(playerName, playerMarker) {
    let name = playerName;
    let marker = playerMarker;
    let score = 0;

    const getName = () => name;
    const setName = function (newName) { name = newName };

    const getMarker = () => marker;

    const getScore = () => score;
    const increaseScore = function () { ++score };

    return { getName, setName, getMarker, getScore, increaseScore }
}

/** 
 * GameBoard Module
 * Controls the game board for each game. Creates the squares and 3x3 board, and provides methods to print, update, 
 * reset, and check the board for winners.
*/
const GameBoard = (() => {
    const BOARD_LENGTH = 3;

    const square = (currentRow, currentColumn) => {
        let symbol = "_";
        const row = currentRow;
        const column = currentColumn;

        return {
            isMarked: () => symbol === "X" || symbol === "O",
            getSymbol: () => symbol,
            setSymbol: function (newSymbol) { symbol = newSymbol },
            getRow: () => row,
            getColumn: () => column
        };
    };

    // Initialize the board, a 2-D array of squares set to their respective coordinates in the board.
    const board = [];
    for (let row = 0; row < BOARD_LENGTH; row++) {
        // Set the current row to be an array.
        board[row] = [];

        for (let column = 0; column < BOARD_LENGTH; column++) {
            board[row].push(square(row, column));
        }
    }

    const print = function () {
        let consoleDisplay = ``;
        for (let row = 0; row < BOARD_LENGTH; row++) {
            if (row == 0) {
                consoleDisplay += `   0   1   2\n`;
            }
            for (let column = 0; column < BOARD_LENGTH; column++) {
                let squareToPrint = board[row][column];

                if (column == 0) {
                    consoleDisplay += `${row}  ${squareToPrint.getSymbol()} |`;
                } else if (column == 1) {
                    consoleDisplay += ` ${squareToPrint.getSymbol()} |`;
                } else {
                    consoleDisplay += ` ${squareToPrint.getSymbol()}\n`;
                }
            }
        }
        console.log(consoleDisplay);
    };

    const update = (marker, input) => {
        let squareToUpdate = board[input.charAt(0)][input.charAt(1)];

        if (!squareToUpdate.isMarked()) {
            squareToUpdate.setSymbol(marker);
            return true;
        }
        return false;
    };

    const reset = function () {
        for (let row = 0; row < BOARD_LENGTH; row++) {
            for (let column = 0; column < BOARD_LENGTH; column++) {
                board[row][column].setSymbol("_");
            }
        }
    };

    const matchRow = (currentSquare) => {
        for (let column = 0; column < BOARD_LENGTH; column++) {
            if (board[currentSquare.getRow()][column].getSymbol() != currentSquare.getSymbol()) {
                return false;
            }
        }
        return true;
    };

    const matchColumn = (currentSquare) => {
        for (let row = 0; row < BOARD_LENGTH; row++) {
            if (board[row][currentSquare.getColumn()].getSymbol() != currentSquare.getSymbol()) {
                return false;
            }
        }
        return true;
    }

    const matchDiagonal = (currentSquare) => {
        const squareMarker = currentSquare.getSymbol();
        let squareRow = currentSquare.getRow();
        let squareColumn = currentSquare.getColumn();

        // Marker must match center square for a diagonal match - confirms center for remaining checks
        if (board[1][1].getSymbol() !== squareMarker) {
            return false;
        } else if (squareRow === squareColumn) {
            // Corner or center square - if corner, match spans top-left to bottom-right
            let temp = 0;
            if (squareRow !== 1) {
                // Corner square, match spans top-left to bottom-right - indices equal each other and flip 00 => 22
                temp = squareRow === 0 ? 2 : 0;
                return squareMarker === board[temp][temp].getSymbol();
            } else {
                // Center square - direction is uncertain, check both ways starting from top-left square
                return (
                    (squareMarker === board[temp][temp].getSymbol() && squareMarker === board[temp + 2][temp + 2].getSymbol())
                    || (squareMarker === board[temp][temp + 2].getSymbol() && squareMarker === board[temp + 2][temp].getSymbol())
                );
            }
        } else {
            // Square is corner, match spans bottom-left to top-right - indices flip 02 => 20   
            return squareMarker === board[squareColumn][squareRow].getSymbol();
        }
        return true;
    }

    //Returns the winning marker, "TIE" or false if there's no winner.
    const checkWinner = () => {
        let turns = 0;

        // Returns winning symbol or "TIE", or fale if no winner. Impossible to win before turn 5, or to tie before turn 8
        for (let row = 0; row < BOARD_LENGTH; row++) {
            for (let column = 0; column < BOARD_LENGTH; column++) {
                let thisSquare = board[row][column];

                if (thisSquare.isMarked() && (++turns >= 5)) {
                    if (matchRow(thisSquare) || matchColumn(thisSquare) || matchDiagonal(thisSquare)) {
                        return thisSquare.getSymbol()
                    } else if (turns >= 8) {
                        return "TIE";
                    }
                }
            }
        }
    };

    return { print, update, reset, checkWinner };
})();

/**
 * GameController Module
 * Controls the flow of the game, starting with getting the contestants, 2 players X and O, playing a round in order
 * to play a game, and announcing the winner.
 */
const GameController = (() => {
    const contestants = (() => {
        const playerX = Player(prompt("Player X, what is your name?"), "X");
        const playerO = Player(prompt("Player O, what is your name?"), "O");

        let activeContestant = playerX;
        const getActiveContestant = () => activeContestant;
        const swapActiveContestant = function () { activeContestant = activeContestant === playerX ? playerO : playerX };

        return { playerX, playerO, getActiveContestant, swapActiveContestant };
    })();

    function announceWinner(winner) {
        if (winner === "TIE") {
            console.log("It's a tie!");
        } else {
            console.log(`${winner.getName()} wins the game! Your score is now ${winner.getScore()}.`);
        }
    }

    function playRound() {
        // Get the activeContestant's move and update the board
        GameBoard.update(
            contestants.getActiveContestant().getMarker(),
            prompt(`${contestants.getActiveContestant().getName()}, it's your turn!\nWhere would you like to place your ${contestants.getActiveContestant().getMarker()}?`)
        );

        // Check the board for a winner, if there is one, update the winning player's score and announce the winner
        let winner = GameBoard.checkWinner();
        if (winner) {
            if (winner !== "TIE") {
                winner = winner === "X" ? contestants.playerX : contestants.playerO;
                winner.increaseScore();
            }
            announceWinner(winner);
        }
        return winner;
    }

    function playGame() {
        let gameOver = false;
        while (!gameOver) {
            GameBoard.print();
            gameOver = playRound();
            // Swap the active contestant, even if there's a winner, so that next player or game loser starts next
            contestants.swapActiveContestant();
        }
    }

    return { playGame }
})();
GameController.playGame();