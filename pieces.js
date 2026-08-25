class Pieces {
    constructor() {
        // Use the global square scale if available, otherwise default to 50
        this.pieceScale = (typeof sqreScale !== 'undefined' ? Math.max(16, Math.min(80, sqreScale - 10)) : 50);

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
            bK: { id: 'bK', cx: 0, cy: 429, cw: 424, ch: 429 }
        };

        // fallback unicode glyphs if sprite image not available
        this.glyphs = {
            wP: '♙', wN: '♘', wB: '♗', wR: '♖', wQ: '♕', wK: '♔',
            bP: '♟', bN: '♞', bB: '♝', bR: '♜', bQ: '♛', bK: '♚'
        };
    }

    // sqr: [{x: 0, y: 0}]
    drawPiece(type, sqr) {
        if (typeof ctx === 'undefined' || !ctx) return;
        if (!type || !sqr || !Array.isArray(sqr) || !sqr[0]) return;

        // keep pieceScale in sync with board scale
        const scale = (typeof sqreScale !== 'undefined' ? sqreScale : 60);
        this.pieceScale = Math.max(12, Math.min(scale - 4, this.pieceScale));

        const sqrCenterX = sqr[0].x + (scale / 2);
        const sqrCenterY = sqr[0].y + (scale / 2);

        // prefer sprite if loaded
        const spriteAvailable = (typeof sprite !== 'undefined' && sprite && sprite.complete && sprite.naturalWidth && sprite.naturalWidth > 0);

        if (spriteAvailable) {
            try {
                ctx.drawImage(sprite,
                    type.cx,
                    type.cy,
                    type.cw,
                    type.ch,
                    sqrCenterX - this.pieceScale / 2,
                    sqrCenterY - this.pieceScale / 2,
                    this.pieceScale, this.pieceScale
                );
                return;
            } catch (e) {
                // fallthrough to glyph fallback
            }
        }

        // glyph fallback (works even if sprite missing)
        const id = type.id || '';
        const glyph = this.glyphs[id] || '?';
        ctx.fillStyle = (id[0] === 'b') ? '#000' : '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // pick a font size near pieceScale
        ctx.font = `${Math.floor(this.pieceScale)}px sans-serif`;
        ctx.fillText(glyph, sqrCenterX, sqrCenterY + 2);
    }
}

pieces = new Pieces();
