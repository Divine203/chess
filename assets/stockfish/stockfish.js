// Minimal local engine Worker for FreeChess
// Implements a tiny UCI-like subset using chess.js moves as a lightweight engine.
// This is NOT Stockfish; it's a local worker fallback so the game works offline on GitHub Pages.

self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js');

let chess = null;
let lastFen = null;

function ensureChess(fen) {
  try {
    if (!fen) {
      chess = new Chess();
      lastFen = chess.fen();
    } else {
      chess = new Chess(fen);
      lastFen = fen;
    }
  } catch (e) {
    chess = new Chess();
    lastFen = chess.fen();
  }
}

function pickBestMove() {
  if (!chess) ensureChess();
  const moves = chess.moves({ verbose: true });
  if (!moves || moves.length === 0) return null;

  const valueMap = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let best = null;
  let bestScore = -Infinity;

  for (const m of moves) {
    let score = 0;
    if (m.captured) score += (valueMap[m.captured.toLowerCase()] || 0) * 10; // prioritize captures
    // small preference for center/square control (simple heuristic)
    const toFile = m.to.charCodeAt(0) - 97;
    const toRank = Number(m.to[1]);
    const centerDist = Math.abs(3.5 - toFile) + Math.abs(3.5 - (toRank - 1));
    score += (4 - centerDist) * 0.1;
    // random tie-break
    score += Math.random() * 0.01;

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }

  if (!best) return null;
  return (best.from + best.to + (best.promotion ? best.promotion : '')).trim();
}

self.onmessage = function (ev) {
  const data = ev && ev.data ? String(ev.data) : '';
  if (!data) return;
  const line = data.trim();

  // respond to UCI minimal
  if (line === 'uci') {
    self.postMessage('id name FreeChessWorker');
    self.postMessage('id author Copilot');
    self.postMessage('uciok');
    return;
  }
  if (line === 'isready') {
    self.postMessage('readyok');
    return;
  }

  // position handling
  if (line.startsWith('position')) {
    // formats: 'position fen <FEN>' or 'position startpos'
    const rest = line.slice('position'.length).trim();
    if (rest.startsWith('fen')) {
      const fen = rest.slice(3).trim().split(' moves ')[0].trim();
      ensureChess(fen);
      return;
    }
    if (rest.startsWith('startpos')) {
      ensureChess();
      return;
    }
  }

  if (line.startsWith('go')) {
    // compute best move and post 'bestmove <uci>'
    // For simplicity, ignore depth/time and respond quickly
    try {
      const best = pickBestMove();
      if (best) {
        self.postMessage('bestmove ' + best);
      } else {
        self.postMessage('bestmove (none)');
      }
    } catch (e) {
      self.postMessage('bestmove (error)');
    }
    return;
  }

  // allow direct commands 'fen <FEN>'
  if (line.startsWith('fen ')) {
    const fen = line.slice(4).trim();
    ensureChess(fen);
    return;
  }

  // unknown command: ignore
};
