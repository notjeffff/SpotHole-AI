import { postReport } from './api.js';

export function initReport() {
    console.log("Initializing Report View");

    let currentLat = null;
    let currentLng = null;
    let selectedSeverity = 'medium';

    const ui = {
        latLng: document.getElementById('report-lat-lng'),
        btnGps: document.getElementById('report-btn-gps'),
        severityGroup: document.getElementById('report-severity-group'),
        description: document.getElementById('report-description'),
        btnReset: document.getElementById('report-btn-reset'),
        btnSubmit: document.getElementById('report-btn-submit'),
        successBanner: document.getElementById('report-success-banner'),
        errorBanner: document.getElementById('report-error-banner')
    };

    // Severity Selection
    if (ui.severityGroup) {
        ui.severityGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('segment-btn')) {
                // Remove active from all
                Array.from(ui.severityGroup.children).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedSeverity = e.target.getAttribute('data-val');
            }
        });
    }

    // GPS fetch
    if (ui.btnGps) {
        ui.btnGps.addEventListener('click', () => {
            if (navigator.geolocation) {
                ui.latLng.innerHTML = '<span class="pulse-dot"></span> Locating...';
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        currentLat = position.coords.latitude;
                        currentLng = position.coords.longitude;
                        ui.latLng.innerHTML = `${currentLat.toFixed(4)}° N, ${currentLng.toFixed(4)}° W`;
                        ui.errorBanner.style.display = 'none';
                    },
                    (err) => {
                        console.error(err);
                        ui.latLng.innerHTML = 'GPS Error';
                    }
                );
            }
        });
    }

    // Submit Report
    if (ui.btnSubmit) {
        ui.btnSubmit.addEventListener('click', async () => {
            ui.successBanner.style.display = 'none';
            ui.errorBanner.style.display = 'none';

            if (!currentLat || !currentLng) {
                ui.errorBanner.style.display = 'flex';
                ui.errorBanner.innerHTML = 'Validation Error: GPS Location is required.';
                return;
            }

            ui.btnSubmit.disabled = true;
            ui.btnSubmit.textContent = 'Submitting...';

            const payload = {
                pothole_id: 1, // Mock linking for Phase 3G
                latitude: currentLat,
                longitude: currentLng,
                severity_user_reported: selectedSeverity,
                description: ui.description.value,
                image_path: null // Images are not implemented in Phase 3 yet
            };

            const result = await postReport(payload);
            
            ui.btnSubmit.disabled = false;
            ui.btnSubmit.textContent = 'Submit Report';

            if (result) {
                ui.successBanner.style.display = 'flex';
                // Reset form
                currentLat = null;
                currentLng = null;
                ui.latLng.innerHTML = 'Waiting for GPS...';
                ui.description.value = '';
            } else {
                ui.errorBanner.style.display = 'flex';
                ui.errorBanner.innerHTML = 'Server Error: Failed to submit report.';
            }
        });
    }

    // Reset Form
    if (ui.btnReset) {
        ui.btnReset.addEventListener('click', () => {
            currentLat = null;
            currentLng = null;
            ui.latLng.innerHTML = 'Waiting for GPS...';
            ui.description.value = '';
            ui.successBanner.style.display = 'none';
            ui.errorBanner.style.display = 'none';
        });
    }
}
