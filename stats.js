(() => {
  const G={wP:'♙',wN:'♘',wB:'♗',wR:'♖',wQ:'♕',wK:'♔',bP:'♟',bN:'♞',bB:'♝',bR:'♜',bQ:'♛',bK:'♚'};
  const V={P:1,N:3,B:3,R:5,Q:9,K:0};
  let name=localStorage.getItem('freechess_username')||'Player';
  let rating=Math.max(0,Number(localStorage.getItem('freechess_rating'))||1200);
  let history=[],previous=null;
  const s=document.createElement('style');
  s.textContent='#fcStats{display:none!important;position:fixed;right:10px;top:10px;z-index:3000;width:min(290px,calc(100vw - 20px));max-height:38vh;overflow:auto;background:rgba(12,12,12,.94);color:white;border:1px solid #444;border-radius:12px;padding:10px;font:13px Arial}#fcStats button{background:white;color:#111;border:0;border-radius:7px;padding:6px 9px;font-weight:bold}#fcStats input{width:100%;box-sizing:border-box;margin:5px 0;padding:6px;border-radius:7px;border:1px solid #555;background:#111;color:white}#fcLog{max-height:100px;overflow:auto;background:#181818;padding:6px;border-radius:7px}.fcRow{display:flex;justify-content:space-between;margin:5px 0}.fcCap{font-size:19px}';
  document.head.appendChild(s);
  const p=document.createElement('div');p.id='fcStats';
  p.innerHTML='<div class="fcRow"><b>FreeChess</b><button id="fcExport">Export</button></div><div class="fcRow"><span>Username</span><b id="fcName"></b></div><input id="fcNameInput" maxlength="24" placeholder="Username"><div class="fcRow"><span>Rating</span><b id="fcRating"></b></div><div class="fcRow"><span>Züge</span><b id="fcCount">0</b></div><div class="fcRow"><span>Material</span><b id="fcMaterial">0</b></div><div>Geschlagene Figuren</div><div class="fcRow"><span>Weiß</span><span class="fcCap" id="fcW">–</span></div><div class="fcRow"><span>Schwarz</span><span class="fcCap" id="fcB">–</span></div><div>Zugliste</div><div id="fcLog">Noch keine Züge</div>';
  document.body.appendChild(p);
  const $=id=>p.querySelector(id);$('#fcNameInput').value=name;
  $('#fcNameInput').addEventListener('change',()=>{name=$('#fcNameInput').value.trim().slice(0,24)||'Player';localStorage.setItem('freechess_username',name);render()});
  const sq=i=>'abcdefgh'[i%8]+(8-Math.floor(i/8));
  function diff(a,b){if(!a||!b)return null;let from=-1,to=-1;for(let i=0;i<64;i++){if(a[i]!==b[i]&&a[i]!==0&&b[i]===0)from=i;if(a[i]!==b[i]&&b[i]!==0)to=i}if(from<0||to<0||!a[from])return null;return{from,to,piece:a[from],capture:a[to]||null,text:sq(from)+'-'+sq(to)}}
  function poll(){if(typeof board==='undefined'||!board.boardArr)return;let cur=board.boardArr.slice();let m=diff(previous,cur);if(m&&(!history.length||history[history.length-1].text!==m.text))history.push(m);previous=cur;render()}
  function render(){const w=history.filter(m=>m.capture&&m.capture[0]==='w'),b=history.filter(m=>m.capture&&m.capture[0]==='b');const mat=b.reduce((x,m)=>x+(V[m.capture[1]]||0),0)-w.reduce((x,m)=>x+(V[m.capture[1]]||0),0);$('#fcName').textContent=name;$('#fcRating').textContent=rating;$('#fcCount').textContent=history.length;$('#fcMaterial').textContent=mat>0?'+'+mat:String(mat);$('#fcW').textContent=w.map(m=>G[m.capture]).join('')||'–';$('#fcB').textContent=b.map(m=>G[m.capture]).join('')||'–';$('#fcLog').innerHTML=history.length?history.map((m,i)=>'<div>'+(i+1)+'. '+(m.piece[0]==='w'?'Weiß':'Schwarz')+': '+m.text+'</div>').join(''):'Noch keine Züge'}
  $('#fcExport').addEventListener('click',()=>{let lines=['FREECHESS – SCHACHLOG','','Spieler: '+name,'Rating: '+rating,'Datum: '+new Date().toLocaleString('de-DE'),'','ZUGLISTE',...history.map((m,i)=>(i+1)+'. '+(m.piece[0]==='w'?'Weiß':'Schwarz')+': '+m.text),'','GESCHLAGENE FIGUREN','Weiß: '+(history.filter(m=>m.capture&&m.capture[0]==='w').map(m=>G[m.capture]).join(' ')||'Keine'),'Schwarz: '+(history.filter(m=>m.capture&&m.capture[0]==='b').map(m=>G[m.capture]).join(' ')||'Keine')];let a=document.createElement('a'),u=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));a.href=u;a.download='freechess-'+new Date().toISOString().slice(0,10)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
  render();setInterval(poll,120);
})();
