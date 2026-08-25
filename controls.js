// Desktop + Touch drag controls - FIXED
let stockfishAi;
try{ stockfishAi = new Stockfish(); }catch(e){}
let isDown = false; let draggedPiece = null; let prevSqrIndex = null; let possibleSqres = [];

function desktopBoardIndex(e){
    if(!cvs) return -1;
    const rect=cvs.getBoundingClientRect();
    const cx=e.clientX?? e.touches?.[0]?.clientX;
    const cy=e.clientY?? e.touches?.[0]?.clientY;
    if(cx==null) return -1;
    return getBoardIndex((cx-rect.left)*(cvs.width/rect.width),(cy-rect.top)*(cvs.height/rect.height));
}
function indexToSquare(i){return 'abcdefgh'[i%8]+(8-Math.floor(i/8));}
function legalDestinationIndexes(i){
    if(!fcRules) return [];
    try{return fcRules.moves({square:indexToSquare(i),verbose:true}).map(m=>(8-Number(m.to[1]))*8+(m.to.charCodeAt(0)-97));}catch{return[];}
}
function desktopResetDrag(){isDown=false;draggedPiece=null;prevSqrIndex=null;possibleSqres=[];}

sprite.onload=()=>{
    if(typeof fcEnsureRules==='function') fcEnsureRules();
    update(); drawBoard();
    const target=cvs; if(!target) return;
    target.addEventListener('pointerdown', e=>{
        if(!whiteTurn||(typeof fcGameOver==='function'&&fcGameOver())) return;
        const index=desktopBoardIndex(e); if(index<0) return;
        const piece=board.boardArr[index]; if(!piece||piece[0]!=='w') return;
        isDown=true; prevSqrIndex=index; draggedPiece=piece;
        possibleSqres=legalDestinationIndexes(index);
        if(typeof highlight==='function') highlight(possibleSqres);
        update(); drawBoard();
        try{ target.setPointerCapture(e.pointerId); }catch{}
    });
    target.addEventListener('pointermove', e=>{
        if(!isDown||!draggedPiece) return;
        const rect=cvs.getBoundingClientRect();
        const cx=e.clientX?? e.touches?.[0]?.clientX; const cy=e.clientY?? e.touches?.[0]?.clientY;
        const x=(cx-rect.left)*(cvs.width/rect.width); const y=(cy-rect.top)*(cvs.height/rect.height);
        update(); pieces.drawPiece(pieces.type[draggedPiece],[{x:x-pieces.pieceScale/2,y:y-pieces.pieceScale/2}]);
    });
    target.addEventListener('pointerup', e=>{
        if(!isDown||!draggedPiece) return;
        const from=prevSqrIndex; const to=desktopBoardIndex(e);
        const piece=draggedPiece; const old=board.boardArr[to];
        const wasCapture=old!==0&&old[0]==='b';
        const moved=to>=0 && possibleSqres.includes(to)&&fcPlayerMove(indexToSquare(from),indexToSquare(to),'q');
        desktopResetDrag();
        if(moved){
            if(piece[1]==='K'&&Math.abs(to-from)===2) audio.playAudio(audio.sound.castle);
            else if(wasCapture) audio.playAudio(audio.sound.capture);
            else audio.playAudio(audio.sound.move);
            update(); drawBoard();
            if(!whiteTurn) requestStockfishMove();
        }else{ update(); drawBoard(); }
    });
    target.addEventListener('pointercancel', ()=>{desktopResetDrag(); update(); drawBoard();});
};
