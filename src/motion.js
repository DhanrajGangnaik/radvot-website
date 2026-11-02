import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function usePageEffects(paused) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = document.querySelector('.site-shell');
    const seen = new WeakSet();
    let scrollFrame = 0;
    let pointerFrame = 0;
    let activeCard = null;
    let activeButton = null;
    let pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const hero = document.querySelector('.hero');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const controller = new AbortController();
    const options = { passive: true, signal: controller.signal };
    const sections = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.dataset.active = String(entry.isIntersecting);
        if (entry.isIntersecting) entry.target.dataset.revealed = 'true';
      });
    }, { threshold: 0 });
    const observeSections = () => {
      root.querySelectorAll('section, .pillar, .boundary-diagram').forEach(el => {
        if (!seen.has(el)) { seen.add(el); sections.observe(el); }
      });
    };
    observeSections();
    const mutations = new MutationObserver(observeSections);
    mutations.observe(root, { childList: true, subtree: true });

    const updateScroll = () => {
      scrollFrame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      document.querySelector('.scroll-progress')?.style.setProperty('transform', `scaleX(${max > 0 ? scrollY / max : 0})`);
      let current = '';
      const offset = document.querySelector('.site-header').getBoundingClientRect().height + 40;
      for (const section of document.querySelectorAll('main section[id]')) {
        if (section.getBoundingClientRect().top <= offset) current = section.id;
      }
      document.querySelectorAll('.navigation a[href^="#"]').forEach(link => {
        if (link.getAttribute('href') === `#${current}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const scroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
    const visibility = () => {
      root.dataset.pageHidden = String(document.hidden);
      if (document.hidden) { cancelAnimationFrame(pointerFrame); pointerFrame = 0; }
    };
    const interpolate = () => {
      pointer.x += (pointer.tx - pointer.x) * .12;
      pointer.y += (pointer.ty - pointer.y) * .12;
      hero.style.setProperty('--light-x', `${pointer.x}px`);
      hero.style.setProperty('--light-y', `${pointer.y}px`);
      const box = hero.getBoundingClientRect();
      hero.style.setProperty('--parallax-x', `${(pointer.x / box.width - .5) * 7}deg`);
      hero.style.setProperty('--parallax-y', `${(.5 - pointer.y / box.height) * 5}deg`);
      if (Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > .5) pointerFrame = requestAnimationFrame(interpolate);
      else pointerFrame = 0;
    };
    const clearCard = () => {
      if (activeCard) { activeCard.style.removeProperty('transform'); activeCard = null; }
      if (activeButton) { activeButton.style.removeProperty('translate'); activeButton = null; }
    };
    const move = event => {
      if (paused || reduced || !fine.matches || document.hidden) return;
      const card = event.target.closest('.pillar');
      const button = event.target.closest('a.button');
      if (card !== activeCard || button !== activeButton) clearCard();
      if (card) {
        activeCard = card;
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        card.style.setProperty('transform', `perspective(1000px) rotateX(${(0.5-y)*3}deg) rotateY(${(x-0.5)*3}deg)`);
        card.style.setProperty('--spot-x', `${x*100}%`);
        card.style.setProperty('--spot-y', `${y*100}%`);
      }
      if (button) {
        activeButton = button;
        const box = button.getBoundingClientRect();
        button.style.setProperty('translate', `${((event.clientX-box.left)/box.width-.5)*5}px ${((event.clientY-box.top)/box.height-.5)*5}px`);
      }
      if (hero.contains(event.target) && hero.dataset.active !== 'false') {
        const box = hero.getBoundingClientRect();
        pointer.tx = event.clientX - box.left;
        pointer.ty = event.clientY - box.top;
        if (!pointerFrame) pointerFrame = requestAnimationFrame(interpolate);
      }
    };
    document.addEventListener('pointermove', move, options);
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) clearCard(); }, options);
    window.addEventListener('scroll', scroll, options);
    window.addEventListener('resize', scroll, options);
    const resize = new ResizeObserver(scroll);
    resize.observe(root);
    document.addEventListener('visibilitychange', visibility, { signal: controller.signal });
    updateScroll(); visibility();
    return () => {
      controller.abort(); sections.disconnect(); mutations.disconnect(); resize.disconnect(); clearCard();
      hero.style.removeProperty('--parallax-x'); hero.style.removeProperty('--parallax-y');
      cancelAnimationFrame(scrollFrame); cancelAnimationFrame(pointerFrame);
    };
  }, [paused, reduced]);
}
