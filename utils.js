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

    // return [...vSqrs, ...hSqrs]
    return {
        topSqrs: vSqrsAbove,
        bottomSqrs: vSqrsBelow,
        leftSqrs: hSqrsLeft,
        rightSqrs: hSqrsRight
    }
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

    // return [...trSqrs, ...brSqrs, ...tlSqrs, ...blSqrs].filter(s => s !== currentIndex) // remove the current square itself from the list
}

function calcKingMov(currentIndex) {
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

    return sqrs;
}

function calcKnightMov(currentIndex) {
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

    return squares;
}

function calcPawnMov(currentIndex, side) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);

    if (side == 'w') {
        if (row > 0) { sqrs.push(currentIndex - 8); } // Check for squares above
    } else {
        if (row < 7) { sqrs.push(currentIndex + 8); } // Check for squares below
    }
    return sqrs
}

function calcPawnMov2Steps(currentIndex, side) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);

    if (row === 6) { // If the pawn is at its initial position
        const oneStepUp = currentIndex - 8;
        const twoStepsUp = currentIndex - 16;

        sqrs.push(oneStepUp);

        // Add the square two steps up if it's within the board
        if (twoStepsUp >= 0) {
            sqrs.push(twoStepsUp);
        }
    }

    return sqrs;
}

function calcPawnCapture(currentIndex, side) {
    const sqrs = [];
    const row = Math.floor(currentIndex / 8);
    const col = currentIndex % 8;

    if (row > 0 && col > 0) { sqrs.push(currentIndex - 9); } // Top-left
    if (row > 0 && col < 7) { sqrs.push(currentIndex - 7); } // Top-right

    return sqrs;
}

function removeBlockedSquares(sideSqrs) {
    // This is checking for piece blockages at all sides of the rooks movement
    for (let i = 0; i < sideSqrs.length; i++) { // side squares
        const index = sideSqrs[i];
        if (board.boardArr[index] !== 0) { // Check if the square is occupied
            sideSqrs.splice(i + 1); // Remove all squares after the occupied square
            break; // Stop checking further
        }
    }
}

const getPossibleMoves = (pieceType, currentIndex) => {
    let possibleDestinations = [];  // Calculate possible destination indices

    if (pieceType[1] == 'R') { // If it's a Rook
        let tempDestinations = calcRookMov(currentIndex);

        removeBlockedSquares(tempDestinations.leftSqrs);
        removeBlockedSquares(tempDestinations.rightSqrs);
        removeBlockedSquares(tempDestinations.topSqrs);
        removeBlockedSquares(tempDestinations.bottomSqrs);
        possibleDestinations = [...tempDestinations.bottomSqrs, ...tempDestinations.leftSqrs, ...tempDestinations.rightSqrs, ...tempDestinations.topSqrs];

    } else if (pieceType[1] == 'N') { // if it's a Knight
        possibleDestinations = [...calcKnightMov(currentIndex)]

    } else if (pieceType[1] == 'K') { // if it's a King
        possibleDestinations = [...calcKingMov(currentIndex)]

    } else if (pieceType[1] == 'B') { // if it's a Bishop
        let tempDestinations = calcBishopMov(currentIndex);

        removeBlockedSquares(tempDestinations.trSqrs);
        removeBlockedSquares(tempDestinations.tlSqrs);
        removeBlockedSquares(tempDestinations.brSqrs);
        removeBlockedSquares(tempDestinations.blSqrs);

        possibleDestinations = [...tempDestinations.trSqrs, ...tempDestinations.tlSqrs, ...tempDestinations.brSqrs, ...tempDestinations.blSqrs];

    } else if (pieceType[1] == 'Q') { // if it's a Queen
        let tempStraightDestinations = calcRookMov(currentIndex);
        let tempDiagonalDestinations = calcBishopMov(currentIndex); 

        removeBlockedSquares(tempStraightDestinations.leftSqrs);
        removeBlockedSquares(tempStraightDestinations.rightSqrs);
        removeBlockedSquares(tempStraightDestinations.topSqrs);
        removeBlockedSquares(tempStraightDestinations.bottomSqrs);  
        
        removeBlockedSquares(tempDiagonalDestinations.trSqrs);
        removeBlockedSquares(tempDiagonalDestinations.tlSqrs);
        removeBlockedSquares(tempDiagonalDestinations.brSqrs);
        removeBlockedSquares(tempDiagonalDestinations.blSqrs);
        
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
        possibleDestinations = [...calcPawnMov(currentIndex, pieceType[0])]
    }

    return possibleDestinations;
}

const highlight = (possibleMoves) => {
    // Loop through possible move indices
    possibleMoves.forEach(index => {
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
    const row = Math.floor(i / 8)
    const col = i % 8
    const x = col * 60
    const y = row * 60

    return {
        row: row,
        col: col,
        x: x,
        y: y
    }
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
