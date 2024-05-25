// controls

let isDrag = false
let isDown = false
let isUp = true

let whiteTurn = false
let possibleSqres = []
let prevSqrIndex = null
let draggedPiece = null

let isStoreSqr = true


sprite.onload = () => {
    board.init()
    update()
    drawBoard()

    document.addEventListener('mousedown', (e) => {
        isDown = true
        isUp = false

        let mouseX = e.clientX - cvs.getBoundingClientRect().left;
        let mouseY = e.clientY - cvs.getBoundingClientRect().top;

        let boardIndex = getBoardIndex(mouseX, mouseY)

        // if we click on a square and its not empty,
        // we want to remove the piece from the board
        // and store it in the draggedPiece variable

        board.boardArr.forEach((sqr, i) => {
            if (sqr !== 0 && i == boardIndex) {

                // but we first need to check whose turn is it first
                // we use the whiteTurn variable and check if it corresponds with the first letter of the piece 

                if ((whiteTurn && sqr.startsWith('w')) || (whiteTurn == false && sqr.startsWith('b'))) {
                    board.boardArr[i] = 0
                    draggedPiece = sqr

                    prevSqrIndex = i// store prev square index of piece

                    isStoreSqr = false

                    possibleSqres = getPossibleMoves(sqr, i) // store all possible squares to move
                    highlight(possibleSqres) // highlight squares

                }
            }
        })


        update()
        drawBoard()
    })

    document.addEventListener('mousemove', (e) => {
        ctx.clearRect(0, 0, cvs.width, cvs.height)
        update()

        let mouseX = e.clientX - cvs.getBoundingClientRect().left;
        let mouseY = e.clientY - cvs.getBoundingClientRect().top;

        // if were dragging a piece, i.e draggedPiece !== null 
        // we want to draw a 'fake' piece of the same type to follow the mouse

        if (isDown) {
            if (draggedPiece !== null) {
                pieces.drawPiece(pieces.type[draggedPiece], [{ x: mouseX - pieces.pieceScale / 2, y: mouseY - pieces.pieceScale / 2 }])
            }
        }
    })

    document.addEventListener('mouseup', (e) => {
        isDown = false
        isUp = true

        let mouseX = e.clientX - cvs.getBoundingClientRect().left;
        let mouseY = e.clientY - cvs.getBoundingClientRect().top;

        // once we release our piece we want to get its new location and chage it
        // update the boardArr data and update the game
        if (draggedPiece !== null && possibleSqres.length > 0) {
            let boardIndex = getBoardIndex(mouseX, mouseY)
            for (let i = 0; i < possibleSqres.length; i++) {
                if (boardIndex == possibleSqres[i]) {
                    board.boardArr[boardIndex] = draggedPiece
                    board.boardArr[prevSqrIndex] = 0
                    whiteTurn = !whiteTurn // switch turns
                }
            }
            // if the square were trying to move to isnt part of the possibleMoves
            // we move back to the prev square
            if (!possibleSqres.includes(boardIndex)) {
                board.boardArr[prevSqrIndex] = draggedPiece
            }
            draggedPiece = null
            possibleSqres = []
        }
        update()
    })
}