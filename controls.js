// controls
const stockfishAi = new Stockfish();

let isDrag = false;
let isDown = false;
let isUp = true;


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
            halfMoveCount--;
            fullMoveCount = roundToWhole(halfMoveCount / 2);
            playStockFishMove = false;
        }

        function resetMovement() {
            draggedPiece = null;
            possibleSqres = [];
        }
        // --------------------------- //

        whiteDangerSqrs = []; // reset danger squares
        blackDangerSqrs = []; // reset danger squares

        // check for castling movement and if it is, allow castling
        if (canWhiteCastleRightSide(prevSqrIndex, draggedPiece, boardIndex)) {
            isCastle = true;
            whiteRightSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
            playStockFishMove = true;
            audio.playAudio(audio.sound.move);
        }
        if (canWhiteCastleLeftSide(prevSqrIndex, draggedPiece, boardIndex)) {
            isCastle = true;
            whiteLeftSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
            playStockFishMove = true;
            audio.playAudio(audio.sound.move);
        }
        if (canBlackCastleRightSide(prevSqrIndex, draggedPiece, boardIndex)) {
            isCastle = true;
            blackRightSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
            playStockFishMove = false;
            audio.playAudio(audio.sound.move);
        }
        if (canBlackCastleLeftSide(prevSqrIndex, draggedPiece, boardIndex)) {
            isCastle = true;
            blackLeftSideCastle();
            resetMovement();
            whiteTurn = !whiteTurn;
            playStockFishMove = false;
            audio.playAudio(audio.sound.move);
        }
        // -------------------------------------------------------- //

        // once we release our piece we want to get its new location and chage it
        // update the boardArr data and update the game
        else if (draggedPiece !== null && possibleSqres.length > 0) {
            let isCapture = board.boardArr[boardIndex] == 0 ? false : true;
            for (let i = 0; i < possibleSqres.length; i++) {
                if (boardIndex == possibleSqres[i]) {
                    capturedPiece = board.boardArr[boardIndex] !== 0 ? board.boardArr[boardIndex] : 0; // if we captured a piece
                    board.boardArr[boardIndex] = draggedPiece;
                    board.boardArr[prevSqrIndex] = 0;
             
                    whiteTurn = !whiteTurn; // switch turns
                    halfMoveCount++;
                    fullMoveCount = roundToWhole(halfMoveCount / 2);


                    if (whiteTurn == false) playStockFishMove = true;
                    else playStockFishMove = false;

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
                         // find out if the move the human made is a check
                        if(getPossibleMoves(draggedPiece, boardIndex).includes(board.boardArr.indexOf('bK'))) {
                            if(isCheck == false) isCheck = true;
                        } else {
                            isCheck = false;
                        }
                        //
                        if (whiteDangerSqrs.includes(board.boardArr.indexOf('wK'))) { // if the current square of the wK is among the danger squares
                            reverseMovement(); // reverse the movement until they have resolved the check
                        }
                    } else {
                        playStockFishMove = false;
                        if (blackDangerSqrs.includes(board.boardArr.indexOf('bK'))) { // if the current square of the bK is among the danger squares
                            reverseMovement(); // reverse the movement until they have resolved the check
                        }
                    }

                    // play the right audios
                    if(isCheck == false) {
                        if (isCapture) audio.playAudio(audio.sound.capture);
                        else audio.playAudio(audio.sound.move);
                    } else {
                        audio.playAudio(audio.sound.check);
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


