// this is a stockfish api. It reads the current position through a fen string and sends 
// the best move for stockfish to play
class Stockfish {
    constructor() { }

    async getBestMove(fen) {
        const endpoint = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${1}`;

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        if (data.mate == -1) {
                            playerLost = true;
                            playerWon = false;
                        } else if (data.mate == 1) {
                            playerWon = true;
                            playerLost = false;
                        } else if (data.mate == 0) {
                            playerLost = false;
                            playerWon = false;
                            draw = true;
                        }
                        if (data.success) {
                            resolve(data.bestmove);
                        } else {
                            console.error("Error:", data.data);
                            resolve(null);
                        }
                    } else {
                        console.error("Error fetching data:", xhr.statusText);
                        resolve(null);
                    }
                }
            };
            xhr.open("GET", endpoint, true);
            xhr.send();
        });
    }

    // extracts the best move itself from the string sent by the api
    extractBestMove(moveString) { // "bestmove e4f3 ponder e2f3" => "e4f3"
        const parts = moveString.split(" ");
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "bestmove" && i + 1 < parts.length) {
                return parts[i + 1];
            }
        }
        return null; // Return null if "bestmove" keyword is not found
    }

    async playStockfishMove() {
        const fen = board.convertBoardToFEN();
        const bestMove = await this.getBestMove(fen); // Get best move from Stockfish
        if (bestMove) {
            let extractedBestMove = this.extractBestMove(bestMove);
            if(`${extractedBestMove[0]}${extractedBestMove[1]}` == `${extractedBestMove[2]}${extractedBestMove[3]}`) {
                this.playStockfishMove();
            }
            board.applyMove(extractedBestMove); // Apply the best move to the board
            setTimeout(() => {
                update()
                if (playerLost) {
                    promptUser("Stockfish: You suck at chess lol... wanna play again?");
                } else if (playerWon) {
                    promptUser("Stockfish: There's no way in hell you just beat me!!");
                } else if (draw) {
                    promptUser("Drawing with Stockfish is just wild!!");
                }
            }, 300)


        } else {
            console.error("No valid move received from Stockfish.");
            promptUser("Something went wrong :( Please check your connection");
        }
    }
}
