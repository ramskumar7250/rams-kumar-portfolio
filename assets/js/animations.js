'use strict';
(function(){
  const isTouch=()=>window.matchMedia('(pointer:coarse)').matches;
  const noMotion=()=>window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $$=s=>[...document.querySelectorAll(s)];

  // Scroll reveal
  const rvObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const d=parseFloat(e.target.style.transitionDelay)||0;
        setTimeout(()=>e.target.classList.add('vis'),d*1000);
        rvObs.unobserve(e.target);
      }
    });
  },{threshold:.08,rootMargin:'0px 0px -50px 0px'});
  $$('.rv').forEach(el=>rvObs.observe(el));

  // Hero entrance
  if(!noMotion()){
    const hc=document.querySelector('.hero-copy');
    if(hc){
      [...hc.children].forEach((el,i)=>{
        Object.assign(el.style,{opacity:'0',transform:'translateY(22px)',
          transition:'opacity .9s cubic-bezier(.4,0,.2,1) '+(0.12+i*.11)+'s,transform .9s cubic-bezier(.4,0,.2,1) '+(0.12+i*.11)+'s'});
      });
    }
    const pw=document.querySelector('.pwrap,.portrait-wrap');
    if(pw)Object.assign(pw.style,{opacity:'0',transform:'translateY(28px) scale(.97)',
      transition:'opacity 1.1s cubic-bezier(.4,0,.2,1) .55s,transform 1.1s cubic-bezier(.4,0,.2,1) .55s'});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(hc)[...hc.children].forEach(el=>{el.style.opacity='1';el.style.transform='translateY(0)';});
      if(pw){pw.style.opacity='1';pw.style.transform='translateY(0) scale(1)';}
    }));
  }

  // Hero mouse parallax
  if(!isTouch()&&!noMotion()){
    const heroSec=document.getElementById('hero');
    if(heroSec){
      const parEls=$$('.fc,.p-ring');
      heroSec.addEventListener('mousemove',e=>{
        const r=heroSec.getBoundingClientRect();
        const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
        const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
        parEls.forEach((el,i)=>{const d=(i+1)*5;el.style.transform='translate('+dx*d+'px,'+dy*d+'px)';});
      });
      heroSec.addEventListener('mouseleave',()=>{
        parEls.forEach(el=>{el.style.transition='transform 1s cubic-bezier(.23,1,.32,1)';el.style.transform='';setTimeout(()=>el.style.transition='',1000);});
      });
    }
  }

  // Magnetic buttons
  if(!isTouch()&&!noMotion()){
    $$('.mag').forEach(btn=>{
      btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect();const x=e.clientX-r.left-r.width/2;const y=e.clientY-r.top-r.height/2;btn.style.transform='translate('+x*.22+'px,'+y*.22+'px)';});
      btn.addEventListener('mouseleave',()=>{btn.style.transition='transform .55s cubic-bezier(.23,1,.32,1)';btn.style.transform='';setTimeout(()=>btn.style.transition='',600);});
    });
  }

  // Experience scroll progress
  const expProg=document.getElementById('exp-progress');
  const expSec=document.getElementById('experience');
  if(expProg&&expSec){
    window.addEventListener('scroll',()=>{
      const r=expSec.getBoundingClientRect();
      const total=expSec.offsetHeight-window.innerHeight;
      const scrolled=-r.top;
      const pct=Math.min(Math.max(scrolled/total,0),1);
      expProg.style.transform='scaleY('+pct+')';
    },{passive:true});
  }
})();
