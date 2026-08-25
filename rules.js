/* =========================================================
   FREECHESS RULES ENGINE - FIXED für chess.js 0.10.3 + 1.4.0
   ========================================================= */

let fcRules = null;

function getChessConstructor(){
    if(typeof Chess === 'function') return Chess;
    if(typeof window.Chess === 'function') return window.Chess;
    // chess.js 1.4.0 iife exportiert als Objekt { Chess: class }
    if(typeof Chess === 'object' && typeof Chess.Chess === 'function') return Chess.Chess;
    if(typeof window.Chess === 'object' && typeof window.Chess.Chess === 'function') return window.Chess.Chess;
    // cdnjs 0.10.3 manchmal als window.Chess
    if(typeof window!== 'undefined' && window.Chess && typeof window.Chess === 'function') return window.Chess;
    return null;
}

function fcCreateRules() {
    const Ctor = getChessConstructor();
    if (!Ctor) {
        console.error('FreeChess: chess.js konnte nicht geladen werden. Ctor not found');
        return null;
    }
    try {
        fcRules = new Ctor();
        fcSyncBoardFromRules();
        console.log('FreeChess: Rules created', fcRules.fen());
        return fcRules;
    } catch(e){
        console.error('FreeChess: fcCreateRules failed', e);
        return null;
    }
}

function fcEnsureRules() {
    if (!fcRules) fcCreateRules();
    return fcRules;
}

function fcSyncBoardFromRules() {
    if (!fcRules || typeof board === 'undefined' ||!board) return;

    const next = new Array(64).fill(0);
    const rows = fcRules.board();
    const map = {
        wp: 'wP', wn: 'wN', wb: 'wB', wr: 'wR', wq: 'wQ', wk: 'wK',
        bp: 'bP', bn: 'bN', bb: 'bB', br: 'bR', bq: 'bQ', bk: 'bK'
    };

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const p = rows[row][col];
            if (p) {
                const key = p.color + p.type;
                next[row * 8 + col] = map[key];
            }
        }
    }

    board.boardArr = next;

    try {
        whiteTurn = fcRules.turn() === 'w';
        isCheck = fcRules.isCheck? fcRules.isCheck() : fcRules.inCheck? fcRules.inCheck() : false;

        const fen = fcRules.fen();
        const fenParts = fen.split(' ');
        const rights = fenParts[2] || '-';
        isWhiteRightCastleLegal = rights.includes('K');
        isWhiteLeftCastleLegal = rights.includes('Q');
        isBlackRightCastleLegal = rights.includes('k');
        isBlackLeftCastleLegal = rights.includes('q');
        halfMoveCount = Number(fenParts[4]) || 0;
        fullMoveCount = Number(fenParts[5]) || 1;
    } catch(e){
        console.warn('fcSyncBoardFromRules fen parse failed', e);
    }

    whiteDangerSqrs = [];
    blackDangerSqrs = [];
}

function fcResetRules() {
    const chess = fcEnsureRules();
    if (!chess) {
        console.error('FreeChess: fcResetRules - no chess engine');
        return false;
    }
    try {
        chess.reset();
        fcSyncBoardFromRules();
        playerLost = false;
        playerWon = false;
        draw = false;
        playStockFishMove = false;
        console.log('FreeChess: Rules reset');
        return true;
    } catch(e){
        console.error('FreeChess: reset failed', e);
        return false;
    }
}

function fcPlayerMove(from, to, promotion = 'q') {
    const chess = fcEnsureRules();
    if (!chess) return false;
    if (chess.turn()!== 'w') return false;

    try {
        const move = chess.move({ from, to, promotion });
        if (!move) return false;
        fcSyncBoardFromRules();
        return true;
    } catch (error) {
        console.warn('Illegaler Spielerzug:', from, to, error);
        return false;
    }
}

function fcStockfishMove(uci) {
    const chess = fcEnsureRules();
    if (!chess) return false;
    if (chess.turn()!== 'b') return false;

    const moveText = String(uci || '').trim();
    const from = moveText.slice(0, 2);
    const to = moveText.slice(2, 4);
    const promotion = moveText.length >= 5? moveText[4].toLowerCase() : undefined;

    if (!/^[a-h][1-8][a-h][1-8](?:[qrbn])?$/.test(moveText)) return false;

    try {
        const move = chess.move({ from, to,...(promotion? { promotion } : {}) });
        if (!move) return false;
        fcSyncBoardFromRules();
        return true;
    } catch (error) {
        console.error('Illegaler Stockfish-Zug:', moveText, error);
        return false;
    }
}

function fcGameOver() {
    return!!fcRules && fcRules.isGameOver();
}

function fcCheckmate() {
    return!!fcRules && fcRules.isCheckmate();
}

function fcDraw() {
    return!!fcRules && fcRules.isDraw();
}

function fcCurrentFen() {
    return fcRules? fcRules.fen() : '';
}

// Initialise sofort + nochmal nach load
if (typeof document!== 'undefined') {
    // Versuch sofort, wenn Chess schon da ist
    if (getChessConstructor()) {
        fcCreateRules();
    } else {
        // Sonst warte auf window load
        window.addEventListener('load', () => {
            setTimeout(fcCreateRules, 100);
        });
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(fcCreateRules, 100);
        });
    }
}
