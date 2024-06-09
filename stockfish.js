class Stockfish {
    constructor() {}

    async getBestMove(fen) {
        const endpoint = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${10}`;
        
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        if(data.mate == -1) {
                           playerLost = true;
                        }

                        if (data.success) {
                            resolve(data.bestmove);
                        } else {
                            console.error("Error:", data.data);
                            resolve(null);
                        }
                    } else {
                        console.error("Error fetching data:", xhr.statusText)   ;
                        resolve(null);
                    }
                }
            };
            xhr.open("GET", endpoint, true);
            xhr.send();
        });
    }

    extractBestMove(moveString) {
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
            board.applyMove(extractedBestMove); // Apply the best move to the board
            setTimeout(() => update(), 300)
            
            if(playerLost) {
                setTimeout(() => {
                    if (window.confirm("You suck at chess bruh!! wanna play again?")) {
                        window.location.reload(); // Refresh the page
                    }  
                }, 1000);
            }
        } else {
            console.error("No valid move received from Stockfish.");
        }
    }
}
