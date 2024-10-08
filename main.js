const sqreScale = 60;
const boardScale = 8 * sqreScale;

const boardCont = document.querySelector('.board-cont');

cvs.width = boardScale;
cvs.height = boardScale;

const drawBoard = () => {
    for (let row = 0; row < boardScale; row += sqreScale) {
        for (let col = 0; col < boardScale; col += sqreScale) {
            const newSqr = document.createElement('div');
            newSqr.style.backgroundColor = (row + col) % 120 === 0 ? '#d3dee5' : '#7599b1';
            newSqr.style.left = `${col}px`;
            newSqr.style.top = `${row}px`;
            newSqr.style.width = `${sqreScale}px`;
            newSqr.style.height = `${sqreScale}px`;
            boardCont.appendChild(newSqr);
        }
    }
}



