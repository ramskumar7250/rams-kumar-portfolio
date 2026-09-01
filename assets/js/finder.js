'use strict';
(function(){
  const finderBtn=document.getElementById('finder-btn');
  const finderMenu=document.getElementById('finder-menu');
  if(!finderBtn||!finderMenu)return;
  let open=false;
  function openFinder(){open=true;finderBtn.classList.add('open');finderMenu.classList.add('open');finderBtn.setAttribute('aria-expanded','true');}
  function closeFinder(){open=false;finderBtn.classList.remove('open');finderMenu.classList.remove('open');finderBtn.setAttribute('aria-expanded','false');}
  finderBtn.addEventListener('click',e=>{e.stopPropagation();open?closeFinder():openFinder();});
  document.addEventListener('click',()=>{if(open)closeFinder();});
  finderMenu.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)closeFinder();});
})();
