/* FREECHESS - MOBILE TAP - FIXED */
let mobileSelectedIndex = null;
function mobileIndexToSquare(i){return 'abcdefgh'[i%8]+(8-Math.floor(i/8));}
function mobileIndexFromClientPoint(cx,cy){
    if(!cvs) return -1;
    const rect=cvs.getBoundingClientRect();
    const x=(cx-rect.left)*(cvs.width/rect.width); const y=(cy-rect.top)*(cvs.height/rect.height);
    const col=Math.floor(x/sqreScale), row=Math.floor(y/sqreScale);
    if(row<0||row>7||col<0||col>7) return -1; return row*8+col;
}
function mobileLegalDestinations(i){
    if(!fcRules||i<0) return [];
    try{return fcRules.moves({square:mobileIndexToSquare(i),verbose:true}).map(m=>(8-Number(m.to[1]))*8+(m.to.charCodeAt(0)-97));}catch{return[];}
}
function mobileRedrawSelection(){
    update(); drawBoard(); if(mobileSelectedIndex===null) return;
    const legal=mobileLegalDestinations(mobileSelectedIndex);
    for(const idx of legal){const r=Math.floor(idx/8),c=idx%8; ctx.fillStyle='rgba(0,170,255,.32)'; ctx.fillRect(c*sqreScale,r*sqreScale,sqreScale,sqreScale);}
    const r=Math.floor(mobileSelectedIndex/8),c=mobileSelectedIndex%8; ctx.strokeStyle='rgba(255,215,0,.95)'; ctx.lineWidth=4; ctx.strokeRect(c*sqreScale+2,r*sqreScale+2,sqreScale-4,sqreScale-4);
}
function mobileClearSelection(){mobileSelectedIndex=null; update(); drawBoard();}
function mobileTryMove(from,to){
    if(from===null||to===null||!fcRules||!whiteTurn) return false;
    if(!mobileLegalDestinations(from).includes(to)) return false;
    const piece=board.boardArr[from], target=board.boardArr[to];
    const wasCapture=target!==0&&target[0]==='b', wasCastle=piece==='wK'&&Math.abs(to-from)===2;
    let moved=false; try{moved=fcPlayerMove(mobileIndexToSquare(from),mobileIndexToSquare(to),'q');}catch{return false;}
    if(!moved) return false; mobileSelectedIndex=null;
    if(wasCastle) audio.playAudio(audio.sound.castle); else if(wasCapture) audio.playAudio(audio.sound.capture); else audio.playAudio(audio.sound.move);
    update(); drawBoard(); if(!whiteTurn) setTimeout(requestStockfishMove,0); return true;
}
function mobileHandleClick(e){
    if(!whiteTurn||(typeof fcGameOver==='function'&&fcGameOver())){mobileClearSelection(); return;}
    if(isDown) return;
    const idx=mobileIndexFromClientPoint(e.clientX,e.clientY); if(idx<0) return;
    const piece=board.boardArr[idx];
    if(mobileSelectedIndex===null){ if(piece&&piece[0]==='w'){mobileSelectedIndex=idx; mobileRedrawSelection();} return; }
    if(piece&&piece[0]==='w'){mobileSelectedIndex=idx; mobileRedrawSelection(); return;}
    if(!mobileTryMove(mobileSelectedIndex,idx)){mobileRedrawSelection();}
}
function setupMobileControls(){ if(!cvs){setTimeout(setupMobileControls,100); return;} cvs.addEventListener('click', mobileHandleClick); }
setupMobileControls();
