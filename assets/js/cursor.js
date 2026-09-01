'use strict';
(function(){
  if(window.matchMedia('(pointer:coarse)').matches)return;
  const dot=document.getElementById('cDot');
  const ring=document.getElementById('cRing');
  if(!dot||!ring)return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
  });
  (function track(){
    rx+=(mx-rx)*.11;ry+=(my-ry)*.11;
    ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(track);
  })();
  const $$=s=>[...document.querySelectorAll(s)];
  $$('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('lh'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('lh'));
    el.style.cursor='none';
  });
  $$('.pc,.proj-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ring.classList.remove('lh','ih');ring.classList.add('ph');});
    el.addEventListener('mouseleave',()=>ring.classList.remove('ph'));
  });
  $$('.p-frame,.portrait').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ring.classList.remove('lh','ph');ring.classList.add('ih');});
    el.addEventListener('mouseleave',()=>ring.classList.remove('ih'));
  });
  document.addEventListener('mouseleave',()=>{dot.style.opacity='0';ring.style.opacity='0';});
  document.addEventListener('mouseenter',()=>{dot.style.opacity='1';ring.style.opacity='1';});
})();
