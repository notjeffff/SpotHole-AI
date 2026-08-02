import { initNavigation } from './navigation.js';

/**
 * Main application orchestrator.
 * Bootstraps the frontend logic when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI navigation
  initNavigation();

  // Extension points for future phases:
  // initMap();
  // initDetectionCamera();
  // initAnalytics();
});
