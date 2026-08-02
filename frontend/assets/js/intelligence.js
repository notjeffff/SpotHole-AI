import { fetchPotholeStats, fetchReportStats, fetchRecentReports, fetchRecentDetections } from './api.js';

export async function initIntelligence() {
    console.log("Initializing Road Intelligence");
    
    const ui = {
        total: document.getElementById('intel-total-potholes'),
        active: document.getElementById('intel-active-potholes'),
        resolved: document.getElementById('intel-resolved'),
        critical: document.getElementById('intel-critical'), // Not explicitly calculated in API yet, mock or 0
        reports: document.getElementById('intel-reports-today'),
        maintenanceBody: document.getElementById('intel-maintenance-body'),
        reportsBody: document.getElementById('intel-recent-reports-body')
    };

    async function loadStats() {
        const pStats = await fetchPotholeStats();
        const rStats = await fetchReportStats();

        if (ui.total) ui.total.textContent = pStats.total;
        if (ui.active) ui.active.textContent = pStats.active;
        if (ui.resolved) ui.resolved.textContent = pStats.resolved;
        if (ui.critical) ui.critical.textContent = '0'; // placeholder
        if (ui.reports) ui.reports.textContent = rStats.total;
    }

    async function loadTables() {
        if (!ui.reportsBody) return;
        
        const reports = await fetchRecentReports(5);
        ui.reportsBody.innerHTML = '';
        
        if (reports.length === 0) {
            ui.reportsBody.innerHTML = '<tr><td colspan="6" class="text-secondary text-center">No recent reports found.</td></tr>';
        } else {
            reports.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-muted" style="font-family: monospace;">#R-${r.id}</td>
                    <td style="font-weight: 500;">GPS (${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)})</td>
                    <td><span class="severity-indicator severity-${r.severity || 'low'}">${r.severity || 'Low'}</span></td>
                    <td>Manual Report</td>
                    <td><span class="status-chip chip-waiting">${r.status}</span></td>
                    <td class="text-muted">${new Date(r.created_at).toLocaleString()}</td>
                `;
                ui.reportsBody.appendChild(tr);
            });
        }
        
        // Mock maintenance table by pulling recent detections (since we don't have a real maintenance API yet)
        if (!ui.maintenanceBody) return;
        const detections = await fetchRecentDetections(5);
        ui.maintenanceBody.innerHTML = '';
        if (detections.length === 0) {
            ui.maintenanceBody.innerHTML = '<tr><td colspan="6" class="text-secondary text-center">Queue empty.</td></tr>';
        } else {
            detections.forEach((d, i) => {
                const pClass = i === 0 ? 'text-error' : (i < 3 ? 'text-warning' : 'text-accent');
                const pSeverity = i === 0 ? 'Critical' : (i < 3 ? 'High' : 'Medium');
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: 500;">Pothole #${d.pothole_id}</td>
                    <td><span class="${pClass}" style="font-weight: 600;">${pSeverity}</span></td>
                    <td>${d.id}</td>
                    <td>${d.confidence ? Math.round(d.confidence * 100) + '%' : 'N/A'}</td>
                    <td><span class="status-chip" style="background: var(--bg-surface-hover); color: var(--text-secondary); border: 1px solid var(--border-subtle);">P${i+1}</span></td>
                    <td><span class="status-chip chip-waiting">Assigned</span></td>
                `;
                ui.maintenanceBody.appendChild(tr);
            });
        }
    }

    await loadStats();
    await loadTables();
    
    // Auto refresh every 10 seconds only if tab is visible
    setInterval(() => {
        if (!document.hidden && document.getElementById('view-intelligence').style.display !== 'none') {
            loadStats();
            loadTables();
        }
    }, 10000);
}
