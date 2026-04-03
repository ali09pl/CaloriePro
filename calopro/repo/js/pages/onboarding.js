// =========================================================
// PAGE: ONBOARDING
// =========================================================
function pgOnboard(){
  let cur=0;
  const wrap=el('div',{class:'obwrap'});
  wrap.style.background='var(--hero)';

  const slides=[
    {art:'🥗',tk:'ob1_t',dk:'ob1_d'},
    {art:'📊',tk:'ob2_t',dk:'ob2_d'},
    {art:'🏆',tk:'ob3_t',dk:'ob3_d'}
  ];

  // Build slide elements
  const slideEls=slides.map(s=>{
    const slide=el('div',{class:'obslide'});
    slide.style.opacity='0';slide.style.pointerEvents='none';
    slide.appendChild(el('div',{class:'obart'},s.art));
    const t=el('h1',{class:'obtitle'});t.textContent=__(s.tk);slide.appendChild(t);
    slide.appendChild(el('p',{class:'obdesc'},__(s.dk)));
    return slide;
  });

  const slidesDiv=el('div',{style:{flex:'1',position:'relative',overflow:'hidden'}});
  slideEls.forEach(s=>slidesDiv.appendChild(s));
  wrap.appendChild(slidesDiv);

  // Dots
  const dotsWrap=el('div',{class:'obdots',style:{justifyContent:'center'}});
  const dots=slides.map(()=>el('div',{class:'obdot'}));
  dots.forEach(d=>dotsWrap.appendChild(d));
  wrap.appendChild(dotsWrap);

  // Buttons
  const nextBtn=el('button',{class:'btn btn-pr btn-lg btn-w'},'Next →');
  const skipBtn=el('button',{class:'btn btn-gh btn-sm btn-w'},__('ob_skip'));
  const bottom=el('div',{class:'ob-bottom'});
  bottom.appendChild(nextBtn);bottom.appendChild(skipBtn);
  wrap.appendChild(bottom);

  function showSlide(idx){
    slideEls.forEach((s,i)=>{
      s.style.opacity=i===idx?'1':'0';
      s.style.pointerEvents=i===idx?'auto':'none';
      s.style.display='flex';
    });
    dots.forEach((d,i)=>d.classList.toggle('on',i===idx));
    nextBtn.textContent=idx===slides.length-1?__('ob_start'):'Next →';
  }

  nextBtn.addEventListener('click',()=>{
    if(cur<slides.length-1){cur++;showSlide(cur);}
    else{S.onboarded=true;saveS();wrap.remove();render();}
  });
  skipBtn.addEventListener('click',()=>{S.onboarded=true;saveS();wrap.remove();render();});

  showSlide(0);
  return wrap;
}

