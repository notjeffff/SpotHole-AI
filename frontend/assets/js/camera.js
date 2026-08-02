import { postDetection } from './api.js';

let videoElement = null;
let canvasElement = null;
let stream = null;
let geoWatcherId = null;
let captureIntervalId = null;
let timerIntervalId = null;
let sessionStartTime = null;

let framesCaptured = 0;
let currentGps = {
    latitude: 0,
    longitude: 0,
    accuracy: 0
};

// UI Elements
let ui = {};

function initUI() {
    videoElement = document.getElementById('camera-video');
    canvasElement = document.getElementById('capture-canvas');
    
    ui.cameraStatus = document.getElementById('telemetry-camera-status');
    ui.gpsStatus = document.getElementById('telemetry-gps-status');
    ui.backendStatus = document.getElementById('telemetry-backend-status');
    ui.timer = document.getElementById('telemetry-timer');
    ui.coords = document.getElementById('telemetry-coords');
    ui.accuracy = document.getElementById('telemetry-accuracy');
    ui.lastUpdated = document.getElementById('telemetry-last-updated');
    ui.frames = document.getElementById('telemetry-frames');
    ui.overlayText = document.getElementById('camera-overlay-text');
    ui.scanLine = document.getElementById('scan-line');
}

export async function startCamera() {
    initUI();
    
    try {
        ui.cameraStatus.textContent = 'Starting...';
        ui.cameraStatus.className = 'text-warning';
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        
        videoElement.srcObject = stream;
        videoElement.style.opacity = '1';
        
        ui.cameraStatus.textContent = 'Active';
        ui.cameraStatus.className = 'text-success';
        ui.overlayText.style.display = 'none';
        ui.scanLine.style.display = 'block';
        
        startGps();
        startSession();
        
    } catch (err) {
        console.error('Camera access denied or unavailable', err);
        ui.cameraStatus.textContent = 'Error';
        ui.cameraStatus.className = 'text-danger';
        ui.overlayText.innerHTML = '<span class="text-danger">Camera Access Denied/Unavailable</span>';
    }
}

function startGps() {
    if (!navigator.geolocation) {
        ui.gpsStatus.textContent = 'Unsupported';
        return;
    }

    ui.gpsStatus.textContent = 'Locating...';
    ui.gpsStatus.className = 'text-warning';

    geoWatcherId = navigator.geolocation.watchPosition(
        (position) => {
            currentGps.latitude = position.coords.latitude;
            currentGps.longitude = position.coords.longitude;
            currentGps.accuracy = position.coords.accuracy;
            
            ui.gpsStatus.textContent = 'Active';
            ui.gpsStatus.className = 'text-success';
            ui.coords.textContent = `${currentGps.latitude.toFixed(6)}, ${currentGps.longitude.toFixed(6)}`;
            ui.accuracy.textContent = `${Math.round(currentGps.accuracy)} meters`;
            ui.lastUpdated.textContent = new Date().toLocaleTimeString();
        },
        (error) => {
            console.error('GPS error:', error);
            ui.gpsStatus.textContent = 'Error';
            ui.gpsStatus.className = 'text-danger';
            ui.coords.textContent = 'GPS Error';
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
}

function startSession() {
    framesCaptured = 0;
    ui.frames.textContent = '0';
    sessionStartTime = Date.now();
    
    // Update Timer UI
    timerIntervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const hrs = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        ui.timer.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);

    // Frame Capture Loop (1 frame/sec)
    captureIntervalId = setInterval(captureAndSendFrame, 1000);
}

async function captureAndSendFrame() {
    if (!videoElement || videoElement.videoWidth === 0) return;

    // Draw to canvas
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Compress to JPEG (75% quality)
    const base64Image = canvasElement.toDataURL('image/jpeg', 0.75);
    
    framesCaptured++;
    ui.frames.textContent = framesCaptured.toString();

    // Prepare payload
    const payload = {
        pothole_id: 1, // Mock ID for now since YOLO isn't assigning unique potholes yet
        latitude: currentGps.latitude,
        longitude: currentGps.longitude,
        gps_accuracy: currentGps.accuracy,
        confidence: 0.99, // Mock confidence
        image_path: base64Image // Storing base64 directly as a mock "path" for Phase 3D
    };

    ui.backendStatus.textContent = 'Sending...';
    ui.backendStatus.className = 'text-warning';

    const success = await postDetection(payload);
    
    if (success) {
        ui.backendStatus.textContent = 'Ready';
        ui.backendStatus.className = 'text-success';
    } else {
        ui.backendStatus.textContent = 'Offline';
        ui.backendStatus.className = 'text-danger';
    }
}

export function stopCamera() {
    // Stop Frame Capture
    if (captureIntervalId) {
        clearInterval(captureIntervalId);
        captureIntervalId = null;
    }
    
    // Stop Timer
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }

    // Stop GPS
    if (geoWatcherId !== null) {
        navigator.geolocation.clearWatch(geoWatcherId);
        geoWatcherId = null;
    }

    // Stop Media Stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement.style.opacity = '0';
    }
    
    // Reset UI
    if (ui.cameraStatus) {
        ui.cameraStatus.textContent = 'Offline';
        ui.cameraStatus.className = 'text-muted';
        ui.gpsStatus.textContent = 'Offline';
        ui.gpsStatus.className = 'text-muted';
        ui.backendStatus.textContent = 'Waiting';
        ui.backendStatus.className = 'text-muted';
        ui.overlayText.style.display = 'block';
        ui.overlayText.innerHTML = '<span class="pulse-dot"></span> Waiting for Camera...';
        ui.scanLine.style.display = 'none';
        
        ui.timer.textContent = '00:00:00';
        ui.coords.textContent = 'Waiting for GPS...';
        ui.accuracy.textContent = '-- meters';
        ui.lastUpdated.textContent = '--';
    }
}

export function initDetectionCamera() {
    const btnStart = document.getElementById('btn-start-detection');
    const btnStop = document.getElementById('btn-stop-detection');
    
    if (btnStart && btnStop) {
        btnStart.addEventListener('click', () => {
            btnStart.disabled = true;
            btnStop.disabled = false;
            startCamera();
        });
        
        btnStop.addEventListener('click', () => {
            btnStop.disabled = true;
            btnStart.disabled = false;
            stopCamera();
        });
    }
}
