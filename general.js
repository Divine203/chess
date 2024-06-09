const cvs = document.querySelector('canvas');
const ctx = cvs.getContext('2d');

let pieces;
let board;

const sprite = new Image();
sprite.src = './assets/chess_pieces.png';

const pawnsThatHaveMovedPastOnce = []; // [boardIndex...];
let whiteDangerSqrs = [];
let blackDangerSqrs = [];

let isWhiteRightCastleLegal = true;
let isWhiteLeftCastleLegal = true;
let isBlackRightCastleLegal = true;
let isBlackLeftCastleLegal = true;

let whiteTurn = true; // change this to decide who starts first (false = black, true = white)

let halfMoveCount = 0;
let fullMoveCount = 1;

let playStockFishMove = false;

let isCheck = false;

let playerLost = false;
let playerWon = false;
let draw = false;

// update() basically runs through the board array data in the board class
// checks if their any 'non 0' values if there are, that means those squares arent empty
// so it uses the getSqre function to get the square's details (co ordinates in px) and then draws the piece on that square
// using the drawPiece method from the Pieces class 

const update = () => {
    board.boardArr.forEach((sqr, i) => {
        if (sqr !== 0) {
            let square = getSqre(i);
            pieces.drawPiece(pieces.type[sqr], [{ x: square.x, y: square.y }]);
            ctx.fillStyle = 'black';
        }
    })

    if(whiteTurn == false) {
        if(playStockFishMove) {
            stockfishAi.playStockfishMove();
            playStockFishMove = false;
        }
    }
}

const promptUser = (message) => {
    setTimeout(() => {
        audio.playAudio(audio.sound.notify);
        if (window.confirm(message)) {
            window.location.reload(); // Refresh the page
        }  
    }, 1000);
}
