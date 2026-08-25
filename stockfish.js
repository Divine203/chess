class Stockfish {
    constructor() {
        this.busy = false;
        this.requestId = 0;
        this.worker = null;
        this.pending = {};
        this.useAPI = false;
        this.initialized = false;

        // try to initialize a local Stockfish worker
        this._initLocalWorker();
    }

    _initLocalWorker() {
        // Try common local paths. If worker cannot be created, fallback to other strategies.
        const candidates = [
            './assets/stockfish/stockfish.js',
            './assets/stockfish.wasm.js',
            './stockfish.js'
        ];

        const tryNext = (index) => {
            if (index >= candidates.length) {
                console.warn('Stockfish: no local engine found, will use JS fallback or remote API.');
                this.useAPI = false;
                return;
            }
            try {
                const path = candidates[index];
                const w = new Worker(path);
                w.onmessage = (ev) => this._onWorkerMessage(ev);
                w.onerror = (err) => {
                    console.warn('Stockfish worker error for', path, err);
                };
                this.worker = w;
                this.enginePath = path;
                this._sendToWorker('uci');
                console.log('Stockfish: worker created from', path);
            } catch (e) {
                console.warn('Stockfish: Worker instantiation failed for', candidates[index], e);
                tryNext(index + 1);
            }
        };

        tryNext(0);
    }

    _sendToWorker(msg) {
        try {
            if (this.worker) this.worker.postMessage(String(msg));
        } catch (e) {
            console.warn('Stockfish: failed to postMessage to worker', e);
        }
    }

    _onWorkerMessage(ev) {
        const data = ev && ev.data ? ev.data.toString() : '';
        if (!this.initialized) {
            if (data.indexOf('uciok') !== -1) {
                this._sendToWorker('isready');
            } else if (data.indexOf('readyok') !== -1) {
                this.initialized = true;
                console.log('Stockfish: worker initialized');
            }
        }

        const bm = this._parseBestMoveFromText(data);
        if (bm) {
            const reqId = Object.keys(this.pending)[0];
            if (reqId) {
                const p = this.pending[reqId];
                clearTimeout(p.timeout);
                delete this.pending[reqId];
                this.busy = false;
                p.resolve(bm);
            }
        }

        if (!data && typeof ev.data === 'object') {
            const txt = JSON.stringify(ev.data);
            const bm2 = this._parseBestMoveFromText(txt);
            if (bm2) {
                const reqId = Object.keys(this.pending)[0];
                if (reqId) {
                    const p = this.pending[reqId];
                    clearTimeout(p.timeout);
                    delete this.pending[reqId];
                    this.busy = false;
                    p.resolve(bm2);
                }
            }
        }
    }

    _parseBestMoveFromText(text) {
        if (!text) return null;
        const m = text.match(/bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/i);
        if (m && m[1]) return m[1].trim();
        return null;
    }

    async getBestMove(fen) {
        // Prefer local worker if available and initialized
        if (this.busy) return null;
        this.busy = true;
        const requestId = ++this.requestId;

        // 1) Local worker
        if (this.worker && this.initialized) {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    if (this.pending[requestId]) {
                        delete this.pending[requestId];
                        this.busy = false;
                        resolve(null);
                    }
                }, 8000);
                this.pending[requestId] = { resolve, timeout };
                try {
                    this._sendToWorker('position fen ' + fen);
                    this._sendToWorker('go depth 12');
                } catch (e) {
                    clearTimeout(timeout);
                    delete this.pending[requestId];
                    this.busy = false;
                    resolve(null);
                }
            });
        }

        // 2) If worker exists but not initialized, wait briefly
        if (this.worker && !this.initialized) {
            const start = Date.now();
            while (!this.initialized && Date.now() - start < 3000) {
                // small sleep
                await new Promise(r => setTimeout(r, 100));
            }
            if (this.initialized) return this.getBestMove(fen);
        }

        // 3) JS fallback using chess.js (fast, local, not as strong as Stockfish)
        try {
            if (typeof fcEnsureRules === 'function') {
                const ch = fcEnsureRules();
                if (ch) {
                    // generate moves for current side using chess.js
                    const moves = ch.moves({ verbose: true });
                    if (moves && moves.length > 0) {
                        // prefer captures with highest piece value
                        const valueMap = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
                        let best = null;
                        let bestScore = -Infinity;
                        for (const m of moves) {
                            let score = 0;
                            if (m.captured) score += valueMap[m.captured.toLowerCase()] || 0;
                            // small randomization
                            score += Math.random() * 0.1;
                            if (score > bestScore) { bestScore = score; best = m; }
                        }
                        this.busy = false;
                        return (best.from + best.to + (best.promotion ? best.promotion : '')).trim();
                    }
                }
            }
        } catch (e) {
            console.warn('Stockfish JS fallback failed:', e);
        }

        // 4) Remote API fallback
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const response = await fetch('https://chess-api.com/v1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen, depth: 12, variants: 1, maxThinkingTime: 1200 }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            this.busy = false;
            if (!data || typeof data.move !== 'string') throw new Error('Keine gültige Engine-Antwort');
            return data.move.trim();
        } catch (error) {
            console.error('Stockfish API Fehler:', error);
            this.busy = false;
            return null;
        }
    }

    extractBestMove(moveString) {
        const move = moveString ? String(moveString).trim().split(/\s+/)[0] : null;
        return /^[a-h][1-8][a-h][1-8][qrbn]?$/i.test(move || '') ? move : null;
    }

    async playStockfishMove() {
        if (this.busy || !board || whiteTurn) return false;
        const fen = typeof fcCurrentFen === 'function' ? fcCurrentFen() : board.convertBoardToFEN();
        const raw = await this.getBestMove(fen);
        const bestMove = this.extractBestMove(raw);
        if (whiteTurn || !bestMove) { playStockFishMove = false; return false; }
        console.log('Stockfish zieht:', bestMove);
        const applied = board.applyMove(bestMove);
        playStockFishMove = false;
        if (!applied) {
            console.error('Stockfish-Zug konnte nicht angewendet werden:', bestMove);
            update();
            drawBoard();
            return false;
        }
        update();
        drawBoard();
        return true;
    }
}
