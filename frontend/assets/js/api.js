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
