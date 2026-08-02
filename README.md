# SpotHole AI - Intelligent Road Maintenance MVP

SpotHole AI is an end-to-end intelligent road maintenance application that utilizes a FastAPI backend, SQLite database, YOLOv8 computer vision model, and a vanilla HTML/JS/CSS frontend architecture.

## Overview
- **Frontend**: A high-performance, dependency-free vanilla JS single-page application mockup that operates without heavy frameworks.
- **Backend**: FastAPI paired with SQLAlchemy for SQLite database management. 
- **AI Engine**: Ultralytics YOLOv8 for pothole detection running natively via PyTorch.

## Setup & Running the Application

### 1. Backend (FastAPI + YOLOv8)
The backend manages API endpoints, database persistence, and AI inference.

#### Requirements:
- Python 3.10+
- `pip`

#### Installation:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### YOLOv8 Model:
The `yolov8n.pt` model is configured by default inside `backend/app/core/settings.py`. It is automatically downloaded upon the first inference run by the `ultralytics` package.

#### Running the Server:
```bash
uvicorn app.main:app --reload
```
The REST API will be available at: `http://127.0.0.1:8000`
Swagger Documentation: `http://127.0.0.1:8000/docs`

### 2. Frontend (UI + MediaDevices + Leaflet)
The frontend connects securely to the local backend.

#### Running:
To run the frontend without CORS issues, serve the static directory:
```bash
cd frontend
python3 -m http.server 8080
```
Open your browser to: `http://localhost:8080/app.html`

## Known Limitations (Phase 3 MVP)
- **Production AI Model**: The MVP utilizes `yolov8n.pt` (the nano pre-trained model) for testing API lifecycle flows. It is *not* trained specifically on potholes out-of-the-box. A custom `best.pt` model must be placed in `backend/models/yolov8/` and referenced in settings for real-world accuracy.
- **Image Persistence**: The MVP receives Base64 images for inference, but does not currently write these to disk or AWS S3 due to MVP scope constraints. Images are transient and discarded after the coordinates and confidences are saved.
- **Security**: The application currently has no JWT Authentication or user roles implemented.

## Architecture

- `Potholes`: Persistent physical objects grouped geographically.
- `Detections`: Individual YOLO frame inferences. Multiple detections within 15 meters collapse into a single Pothole object.
- `Reports`: Manual citizen submissions tied to geospatial points.
