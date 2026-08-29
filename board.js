class Board {
    constructor() {
        this.boardArr = new Array(64).fill(0);
        this.pieceMap = {
            wP: 'P', wR: 'R', wN: 'N', wB: 'B', wQ: 'Q', wK: 'K',
            bP: 'p', bR: 'r', bN: 'n', bB: 'b', bQ: 'q', bK: 'k'
        };
        this.init();
    }

    init() {
        this.boardArr.fill(0);
        const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        for (let i = 0; i < 8; i++) {
            this.boardArr[i] = 'b' + back[i];
            this.boardArr[8 + i] = 'bP';
            this.boardArr[48 + i] = 'wP';
            this.boardArr[56 + i] = 'w' + back[i];
        }
    }

    convertBoardToFEN() {
        if (typeof fcCurrentFen === 'function' && fcRules) return fcCurrentFen();

        let fen = '';
        for (let i = 0; i < 64; i += 8) {
            let empty = 0;
            for (let j = 0; j < 8; j++) {
                const p = this.boardArr[i + j];
                if (p === 0) empty++;
                else {
                    if (empty) { fen += empty; empty = 0; }
                    fen += this.pieceMap[p];
                }
            }
            if (empty) fen += empty;
            if (i < 56) fen += '/';
        }
        const active = whiteTurn ? 'w' : 'b';
        return `${fen} ${active} - - ${Math.max(0, halfMoveCount || 0)} ${Math.max(1, fullMoveCount || 1)}`;
    }

    applyMove(move) {
        const uci = String(move || '').trim().split(/\s+/)[0];
        if (typeof fcStockfishMove === 'function' && fcRules) {
            return fcStockfishMove(uci);
        }
        return false;
    }

    algebraicToIndex(algebraic) {
        const file = algebraic.charCodeAt(0) - 97;
        const rank = 8 - parseInt(algebraic[1], 10);
        return rank * 8 + file;
    }
}

board = new Board();
