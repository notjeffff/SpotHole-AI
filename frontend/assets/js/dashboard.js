import { fetchPotholeStats, fetchReportStats, fetchRecentReports } from './api.js';

export async function initDashboard() {
    console.log("Initializing Dashboard");
    
    const ui = {
        totalPotholes: document.getElementById('metric-total-potholes'),
        activePotholes: document.getElementById('metric-active-potholes'),
        reportsToday: document.getElementById('metric-reports-today'),
        sessionDetections: document.getElementById('metric-session-detections'),
        recentReportsBody: document.getElementById('dashboard-recent-reports-body')
    };

    async function loadStats() {
        const pStats = await fetchPotholeStats();
        const rStats = await fetchReportStats();

        if (ui.totalPotholes) ui.totalPotholes.textContent = pStats.total;
        if (ui.activePotholes) ui.activePotholes.textContent = pStats.active;
        if (ui.reportsToday) ui.reportsToday.textContent = rStats.total; 
        
        // Session detections is maintained locally in camera.js, but we can set it to 0 initially
        if (ui.sessionDetections && ui.sessionDetections.textContent === '--') {
            ui.sessionDetections.textContent = '0';
        }
    }

    async function loadRecentReports() {
        if (!ui.recentReportsBody) return;
        const reports = await fetchRecentReports(5);
        ui.recentReportsBody.innerHTML = '';
        
        if (reports.length === 0) {
            ui.recentReportsBody.innerHTML = '<tr><td colspan="5" class="text-secondary text-center">No recent reports found.</td></tr>';
            return;
        }
        
        reports.forEach(report => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#R-${report.id}</td>
                <td><span class="severity-indicator severity-${report.severity || 'low'}">${report.severity || 'low'}</span></td>
                <td>${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</td>
                <td><span class="status-chip chip-waiting">${report.status}</span></td>
                <td>${new Date(report.created_at).toLocaleTimeString()}</td>
            `;
            ui.recentReportsBody.appendChild(tr);
        });
    }

    await loadStats();
    await loadRecentReports();
    
    // Auto refresh every 10 seconds only if tab is visible
    setInterval(() => {
        if (!document.hidden && document.getElementById('view-dashboard').style.display !== 'none') {
            loadStats();
            loadRecentReports();
        }
    }, 10000);
}
