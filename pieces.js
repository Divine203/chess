class Pieces {
    constructor() {
        this.pieceScale = 50;

        // piece type's sprite coordinates for drawing
        this.type = {
            wP: { id: 'wP', cx: 2136, cy: 0, cw: 424, ch: 429 },
            wR: { id: 'wR', cx: 1704, cy: 0, cw: 424, ch: 429 },
            wN: { id: 'wN', cx: 1277, cy: 0, cw: 424, ch: 429 },
            wB: { id: 'wB', cx: 858, cy: 0, cw: 424, ch: 429 },
            wQ: { id: 'wQ', cx: 426, cy: 0, cw: 424, ch: 429 },
            wK: { id: 'wK', cx: 0, cy: 0, cw: 424, ch: 429 },

            bP: { id: 'bP', cx: 2136, cy: 429, cw: 424, ch: 429 },
            bR: { id: 'bR', cx: 1704, cy: 429, cw: 424, ch: 429 },
            bN: { id: 'bN', cx: 1277, cy: 429, cw: 424, ch: 429 },
            bB: { id: 'bB', cx: 858, cy: 429, cw: 424, ch: 429 },
            bQ: { id: 'bQ', cx: 426, cy: 429, cw: 424, ch: 429 },
            bK: { id: 'bK', cx: 0, cy: 429, cw: 424, ch: 429 },
        };
    }

    // sqr: [{x: 0, y: 0}]
    drawPiece(type, sqr) {
        let sqrCenterX = sqr[0].x + (60/2);
        let sqrCenterY = sqr[0].y + (60/2);

        ctx.drawImage(sprite,
            type.cx,
            type.cy,
            type.cw,
            type.ch,
            sqrCenterX - this.pieceScale/2,
            sqrCenterY - this.pieceScale/2,
            this.pieceScale, this.pieceScale
        );
    }
}

pieces = new Pieces();