const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Send a captured detection frame to the backend.
 * @param {Object} payload 
 * @param {number} payload.pothole_id - Temporary/mock ID for now since we don't have YOLO creating potholes yet.
 * @param {number} payload.latitude
 * @param {number} payload.longitude
 * @param {number} payload.gps_accuracy
 * @param {number} payload.confidence
 * @param {string} payload.image_path - Base64 encoded JPEG image
 * @returns {Promise<boolean>} Success status
 */
export async function postDetection(payload) {
    try {
        const response = await fetch(`${API_BASE_URL}/detections/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            console.error('Failed to post detection:', await response.text());
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Network error while posting detection:', error);
        return null;
    }
}

export async function fetchPotholes() {
    try {
        const response = await fetch(`${API_BASE_URL}/potholes/`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error('Error fetching potholes:', e);
        return [];
    }
}

export async function fetchPotholeStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/potholes/stats`);
        if (!response.ok) return { total: 0, active: 0, detected: 0, resolved: 0 };
        return await response.json();
    } catch (e) {
        console.error('Error fetching pothole stats:', e);
        return { total: 0, active: 0, detected: 0, resolved: 0 };
    }
}

export async function fetchRecentDetections(limit=10) {
    try {
        const response = await fetch(`${API_BASE_URL}/detections/recent?limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error('Error fetching recent detections:', e);
        return [];
    }
}

export async function fetchReportStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/stats`);
        if (!response.ok) return { total: 0 };
        return await response.json();
    } catch (e) {
        console.error('Error fetching report stats:', e);
        return { total: 0 };
    }
}

export async function fetchRecentReports(limit=10) {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/recent?limit=${limit}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.error('Error fetching recent reports:', e);
        return [];
    }
}

export async function postReport(payload) {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            console.error('Failed to post report:', await response.text());
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error('Error posting report:', e);
        return null;
    }
}
