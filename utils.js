// Utility functions we'll use in main file
function calcRookMov(currentIndex) {
    let vSqrsAbove = [];
    let vSqrsBelow = [];
    let hSqrsLeft = [];
    let hSqrsRight = [];

    // Vertical Squares
    for (let i = currentIndex - 8; i >= 0; i -= 8) { vSqrsAbove.push(i); } // vert squares above
    for (let i = currentIndex + 8; i < 64; i += 8) { vSqrsBelow.push(i); } // vert squares below

    // Horizontal Squares
    const rowStart = Math.floor(currentIndex / 8) * 8;
    const rowEnd = rowStart + 7;
    for (let i = currentIndex - 1; i >= rowStart; i--) { hSqrsLeft.push(i); } // Hor squares to the left
    for (let i = currentIndex + 1; i <= rowEnd; i++) { hSqrsRight.push(i); } // Hor squares to the right

    return {
        topSqrs: vSqrsAbove,
        bottomSqrs: vSqrsBelow,
        leftSqrs: hSqrsLeft,
        rightSqrs: hSqrsRight
    };
}

function calcBishopMov(currentIndex) {
    let trSqrs = [];  // topRight Squares
    let brSqrs = [];  // bottomRight Squares
    let tlSqrs = [];  // topLeft Squares
    let blSqrs = [];  // bottomLeft Squares

    let [i, j, k, l] = [currentIndex, currentIndex, currentIndex, currentIndex];

    // Squares diagonal to the top right
    while (i >= 0 && i % 8 < 7) {
        trSqrs.push(i);
        i -= 7;
    }
    if (i >= 0 && i % 8 === 7) { trSqrs.push(i); }

    // Squares diagonal to the bottom right 
    while (j < 64 && j % 8 < 7) {
        brSqrs.push(j);
        j += 9;
    }
    // Add the last square if it's within the board
    if (j < 64) { brSqrs.push(j); }

    // Squares diagonal to the top left
    while (k >= 0 && k % 8 > 0) {
        tlSqrs.push(k);
        k -= 9;
    }
    if (k >= 0 && k % 8 === 0) { tlSqrs.push(k); }

    // Squares diagonal to the bottom left
    while (l < 64 && l % 8 > 0) {
        blSqrs.push(l);
        l += 7;
    }
    if (l < 64 && l % 8 === 0) { blSqrs.push(l); }

    return {
        trSqrs: trSqrs.filter(s => s !== currentIndex), // filter is to remove the current square itself
        brSqrs: brSqrs.filter(s => s !== currentIndex),
        tlSqrs: tlSqrs.filter(s => s !== currentIndex),
        blSqrs: blSqrs.filter(s => s !== currentIndex)
    };

}

function calcKingMov(currentIndex, piece) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);
    const col = currentIndex % 8;

    if (row > 0) { sqrs.push(currentIndex - 8); } // Check for squares above
    if (row < 7) { sqrs.push(currentIndex + 8); } // Check for squares below
    if (col > 0) { sqrs.push(currentIndex - 1); } // Check for squares to the left
    if (col < 7) { sqrs.push(currentIndex + 1); } // Check for squares to the right

    // Check for squares diagonally
    if (row > 0 && col > 0) { sqrs.push(currentIndex - 9); } // Top-left
    if (row > 0 && col < 7) { sqrs.push(currentIndex - 7); } // Top-right
    if (row < 7 && col > 0) { sqrs.push(currentIndex + 7); } // Bottom-left
    if (row < 7 && col < 7) { sqrs.push(currentIndex + 9); } // Bottom-right

    return sqrs.filter(index => {
        return board.boardArr[index][0] !== piece[0]; // filter out occupied squares with the same piece color
    });
}

function calcKnightMov(currentIndex, piece) {
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
        return board.boardArr[index][0] !== piece[0]; // filter out occupied squares with the same piece color
    });
}

function calcPawnMov(currentIndex, side) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);

    if (side == 'w') {
        if (row > 0) {  // Check for squares above
            sqrs.push(currentIndex - 8);
            if (!pawnsThatHaveMovedPastOnce.includes(currentIndex)) { // if the pawn is NOT among the list of pawns that have moved more than once
                sqrs.push(currentIndex - 16);
            }
        }
    } else {
        if (row < 7) {  // Check for squares below
            sqrs.push(currentIndex + 8);
            if (!pawnsThatHaveMovedPastOnce.includes(currentIndex)) {
                sqrs.push(currentIndex + 16);
            }
        }
    }
    return sqrs
}

function calcPawnCaptureIfThereIsAPiece(currentIndex, side) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);
    const col = currentIndex % 8;

    if (row > 0 && col > 0) { // Top-left
        let topleft = side == 'w' ? currentIndex - 9 : currentIndex + 9; // check for white or black
        if (board.boardArr[topleft] !== 0 && board.boardArr[topleft][0].toLowerCase() !== side.toLowerCase()) {
            sqrs.push(topleft);
        }
    }
    if (row > 0 && col < 7) {
        let topRight = side == 'w' ? currentIndex - 7 : currentIndex + 7;
        if (board.boardArr[topRight] !== 0 && board.boardArr[topRight][0].toLowerCase() !== side.toLowerCase()) {
            sqrs.push(topRight);
        }
    } // Top-right

    return sqrs;
}

function calcPawnCapture(currentIndex, side) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);
    const col = currentIndex % 8;

    if (row > 0 && col > 0) { // Top-left
        let topleft = side == 'w' ? currentIndex - 9 : currentIndex + 9; // check for white or black
        sqrs.push(topleft);
    }
    if (row > 0 && col < 7) {
        let topRight = side == 'w' ? currentIndex - 7 : currentIndex + 7;
        sqrs.push(topRight);
    } // Top-right

    return sqrs;
}

function removeBlockedSquares(sideSqrs, piece, currentIndex) {
    // This is checking for piece blockages at all sides of the rooks/bishop movement

    for (let i = 0; i < sideSqrs.length; i++) { // side squares
        const index = sideSqrs[i];
        if (board.boardArr[index] !== 0) { // Check if the square is occupied 
            sideSqrs.splice(i + 1); // Remove all squares after the occupied square
            if (board.boardArr[index][0] == piece[0] && i !== currentIndex) { // if the piece on the occupied square is the same type as the piece and is not the piece itself
                sideSqrs.splice(i);
            }
            break; // Stop checking further
        }
    }
}

function whiteRightSideCastle() {
    board.boardArr[61] = 'wR';
    board.boardArr[62] = 'wK';
    board.boardArr[60] = 0;
    board.boardArr[63] = 0;
}

function whiteLeftSideCastle() {
    board.boardArr[59] = 'wR';
    board.boardArr[58] = 'wK';
    board.boardArr[60] = 0;
    board.boardArr[56] = 0;
}

function blackRightSideCastle() {
    board.boardArr[6] = 'bK';
    board.boardArr[5] = 'bR';
    board.boardArr[4] = 0;
    board.boardArr[7] = 0;
}

function blackLeftSideCastle() {
    board.boardArr[2] = 'bK';
    board.boardArr[3] = 'bR';
    board.boardArr[4] = 0;
    board.boardArr[0] = 0;
}



const getPossibleMoves = (pieceType, currentIndex) => {
    let possibleDestinations = [];  // Calculate possible destination indices

    if (pieceType[1] == 'R') { // If it's a Rook
        let tempDestinations = calcRookMov(currentIndex);

        removeBlockedSquares(tempDestinations.leftSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDestinations.rightSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDestinations.topSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDestinations.bottomSqrs, pieceType, currentIndex);
        possibleDestinations = [...tempDestinations.bottomSqrs, ...tempDestinations.leftSqrs, ...tempDestinations.rightSqrs, ...tempDestinations.topSqrs];

    } else if (pieceType[1] == 'N') { // if it's a Knight
        let tempDestinations = calcKnightMov(currentIndex, pieceType);

        possibleDestinations = [...tempDestinations];

    } else if (pieceType[1] == 'K') { // if it's a King
        let tempDestinations = [...calcKingMov(currentIndex, pieceType)];

        // we need to check if the any of the squares we can move the king to is on check (danger). If so, we remove
        // them from the list of possible destinations
        if (pieceType[0] == 'b') {
            tempDestinations = tempDestinations.filter(sqr => !blackDangerSqrs.includes(sqr));
        } else {
            tempDestinations = tempDestinations.filter(sqr => !whiteDangerSqrs.includes(sqr));
        }
        possibleDestinations = tempDestinations;
    } else if (pieceType[1] == 'B') { // if it's a Bishop
        let tempDestinations = calcBishopMov(currentIndex);

        removeBlockedSquares(tempDestinations.trSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDestinations.tlSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDestinations.brSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDestinations.blSqrs, pieceType, currentIndex);

        possibleDestinations = [...tempDestinations.trSqrs, ...tempDestinations.tlSqrs, ...tempDestinations.brSqrs, ...tempDestinations.blSqrs];

    } else if (pieceType[1] == 'Q') { // if it's a Queen (rook and bishop combo)
        let tempStraightDestinations = calcRookMov(currentIndex);
        let tempDiagonalDestinations = calcBishopMov(currentIndex);

        removeBlockedSquares(tempStraightDestinations.leftSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempStraightDestinations.rightSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempStraightDestinations.topSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempStraightDestinations.bottomSqrs, pieceType, currentIndex);

        removeBlockedSquares(tempDiagonalDestinations.trSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDiagonalDestinations.tlSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDiagonalDestinations.brSqrs, pieceType, currentIndex);
        removeBlockedSquares(tempDiagonalDestinations.blSqrs, pieceType, currentIndex);

        possibleDestinations = [
            ...tempStraightDestinations.bottomSqrs,
            ...tempStraightDestinations.leftSqrs,
            ...tempStraightDestinations.rightSqrs,
            ...tempStraightDestinations.topSqrs,

            ...tempDiagonalDestinations.trSqrs,
            ...tempDiagonalDestinations.tlSqrs,
            ...tempDiagonalDestinations.brSqrs,
            ...tempDiagonalDestinations.blSqrs
        ];

    } else if (pieceType[1] == 'P') { // if it's a Pawn
        possibleDestinations = [...calcPawnMov(currentIndex, pieceType[0]), ...calcPawnCaptureIfThereIsAPiece(currentIndex, pieceType[0])];
    }

    return possibleDestinations;
}

const highlight = (squares) => {
    // Loop through possible move indices
    squares.forEach(index => {
        // Calculate row and column numbers based on index
        const row = Math.floor(index / 8);
        const col = index % 8;

        // Calculate x and y coordinates of the square
        const x = col * 60; // Assuming each square is 60px wide
        const y = row * 60; // Assuming each square is 60px high

        // Draw a half-transparent red square
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(x, y, 60, 60); // Assuming each square is 60px by 60px
    });
}


// i: board index from the boardArr property in board class
function getSqre(i) {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const x = col * 60;
    const y = row * 60;

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
    // Calculate row and column numbers based on pixel coordinates
    const row = Math.floor(y / 60); // Assuming each square is 60px high
    const col = Math.floor(x / 60); // Assuming each square is 60px wide

    // Calculate board index
    const i = row * 8 + col;

    // Return the board index
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
        (board.boardArr[62] == 0 && board.boardArr[61] == 0) &&
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
        (board.boardArr[59] == 0 && board.boardArr[58] == 0 && board.boardArr[57] == 0) &&
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
        (board.boardArr[6] == 0 && board.boardArr[5] == 0) &&
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
        (board.boardArr[1] == 0 && board.boardArr[2] == 0 && board.boardArr[3] == 0) &&
        isBlackLeftCastleLegal);
}



const findDangerSqrs = (pieceSide) => {
    board.boardArr.forEach((sqr, i) => {
        if (sqr[0] == pieceSide && sqr[1].toLowerCase() !== 'p') {
            let possibleMoves = getPossibleMoves(sqr, i);
            for (let j = 0; j < possibleMoves.length; j++) {
                if (pieceSide == 'b') {
                    whiteDangerSqrs.push(possibleMoves[j]);
                } else {
                    blackDangerSqrs.push(possibleMoves[j]);
                }
            }
        } else if (sqr[0] == pieceSide && sqr[1].toLowerCase() == 'p') {
            let possibleCaptures = calcPawnCapture(i, pieceSide);
            for (let k = 0; k < possibleCaptures.length; k++) {
                if (pieceSide == 'b') {
                    whiteDangerSqrs.push(possibleCaptures[k]);
                } else {
                    blackDangerSqrs.push(possibleCaptures[k]);
                }
            }
        }
    })
}

const findWhiteDangerSqrs = () => {
    findDangerSqrs('b') // pass in the oponnets side
}

const findBlackDangerSqrs = () => {
    findDangerSqrs('w') // pass in the oponnets side
}