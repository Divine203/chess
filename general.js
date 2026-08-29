let cvs = document.getElementById('board') || document.querySelector('canvas');
let ctx = cvs? cvs.getContext('2d') : null;
let pieces; let board;
const sprite = new Image(); sprite.src = './assets/chess_pieces.png';
let whiteTurn = true, halfMoveCount = 0, fullMoveCount = 1, playStockFishMove = false;
let stockfishRequestQueued = false, stockfishRetryTimer = null;
let isWhiteRightCastleLegal = true, isWhiteLeftCastleLegal = true;
let isBlackRightCastleLegal = true, isBlackLeftCastleLegal = true;
let whiteDangerSqrs = [], blackDangerSqrs = [], isCheck = false;
let playerLost = false, playerWon = false, draw = false;
const sqreScale = 60;
const boardScale = 480;

const update = () => {
    if(!ctx ||!board ||!pieces) return;
    ctx.clearRect(0,0,cvs.width,cvs.height);
    board.boardArr.forEach((sqr,i)=>{
        if(sqr!==0){
            const sq = typeof getSqre==='function'? getSqre(i) : {x:(i%8)*sqreScale, y:Math.floor(i/8)*sqreScale};
            pieces.drawPiece(pieces.type[sqr],[{x:sq.x, y:sq.y}]);
        }
    });
};

const requestStockfishMove = () => {
    if(typeof stockfishAi==='undefined'||!stockfishAi||!board||whiteTurn) return;
    if(typeof fcGameOver==='function'&&fcGameOver()) return;
    if(stockfishRetryTimer){clearTimeout(stockfishRetryTimer);stockfishRetryTimer=null;}
    if(stockfishAi.busy){stockfishRequestQueued=true;return;}
    stockfishRequestQueued=false; playStockFishMove=true;
    stockfishAi.playStockfishMove().then(played=>{
        if(!played &&!whiteTurn){
            playStockFishMove=false;
            stockfishRetryTimer=setTimeout(()=>{stockfishRetryTimer=null;requestStockfishMove();},250);
            return;
        }
        if(stockfishRequestQueued &&!whiteTurn &&!stockfishAi.busy){
            stockfishRequestQueued=false; setTimeout(requestStockfishMove,0);
        }
    }).catch(e=>{
        playStockFishMove=false;
        if(!whiteTurn) stockfishRetryTimer=setTimeout(()=>{stockfishRetryTimer=null;requestStockfishMove();},250);
    });
};

function ensureCanvas(){
    if(!cvs) cvs = document.getElementById('board') || document.querySelector('canvas');
    if(cvs &&!ctx) ctx = cvs.getContext('2d');
    if(cvs){ cvs.width = boardScale; cvs.height = boardScale; }
}
document.addEventListener('DOMContentLoaded', ensureCanvas);
ensureCanvas();
const promptUser=()=>{};
