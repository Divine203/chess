// Utility functions we'll use in main file
// Defensive and GitHub Pages friendly version

function getScale() {
  return typeof sqreScale !== 'undefined' ? sqreScale : 60;
}

function safeSqrAt(index) {
  if (typeof board === 'undefined' || !board || !board.boardArr) return 0;
  return board.boardArr[index];
}

function calcRookMov(currentIndex) {
  const top = [];
  const bottom = [];
  const left = [];
  const right = [];

  // Up
  let pos = currentIndex - 8;
  while (pos >= 0) { top.push(pos); pos -= 8; }

  // Down
  pos = currentIndex + 8;
  while (pos < 64) { bottom.push(pos); pos += 8; }

  // Left
  pos = currentIndex - 1;
  while (pos >= 0 && Math.floor(pos / 8) === Math.floor(currentIndex / 8)) { left.push(pos); pos -= 1; }

  // Right
  pos = currentIndex + 1;
  while (pos < 64 && Math.floor(pos / 8) === Math.floor(currentIndex / 8)) { right.push(pos); pos += 1; }

  return {
    topSqrs: top,
    bottomSqrs: bottom,
    leftSqrs: left,
    rightSqrs: right
  };
}

function calcBishopMov(currentIndex) {
  const tr = [];
  const br = [];
  const tl = [];
  const bl = [];

  // top-right (row-1, col+1) => -7
  let pos = currentIndex;
  while (true) {
    const row = Math.floor(pos / 8);
    const col = pos % 8;
    if (row === 0 || col === 7) break;
    pos = pos - 7;
    if (pos < 0) break;
    tr.push(pos);
  }

  // bottom-right (row+1, col+1) => +9
  pos = currentIndex;
  while (true) {
    const row = Math.floor(pos / 8);
    const col = pos % 8;
    if (row === 7 || col === 7) break;
    pos = pos + 9;
    if (pos >= 64) break;
    br.push(pos);
  }

  // top-left (row-1, col-1) => -9
  pos = currentIndex;
  while (true) {
    const row = Math.floor(pos / 8);
    const col = pos % 8;
    if (row === 0 || col === 0) break;
    pos = pos - 9;
    if (pos < 0) break;
    tl.push(pos);
  }

  // bottom-left (row+1, col-1) => +7
  pos = currentIndex;
  while (true) {
    const row = Math.floor(pos / 8);
    const col = pos % 8;
    if (row === 7 || col === 0) break;
    pos = pos + 7;
    if (pos >= 64) break;
    bl.push(pos);
  }

  return {
    trSqrs: tr,
    brSqrs: br,
    tlSqrs: tl,
    blSqrs: bl
  };
}

function calcKingMov(currentIndex, piece) {
  if (!piece || piece === 0) return [];
  const sqrs = [];
  const row = Math.floor(currentIndex / 8);
  const col = currentIndex % 8;

  if (row > 0) { sqrs.push(currentIndex - 8); }
  if (row < 7) { sqrs.push(currentIndex + 8); }
  if (col > 0) { sqrs.push(currentIndex - 1); }
  if (col < 7) { sqrs.push(currentIndex + 1); }
  if (row > 0 && col > 0) { sqrs.push(currentIndex - 9); }
  if (row > 0 && col < 7) { sqrs.push(currentIndex - 7); }
  if (row < 7 && col > 0) { sqrs.push(currentIndex + 7); }
  if (row < 7 && col < 7) { sqrs.push(currentIndex + 9); }

  return sqrs.filter(index => {
    const s = safeSqrAt(index);
    return !(s && s !== 0 && s[0] === piece[0]);
  });
}

function calcKnightMov(currentIndex, piece) {
  if (!piece || piece === 0) return [];
  const squares = [];
  const row = Math.floor(currentIndex / 8);
  const col = currentIndex % 8;

  const possibleMoves = [
    { row: -2, col: -1 },
    { row: -2, col: 1 },
    { row: -1, col: -2 },
    { row: -1, col: 2 },
    { row: 1, col: -2 },
    { row: 1, col: 2 },
    { row: 2, col: -1 },
    { row: 2, col: 1 }
  ];

  for (const move of possibleMoves) {
    const newRow = row + move.row;
    const newCol = col + move.col;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      squares.push(newRow * 8 + newCol);
    }
  }

  return squares.filter(index => {
    const s = safeSqrAt(index);
    return !(s && s !== 0 && s[0] === piece[0]);
  });
}

function calcPawnMov(currentIndex, side) {
  const sqrs = [];
  const row = Math.floor(currentIndex / 8);

  if (side === 'w') {
    if (row > 0) {
      if (safeSqrAt(currentIndex - 8) === 0) sqrs.push(currentIndex - 8);
      // double move allowed only from starting rank (row 6)
      if (row === 6 && safeSqrAt(currentIndex - 16) === 0 && safeSqrAt(currentIndex - 8) === 0) sqrs.push(currentIndex - 16);
    }
  } else {
    if (row < 7) {
      if (safeSqrAt(currentIndex + 8) === 0) sqrs.push(currentIndex + 8);
      // double move only from starting rank (row 1)
      if (row === 1 && safeSqrAt(currentIndex + 16) === 0 && safeSqrAt(currentIndex + 8) === 0) sqrs.push(currentIndex + 16);
    }
  }
  return sqrs;
}

function calcPawnCaptureIfThereIsAPiece(currentIndex, side) {
  const sqrs = [];
  const row = Math.floor(currentIndex / 8);
  const col = currentIndex % 8;

  if (side === 'w') {
    if (row > 0 && col > 0) {
      const topleft = currentIndex - 9;
      const s = safeSqrAt(topleft);
      if (s && s !== 0 && s[0].toLowerCase() !== side.toLowerCase()) sqrs.push(topleft);
    }
    if (row > 0 && col < 7) {
      const topRight = currentIndex - 7;
      const s = safeSqrAt(topRight);
      if (s && s !== 0 && s[0].toLowerCase() !== side.toLowerCase()) sqrs.push(topRight);
    }
  } else {
    if (row < 7 && col > 0) {
      const bottomLeft = currentIndex + 7;
      const s = safeSqrAt(bottomLeft);
      if (s && s !== 0 && s[0].toLowerCase() !== side.toLowerCase()) sqrs.push(bottomLeft);
    }
    if (row < 7 && col < 7) {
      const bottomRight = currentIndex + 9;
      const s = safeSqrAt(bottomRight);
      if (s && s !== 0 && s[0].toLowerCase() !== side.toLowerCase()) sqrs.push(bottomRight);
    }
  }

  return sqrs;
}

function calcPawnCapture(currentIndex, side) {
  const sqrs = [];
  const row = Math.floor(currentIndex / 8);
  const col = currentIndex % 8;

  if (side === 'w') {
    if (row > 0 && col > 0) sqrs.push(currentIndex - 9);
    if (row > 0 && col < 7) sqrs.push(currentIndex - 7);
  } else {
    if (row < 7 && col > 0) sqrs.push(currentIndex + 7);
    if (row < 7 && col < 7) sqrs.push(currentIndex + 9);
  }

  return sqrs;
}

function removeBlockedSquares(sideSqrs, piece) {
  // Return a new array truncated at the first occupied square.
  const res = [];
  for (let i = 0; i < sideSqrs.length; i++) {
    const idx = sideSqrs[i];
    const s = safeSqrAt(idx);
    if (s === 0 || !s) {
      res.push(idx);
      continue;
    }
    // occupied: if opponent piece, include this square as capture, then stop
    if (s[0] !== piece[0]) res.push(idx);
    break;
  }
  return res;
}

function whiteRightSideCastle() {
  board.boardArr[61] = 'wR';
  board.boardArr[62] = 'wK';
  board.boardArr[60] = 0;
  board.boardArr[63] = 0;

  isWhiteRightCastleLegal = false;
  isWhiteLeftCastleLegal = false;
}

function whiteLeftSideCastle() {
  board.boardArr[59] = 'wR';
  board.boardArr[58] = 'wK';
  board.boardArr[60] = 0;
  board.boardArr[56] = 0;

  isWhiteRightCastleLegal = false;
  isWhiteLeftCastleLegal = false;
}

function blackRightSideCastle() {
  board.boardArr[6] = 'bK';
  board.boardArr[5] = 'bR';
  board.boardArr[4] = 0;
  board.boardArr[7] = 0;

  isBlackRightCastleLegal = false;
  isBlackLeftCastleLegal = false;
}

function blackLeftSideCastle() {
  board.boardArr[2] = 'bK';
  board.boardArr[3] = 'bR';
  board.boardArr[4] = 0;
  board.boardArr[0] = 0;

  isBlackRightCastleLegal = false;
  isBlackLeftCastleLegal = false;
}

function roundToWhole(num) {
  const decimalPart = num % 1;
  if (decimalPart === 0.5 || decimalPart === -0.5) {
    return Math.floor(num);
  }
  return Math.round(num);
}

const getPossibleMoves = (pieceType, currentIndex) => {
  if (!pieceType || pieceType === 0) return [];
  let possibleDestinations = [];

  if (pieceType[1] == 'R') {
    const temp = calcRookMov(currentIndex);
    const top = removeBlockedSquares(temp.topSqrs, pieceType);
    const bottom = removeBlockedSquares(temp.bottomSqrs, pieceType);
    const left = removeBlockedSquares(temp.leftSqrs, pieceType);
    const right = removeBlockedSquares(temp.rightSqrs, pieceType);
    possibleDestinations = [...bottom, ...left, ...right, ...top];

  } else if (pieceType[1] == 'N') {
    possibleDestinations = calcKnightMov(currentIndex, pieceType);

  } else if (pieceType[1] == 'K') {
    let tempDestinations = calcKingMov(currentIndex, pieceType);
    if (pieceType[0] == 'b') {
      tempDestinations = tempDestinations.filter(sqr => !(whiteDangerSqrs && whiteDangerSqrs.includes(sqr)));
    } else {
      tempDestinations = tempDestinations.filter(sqr => !(blackDangerSqrs && blackDangerSqrs.includes(sqr)));
    }
    possibleDestinations = tempDestinations;

  } else if (pieceType[1] == 'B') {
    const temp = calcBishopMov(currentIndex);
    const tr = removeBlockedSquares(temp.trSqrs, pieceType);
    const tl = removeBlockedSquares(temp.tlSqrs, pieceType);
    const br = removeBlockedSquares(temp.brSqrs, pieceType);
    const bl = removeBlockedSquares(temp.blSqrs, pieceType);
    possibleDestinations = [...tr, ...tl, ...br, ...bl];

  } else if (pieceType[1] == 'Q') {
    const straight = calcRookMov(currentIndex);
    const diagonal = calcBishopMov(currentIndex);
    const top = removeBlockedSquares(straight.topSqrs, pieceType);
    const bottom = removeBlockedSquares(straight.bottomSqrs, pieceType);
    const left = removeBlockedSquares(straight.leftSqrs, pieceType);
    const right = removeBlockedSquares(straight.rightSqrs, pieceType);
    const tr = removeBlockedSquares(diagonal.trSqrs, pieceType);
    const tl = removeBlockedSquares(diagonal.tlSqrs, pieceType);
    const br = removeBlockedSquares(diagonal.brSqrs, pieceType);
    const bl = removeBlockedSquares(diagonal.blSqrs, pieceType);

    possibleDestinations = [...bottom, ...left, ...right, ...top, ...tr, ...tl, ...br, ...bl];

  } else if (pieceType[1] == 'P') {
    possibleDestinations = [...calcPawnMov(currentIndex, pieceType[0]), ...calcPawnCaptureIfThereIsAPiece(currentIndex, pieceType[0])];
  }

  return possibleDestinations;
}

const highlight = (squares) => {
  if (typeof ctx === 'undefined' || !ctx || !Array.isArray(squares)) return;
  const scale = getScale();
  squares.forEach(index => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const x = col * scale;
    const y = row * scale;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(x, y, scale, scale);
  });
}

// i: board index from the boardArr property in board class
function getSqre(i) {
  const scale = getScale();
  const row = Math.floor(i / 8);
  const col = i % 8;
  const x = col * scale;
  const y = row * scale;

  return {
    row: row,
    col: col,
    x: x,
    y: y
  };
}

// the exact opposite of getSqre(), takes x and y as arguments
// and returns the corresponding boardIndex
function getBoardIndex(x, y) {
  const scale = getScale();
  const row = Math.floor(y / scale);
  const col = Math.floor(x / scale);
  const i = row * 8 + col;
  if (i < 0 || i >= 64) return -1;
  return i;
}


const checkWhiteRightCastleLegality = (prevSqrIndex, draggedPiece) => {
  if ((prevSqrIndex == 63 && draggedPiece == 'wR') || prevSqrIndex == 60 && draggedPiece == 'wK') {
    isWhiteRightCastleLegal = false;
  }
}
const canWhiteCastleRightSide = (prevSqrIndex, draggedPiece, boardIndex) => {
  return ((prevSqrIndex == 60 && draggedPiece == 'wK') &&
      (boardIndex == 63) &&
      (safeSqrAt(62) == 0 && safeSqrAt(61) == 0) &&
      isWhiteRightCastleLegal);
}

const checkWhiteLeftCastleLegality = (prevSqrIndex, draggedPiece) => {
  if ((prevSqrIndex == 56 && draggedPiece == 'wR') || prevSqrIndex == 60 && draggedPiece == 'wK') {
    isWhiteLeftCastleLegal = false;
  }
}
const canWhiteCastleLeftSide = (prevSqrIndex, draggedPiece, boardIndex) => {
  return ((prevSqrIndex == 60 && draggedPiece == 'wK') &&
      (boardIndex == 56) &&
      (safeSqrAt(59) == 0 && safeSqrAt(58) == 0 && safeSqrAt(57) == 0) &&
      isWhiteLeftCastleLegal);
}



const checkBlackRightCastleLegality = (prevSqrIndex, draggedPiece) => {
  if ((prevSqrIndex == 7 && draggedPiece == 'bR') || prevSqrIndex == 4 && draggedPiece == 'bK') {
    isBlackRightCastleLegal = false;
  }
}
const canBlackCastleRightSide = (prevSqrIndex, draggedPiece, boardIndex) => {
  return ((prevSqrIndex == 4 && draggedPiece == 'bK') &&
      (boardIndex == 7) &&
      (safeSqrAt(6) == 0 && safeSqrAt(5) == 0) &&
      isBlackRightCastleLegal);
}

const checkBlackLeftCastleLegality = (prevSqrIndex, draggedPiece) => {
  if ((prevSqrIndex == 0 && draggedPiece == 'bR') || prevSqrIndex == 4 && draggedPiece == 'bK') {
    isBlackLeftCastleLegal = false;
  }
}
const canBlackCastleLeftSide = (prevSqrIndex, draggedPiece, boardIndex) => {
  return ((prevSqrIndex == 4 && draggedPiece == 'bK') &&
      (boardIndex == 0) &&
      (safeSqrAt(1) == 0 && safeSqrAt(2) == 0 && safeSqrAt(3) == 0) &&
      isBlackLeftCastleLegal);
}



const findDangerSqrs = (pieceSide) => {
  if (typeof board === 'undefined' || !board || !board.boardArr) return;
  // reset
  if (pieceSide === 'b') whiteDangerSqrs = [];
  if (pieceSide === 'w') blackDangerSqrs = [];

  board.boardArr.forEach((sqr, i) => {
    if (!sqr || sqr === 0) return;
    if (sqr[0] === pieceSide && sqr[1].toLowerCase() !== 'p') {
      const possibleMoves = getPossibleMoves(sqr, i);
      for (let j = 0; j < possibleMoves.length; j++) {
        if (pieceSide == 'b') {
          whiteDangerSqrs.push(possibleMoves[j]);
        } else {
          blackDangerSqrs.push(possibleMoves[j]);
        }
      }
    } else if (sqr[0] === pieceSide && sqr[1].toLowerCase() == 'p') {
      const possibleCaptures = calcPawnCapture(i, pieceSide);
      for (let k = 0; k < possibleCaptures.length; k++) {
        if (pieceSide == 'b') {
          whiteDangerSqrs.push(possibleCaptures[k]);
        } else {
          blackDangerSqrs.push(possibleCaptures[k]);
        }
      }
    }
  });
}

const findWhiteDangerSqrs = () => { findDangerSqrs('b'); }
const findBlackDangerSqrs = () => { findDangerSqrs('w'); }
