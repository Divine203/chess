// controls

let isDrag = false;
let isDown = false;
let isUp = true;

let whiteTurn = true; // change this to decide who starts first (false = black, true = white)
let possibleSqres = [];
let prevSqrIndex = null;
let draggedPiece = null;
let capturedPiece = 0; // it's 0 not null cause it will be applied to board.boardArr

let isStoreSqr = true;


sprite.onload = () => {
    board.init();
    update();
    drawBoard();

    document.addEventListener('mousedown', (e) => {
        isDown = true;
        isUp = false;

        let mouseX = e.clientX - cvs.getBoundingClientRect().left;
        let mouseY = e.clientY - cvs.getBoundingClientRect().top;

        let boardIndex = getBoardIndex(mouseX, mouseY);
        // if we click on a square and its not empty,
        // we want to remove the piece from the board
        // and store it in the draggedPiece variable

        board.boardArr.forEach((sqr, i) => {
            if (sqr !== 0 && i == boardIndex) {

                // but we first need to check whose turn is it first
                // we use the whiteTurn variable and check if it corresponds with the first letter of the piece 

                if ((whiteTurn && sqr.startsWith('w')) || (whiteTurn == false && sqr.startsWith('b'))) {
                    board.boardArr[i] = 0;
                    draggedPiece = sqr;
                    prevSqrIndex = i;// store prev square index of piece

                    isStoreSqr = false;
                    possibleSqres = getPossibleMoves(sqr, i); // store all possible squares to move

                    highlight(possibleSqres); // highlight squares

                }
            }
        })
        update()
        drawBoard()
    })

    document.addEventListener('mousemove', (e) => {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        update();

        let mouseX = e.clientX - cvs.getBoundingClientRect().left;
        let mouseY = e.clientY - cvs.getBoundingClientRect().top;

        // if were dragging a piece, i.e draggedPiece !== null 
        // we want to draw a 'fake' piece of the same type to follow the mouse

        if (isDown) {
            if (draggedPiece !== null) {
                pieces.drawPiece(pieces.type[draggedPiece], [{ x: mouseX - pieces.pieceScale / 2, y: mouseY - pieces.pieceScale / 2 }]);
            }
        }
    })

    document.addEventListener('mouseup', (e) => {
        isDown = false;
        isUp = true;

        let mouseX = e.clientX - cvs.getBoundingClientRect().left;
        let mouseY = e.clientY - cvs.getBoundingClientRect().top;

        let boardIndex = getBoardIndex(mouseX, mouseY);

        // ---- utility functions ----- //
        function reverseMovement() {
            board.boardArr[prevSqrIndex] = draggedPiece;
            board.boardArr[boardIndex] = capturedPiece;
            whiteTurn = draggedPiece[0] == 'w' ? true : false; // change the turn to the person that made the reversed move
        }

        function resetMovement() {
            draggedPiece = null;
            possibleSqres = [];
        }
        // --------------------------- //

        whiteDangerSqrs = []; // reset danger squares
        blackDangerSqrs = []; // reset danger squares

        // check for castling movement and if it is allow castling
        if (canWhiteCastleRightSide(prevSqrIndex, draggedPiece, boardIndex)) {
            whiteRightSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
        }
        if (canWhiteCastleLeftSide(prevSqrIndex, draggedPiece, boardIndex)) {
            whiteLeftSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
        }
        if (canBlackCastleRightSide(prevSqrIndex, draggedPiece, boardIndex)) {
            blackRightSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
        }
        if (canBlackCastleLeftSide(prevSqrIndex, draggedPiece, boardIndex)) {
            blackLeftSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
        }
        // -------------------------------------------------------- //

        // once we release our piece we want to get its new location and chage it
        // update the boardArr data and update the game
        else if (draggedPiece !== null && possibleSqres.length > 0) {
            for (let i = 0; i < possibleSqres.length; i++) {
                if (boardIndex == possibleSqres[i]) {
                    capturedPiece = board.boardArr[boardIndex] !== 0 ? board.boardArr[boardIndex] : 0; // if we captured a piece

                    board.boardArr[boardIndex] = draggedPiece;
                    board.boardArr[prevSqrIndex] = 0;
                    whiteTurn = !whiteTurn; // switch turns
                    if (board.boardArr[boardIndex][1] == 'P') { // if it's a pawn
                        pawnsThatHaveMovedPastOnce.push(boardIndex); // add it to the list of pawns moved more than once
                    }
                    // check for castling legality with every king or rook movement!
                    checkWhiteRightCastleLegality(prevSqrIndex, draggedPiece);
                    checkWhiteLeftCastleLegality(prevSqrIndex, draggedPiece);
                    checkBlackRightCastleLegality(prevSqrIndex, draggedPiece);
                    checkBlackLeftCastleLegality(prevSqrIndex, draggedPiece);

                    // check if the king is on check
                    findWhiteDangerSqrs();
                    findBlackDangerSqrs();
                    if (whiteTurn == false) {
                        if (whiteDangerSqrs.includes(board.boardArr.indexOf('wK'))) { // if the current square of the wK is among the danger squares
                            reverseMovement(); // reverse the movement until they have resolved the check
                        }
                    } else {
                        if (blackDangerSqrs.includes(board.boardArr.indexOf('bK'))) { // if the current square of the bK is among the danger squares
                            reverseMovement(); // reverse the movement until they have resolved the check
                        }
                    }

                }
            }
            // if the square were trying to move to isnt part of the possibleMoves
            // we move back to the prev square
            if (!possibleSqres.includes(boardIndex)) {
                board.boardArr[prevSqrIndex] = draggedPiece;
            }
            resetMovement();
        } else if (draggedPiece !== null && possibleSqres.length <= 0) { // if there are no squares to move to
            board.boardArr[prevSqrIndex] = draggedPiece;
            resetMovement();
        }
        update();
    })
}


