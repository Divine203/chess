(() => {
    // Minimal auto-start wrapper: no start or result UI elements are created.
    // This file ensures the game initializes automatically and does not inject any overlays.

    function startGameAuto(){
        try{
            if(typeof fcResetRules==='function') fcResetRules();
            else if(typeof fcCreateRules==='function') fcCreateRules();
            else if(typeof board!=='undefined' && board && typeof board.init==='function') board.init();
        }catch(err){ console.error('startGameAuto error', err); }

        if(typeof ensureCanvas==='function') ensureCanvas();
        if(typeof update==='function') update();
        if(typeof drawBoard==='function') drawBoard();
        if(typeof requestStockfishMove==='function' && typeof whiteTurn!=='undefined' && !whiteTurn) requestStockfishMove();
    }

    // Kick off after DOM ready so canvas exists
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(startGameAuto, 50); });
    } else {
        setTimeout(startGameAuto, 50);
    }

    // lightweight game end checker kept in case other code relies on it
    setInterval(()=>{
        try{
            if(typeof fcRules !== 'undefined' && fcRules && typeof fcRules.isGameOver === 'function'){
                if(fcRules.isGameOver()){
                    // noop here; other code may handle end state
                }
            }
        }catch(e){/* silent */}
    }, 500);
})();
