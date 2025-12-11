/** 
 ** TIC-TAC-TOE PROGRAM
 ** 
 ** Tic-Tac-Toe is a game played by two players on a 3x3 board of squares. A winner is declared if 3 of the same 
 ** markers are placed adjacently in either a row, column, or diagonal. A tie occurs when the board has been filled and
 ** no other moves can be made.
*/

/** 
 * Person Object
 * Creates a new Player with a name, marker, and score (initially 0). Getter and Setter methods for each, 
 * except score which can only be increased, not set.
*/
const Player = (playerName, playerMarker) => {
    let name = playerName;
    let marker = playerMarker;
    let score = 0;

    const getName = () => name;
    const setName = function (newName) { name = newName };

    const getMarker = () => marker;

    const getScore = () => score;
    const increaseScore = function () { ++score };

    return { getName, setName, getMarker, getScore, increaseScore }
};

/** 
 * GameBoard Module
 * Controls the game board for each game. Creates the squares and 3x3 board, and provides methods to print, update, 
 * reset, and check the board for winners.
*/
const GameBoard = (() => {
    const square = (currentRow, currentColumn) => {
        let marker = "";
        const row = currentRow;
        const column = currentColumn;

        return {
            isMarked: () => marker === "X" || marker === "O",
            getMarker: () => marker,
            setMarker: function (newMarker) { marker = newMarker },
            getRow: () => row,
            getColumn: () => column
        };
    };

    // Initialize the board, a 2-D array of squares set to their respective coordinates in the board.
    const board = (() => {
        const array = [];
        for (let row = 0; row < 3; row++) {
            array[row] = [];
            for (let column = 0; column < 3; column++) {
                array[row].push(square(row, column));
            }
        }
        return array;
    })();

    const getBoard = () => board;

    const placeMarker = (marker, input) => {
        if (input !== "") {
            const squareToUpdate = board[input.charAt(0)][input.charAt(1)];

            if (!squareToUpdate.isMarked()) {
                squareToUpdate.setMarker(marker);
                return true;
            }
        }
        return false;
    };

    const resetBoard = function () {
        for (let row = 0; row < board.length; row++) {
            for (let column = 0; column < board.length; column++) {
                board[row][column].setMarker("");
            }
        }
    };

    //Returns the winning marker, "TIE" or false if there's no winner.
    const checkWinner = () => {
        let turns = 0;

        // Returns winning marker or "TIE", or fale if no winner. Impossible to win before turn 5.
        for (let row = 0; row < board.length; row++) {
            for (let column = 0; column < board.length; column++) {
                let thisSquare = board[row][column];

                if (thisSquare.isMarked() && (++turns >= 5)) {
                    if (matchRow(thisSquare) || matchColumn(thisSquare) || matchDiagonal(thisSquare)) {
                        return thisSquare.getMarker()
                    } else if (turns === 9) {
                        return "TIE";
                    }
                }
            }
        }
        return false;
    };

    function matchRow(currentSquare) {
        for (let column = 0; column < board.length; column++) {
            if (board[currentSquare.getRow()][column].getMarker() != currentSquare.getMarker()) {
                return false;
            }
        }
        return true;
    }

    function matchColumn(currentSquare) {
        for (let row = 0; row < board.length; row++) {
            if (board[row][currentSquare.getColumn()].getMarker() != currentSquare.getMarker()) {
                return false;
            }
        }
        return true;
    }

    function matchDiagonal(currentSquare) {
        const squareMarker = currentSquare.getMarker();
        let squareRow = currentSquare.getRow();
        let squareColumn = currentSquare.getColumn();

        // Marker must match center square for a diagonal match - confirms center for remaining checks.
        if (board[1][1].getMarker() !== squareMarker) {
            return false;
        } else if (squareRow === squareColumn) {
            // Corner or center square - if corner, match spans top-left to bottom-right.
            let temp = 0;
            if (squareRow !== 1) {
                // Corner square, match spans top-left to bottom-right - indices equal each other and flip 00 => 22.
                temp = squareRow === 0 ? 2 : 0;
                return squareMarker === board[temp][temp].getMarker();
            } else {
                // Center square - direction is uncertain, check both ways starting from top-left square.
                return (
                    (squareMarker === board[temp][temp].getMarker() && squareMarker === board[temp + 2][temp + 2].getMarker())
                    || (squareMarker === board[temp][temp + 2].getMarker() && squareMarker === board[temp + 2][temp].getMarker())
                );
            }
        } else {
            // Square is corner, match spans bottom-left to top-right - indices flip 02 => 20.
            return squareMarker === board[squareColumn][squareRow].getMarker();
        }
    }

    return { getBoard, placeMarker, resetBoard, checkWinner };
})();

/**
 * Game Module
 * Controls the flow of the game, starting with getting the players, 2 players X and O, playing a round in order
 * to play a game, and announcing the winner.
 */
const Game = (() => {
    const players = (() => {
        const playerX = Player("Player X", "X");
        const playerO = Player("Player O", "O");

        let activePlayer = playerX;
        const getActivePlayer = () => activePlayer;
        const swapActivePlayer = function () { activePlayer = activePlayer === playerX ? playerO : playerX };

        return { playerX, playerO, getActivePlayer, swapActivePlayer };
    })();
    const getPlayers = () => players;

    // Returns the winning player, false if there is no winner, or null if move was invalid.
    const playRound = (squareID) => {
        // Place a marker using the activePlayer's marker and the ID provided. If false returned, marker wasn't placed.
        const markerPlaced = GameBoard.placeMarker(players.getActivePlayer().getMarker(), squareID);
        if (!markerPlaced) {
            return null;
        }

        // Check the board for a winner, if there is one, update the winning player's score and announce the winner.
        let winner = GameBoard.checkWinner();
        if (winner) {
            if (winner !== "TIE") {
                winner = winner === "X" ? players.playerX : players.playerO;
                winner.increaseScore();
            }
        }
        return winner;
    }

    return { getPlayers, playRound }
})();

/**
 * Screen Controller Module
 * Controls the display of the game on the screen, manipulating the DOM to show moves played, whose turn it is, and the
 * winner when found.
 */
const ScreenController = (function () {
    const editNameModal_x = document.querySelector(".player_x.get-name");
    const editNameModal_o = document.querySelector(".player_o.get-name");
    const editNameButton_x = document.querySelector("button.player_x.edit");
    const editNameButton_o = document.querySelector("button.player_o.edit");
    const saveNameButton_x = document.querySelector("button.player_x.save-name");
    const saveNameButton_o = document.querySelector("button.player_o.save-name");

    const announcementText_x = document.querySelector(".player_x.announcement");
    const announcementText_o = document.querySelector(".player_o.announcement");
    const announcementText_gameboard = document.querySelector(".gameboard.announcement");

    const squareBoard = document.querySelector(".square-container");
    const playButton = document.querySelector("button.play");

    const initializeScreen = (function () {
        // Add squares to DOM, each w/ ID matching its location - aligns with GameBoard ids.
        for (let row = 0; row < GameBoard.getBoard().length; row++) {
            for (let column = 0; column < GameBoard.getBoard().length; column++) {
                const squareButton = document.createElement("button");
                squareButton.setAttribute("id", `${row}${column}`);
                squareButton.className = "square";
                squareButton.setAttribute("type", "button");
                squareBoard.appendChild(squareButton);
            }
        }

        // Set the announcement text to give instructions below the board but not in player panels.
        announcementText_gameboard.style.display = "block";
        announcementText_x.style.display = "none";
        announcementText_o.style.display = "none";
    })();
    initializeScreen;

    const handleListeners = (function () {
        editNameButton_x.addEventListener("click", function () { editNameModal_x.showModal() });

        editNameButton_o.addEventListener("click", function () { editNameModal_o.showModal() });

        saveNameButton_x.addEventListener("click", function () {
            let name = document.querySelector("input#player_x-name").value;
            name = name === "" ? "Player X" : name;
            Game.getPlayers().playerX.setName(name);
            document.querySelector(".player_x.name").firstElementChild.textContent = name;
            editNameModal_x.close();
        });

        saveNameButton_o.addEventListener("click", function () {
            let name = document.querySelector("input#player_o-name").value;
            name = name === "" ? "Player O" : name;
            Game.getPlayers().playerO.setName(name);
            document.querySelector(".player_o.name").firstElementChild.textContent = name;
            editNameModal_o.close();
        });

        squareBoard.addEventListener("click", function (event) {
            // If the game hasn't started yet or has ended, don't proceed.
            if (playButton.textContent === "Reset") {
                const gameOver = Game.playRound(event.target.id);
                if (gameOver === null) {
                    // Move is invalid - update announcement to try again, don't change players or render.
                    if (Game.getPlayers().getActivePlayer() === Game.getPlayers().playerX) {
                        announcementText_x.textContent = "Please try again";
                    } else {
                        announcementText_o.textContent = "Please try again";
                    }
                } else if (!gameOver) {
                    // Move is valid but no winner found - display move and swap players to continue.
                    render();
                    swapPlayerAnnouncement();
                } else if (gameOver) {
                    // Move is valid, winner is found - announce winner.
                    render();
                    announceWinner(gameOver);
                }
            }
        });

        playButton.addEventListener("click", (event) => {
            switch (event.target.textContent) {
                case "Start":
                    // This will only show when the page is first loaded. PlayerX is always the first player
                    announcementText_gameboard.style.display = "none";
                    announcementText_x.style.display = "block";
                    playButton.textContent = "Reset";
                    break;
                case "Reset":
                    GameBoard.resetBoard();
                    render();
                    swapPlayerAnnouncement();
                    break;
                case "Play Again?":
                    // This will only show when a game has completed. 
                    announcementText_gameboard.style.display = "none";
                    playButton.textContent = "Reset";
                    GameBoard.resetBoard();
                    render();
                    swapPlayerAnnouncement();
            }
        });
    })();
    handleListeners;

    function render() {
        for (let row = 0; row < GameBoard.getBoard().length; row++) {
            for (let column = 0; column < GameBoard.getBoard().length; column++) {
                // Find the button associated to this board square and update the marker to match.
                document.getElementById(`${row}${column}`).textContent = GameBoard.getBoard()[row][column].getMarker();
            }
        }
    }

    function swapPlayerAnnouncement() {
        if (Game.getPlayers().getActivePlayer() === Game.getPlayers().playerX) {
            announcementText_o.textContent = "It's your turn!";
            announcementText_x.style.display = "none";
            announcementText_o.style.display = "block";
        } else {
            announcementText_x.textContent = "It's your turn!";
            announcementText_o.style.display = "none";
            announcementText_x.style.display = "block";
        }
        Game.getPlayers().swapActivePlayer();
    }

    function announceWinner(winningPlayer) {
        announcementText_x.style.display = "none";
        announcementText_o.style.display = "none";
        announcementText_gameboard.style.display = "block";

        if (winningPlayer === "TIE") {
            announcementText_gameboard.textContent = "It's a Tie!";
        } else {
            if (winningPlayer === Game.getPlayers().playerX) {
                document.querySelector(".player_x.score").textContent = winningPlayer.getScore();
            } else {
                document.querySelector(".player_o.score").textContent = winningPlayer.getScore();
            }
            announcementText_gameboard.textContent =
                winningPlayer.getName() + " wins!\nNew score: " + winningPlayer.getScore();
        }
        playButton.textContent = "Play Again?";
    }
})();
ScreenController;