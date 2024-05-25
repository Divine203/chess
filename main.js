const sqreScale = 60
const boardScale = 8 * sqreScale

const boardCont = document.querySelector('.board-cont')

cvs.width = boardScale
cvs.height = boardScale

const drawBoard = () => {
    for (let row = 0; row < boardScale; row += sqreScale) {
        for (let col = 0; col < boardScale; col += sqreScale) {
            const newSqr = document.createElement('div')
            newSqr.style.backgroundColor = (row + col) % 120 === 0 ? '#e3c16f' : '#b88b4a';
            newSqr.style.left = `${col}px`
            newSqr.style.top = `${row}px`
            newSqr.style.width = `${sqreScale}px`
            newSqr.style.height = `${sqreScale}px`
            boardCont.appendChild(newSqr)
        }
    }
}

// update() basically runs through the board array data in the board class
// checks if their any 'non 0' values if there are, that means those squares arent empty
// so it uses the getSqre function to get the square's details (co ordinates in px) and then draws the piece on that square
// using the drawPiece method from the Pieces class 
const update = () => {
    board.boardArr.forEach((sqr, i) => {
        if (sqr !== 0) {
            let square = getSqre(i)
            pieces.drawPiece(pieces.type[sqr], [{ x: square.x, y: square.y }])
        }
    })
}



