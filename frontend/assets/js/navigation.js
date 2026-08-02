import { $, $$, addClass, removeClass } from './utils.js';

/**
 * Initializes the navigation logic for the application shell.
 * Switches between views and manages sidebar state.
 */
export function initNavigation() {
  const navLinks = $$('.nav-link');
  const views = $$('.view');
  const viewTriggers = $$('[data-view]');
  const breadcrumb = $('#breadcrumb-current');
  
  // Sidebar elements
  const sidebar = $('#appSidebar');
  const collapseBtn = $('#collapseBtn');
  const mobileMenuBtn = $('#mobileMenuBtn');
  const mobileOverlay = $('#mobileOverlay');

  if (!viewTriggers.length || !views.length) return;

  // View Switching Logic
  viewTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Allow button clicks or anchor clicks
      if (trigger.tagName === 'A') {
        e.preventDefault();
      }
      
      const targetViewId = trigger.getAttribute('data-view');
      let viewTitle = trigger.getAttribute('data-title');
      
      if (!targetViewId) return;

      // Update active nav link (only for sidebar links)
      navLinks.forEach(nav => {
        if (nav.getAttribute('data-view') === targetViewId) {
          addClass(nav, 'active');
          if (!viewTitle) {
            viewTitle = nav.getAttribute('data-title');
          }
        } else {
          removeClass(nav, 'active');
        }
      });

      // Update active view
      views.forEach(view => {
        if (view.id === targetViewId) {
          addClass(view, 'active');
        } else {
          removeClass(view, 'active');
        }
      });
      
      // Update breadcrumb
      if (breadcrumb && viewTitle) {
        breadcrumb.textContent = viewTitle;
      }
      
      // Close mobile menu on navigate
      closeMobileMenu();
    });
  });
  
  // Desktop Sidebar Collapse Logic
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      if (sidebar.classList.contains('collapsed')) {
        removeClass(sidebar, 'collapsed');
      } else {
        addClass(sidebar, 'collapsed');
      }
    });
  }
  
  // Mobile Sidebar Slide-out Logic
  if (mobileMenuBtn && sidebar && mobileOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      addClass(sidebar, 'mobile-open');
      addClass(mobileOverlay, 'active');
    });
    
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }
  
  function closeMobileMenu() {
    if (sidebar) removeClass(sidebar, 'mobile-open');
    if (mobileOverlay) removeClass(mobileOverlay, 'active');
  }
}
