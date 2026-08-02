import { $, addClass, removeClass } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = $('.mobile-menu-btn');
  const nav = $('.site-nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      // Toggle 'active' class on nav
      if (nav.classList.contains('active')) {
        removeClass(nav, 'active');
      } else {
        addClass(nav, 'active');
      }
    });
  }
});
