import { initNavigation } from './navigation.js';
import { initDetectionCamera } from './camera.js';
import { initDashboard } from './dashboard.js';
import { initMap } from './map.js';
import { initReport } from './report.js';
import { initIntelligence } from './intelligence.js';

/**
 * Main application orchestrator.
 * Bootstraps the frontend logic when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDashboard();
  initMap();
  initDetectionCamera();
  initReport();
  initIntelligence();
});
