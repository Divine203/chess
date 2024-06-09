class Board {
    constructor() {
        this.boardArr = new Array(64).fill(0); // an array of 64, 0s
        this.init();
        this.pieceMap = {
            'wP': 'P', 'wR': 'R', 'wN': 'N', 'wB': 'B', 'wQ': 'Q', 'wK': 'K',
            'bP': 'p', 'bR': 'r', 'bN': 'n', 'bB': 'b', 'bQ': 'q', 'bK': 'k'
        };
    }

    // Assigning pieces to starting squares
    init() {
        this.boardArr[0] = 'bR';
        this.boardArr[1] = 'bN';
        this.boardArr[2] = 'bB';
        this.boardArr[3] = 'bQ';
        this.boardArr[4] = 'bK';
        this.boardArr[5] = 'bB';
        this.boardArr[6] = 'bN';
        this.boardArr[7] = 'bR';
        this.boardArr[8] = 'bP';
        this.boardArr[9] = 'bP';
        this.boardArr[10] = 'bP';
        this.boardArr[11] = 'bP';
        this.boardArr[12] = 'bP';
        this.boardArr[13] = 'bP';
        this.boardArr[14] = 'bP';
        this.boardArr[15] = 'bP';

        this.boardArr[48] = 'wP';
        this.boardArr[49] = 'wP';
        this.boardArr[50] = 'wP';
        this.boardArr[51] = 'wP';
        this.boardArr[52] = 'wP';
        this.boardArr[53] = 'wP';
        this.boardArr[54] = 'wP';
        this.boardArr[55] = 'wP';
        this.boardArr[56] = 'wR';
        this.boardArr[57] = 'wN';
        this.boardArr[58] = 'wB';
        this.boardArr[59] = 'wQ';
        this.boardArr[60] = 'wK';
        this.boardArr[61] = 'wB';
        this.boardArr[62] = 'wN';
        this.boardArr[63] = 'wR';
    }

    convertBoardToFEN() {
        let fenString = '';
        for (let i = 0; i < 64; i += 8) {
            let emptyCount = 0;
            for (let j = 0; j < 8; j++) {
                const piece = this.boardArr[i + j];
                if (piece === 0) {
                    emptyCount++;
                } else {
                    if (emptyCount > 0) {
                        fenString += emptyCount;
                        emptyCount = 0;
                    }
                    fenString += this.pieceMap[piece];
                }
            }
            if (emptyCount > 0) {
                fenString += emptyCount;
            }
            if (i < 56) { // Add slash between ranks
                fenString += '/';
            }
        }
        
        let activeColor = whiteTurn ? 'w' : 'b'; 
        let bCastleK = isBlackRightCastleLegal ?  'k' : '';
        let bCastleQ = isBlackLeftCastleLegal ?  'q' : '';
        let wCastleK = isWhiteRightCastleLegal ?  'K' : '';
        let wCastleQ = isWhiteLeftCastleLegal ?  'Q' : '';

        let castlingRights = `${wCastleK}${wCastleQ}${bCastleK}${bCastleQ}` ; // Both sides can castle both ways
        let enPassantTarget = '-'; // No en passant target
        let halfmoveClock = halfMoveCount; // No halfmoves since last capture or pawn move
        let fullmoveNumber = fullMoveCount; // Starting move number

        return `${fenString} ${activeColor} ${castlingRights} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;
    }

    applyMove(move) {
        const [from, to] = [move.substring(0, 2), move.substring(2, 4)];
        const fromIndex = this.algebraicToIndex(from);
        const toIndex = this.algebraicToIndex(to);

        const isCapture = this.boardArr[toIndex] == 0 ? false : true;

        // Get piece being moved
        const piece = this.boardArr[fromIndex];
        if (!piece) {
            console.error(`No piece found at ${from}`);
            return;
        }

        // Update board
        this.boardArr[fromIndex] = 0;
        this.boardArr[toIndex] = piece;

        
        // Increment move counts
        if (whiteTurn) {
            fullMoveCount++;
        }
        whiteTurn = !whiteTurn;

        // find out if the move stockfish made is a check
        if(whiteTurn) {
            if(getPossibleMoves(piece, toIndex).includes(this.boardArr.indexOf('wK'))) {
                if(isCheck == false) isCheck = true;
            } else {
                isCheck = false;
            }
        }
        //

        // play the right audios
        if(isCheck == false) {
            if (isCapture) audio.playAudio(audio.sound.capture);
            else audio.playAudio(audio.sound.move);
        } else {
            audio.playAudio(audio.sound.check);
        }

    }

    algebraicToIndex(algebraic) {
        const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(algebraic[1], 10);
        return rank * 8 + file;
    }

}

board = new Board();
