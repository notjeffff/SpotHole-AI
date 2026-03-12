# RoadSense AI – Pothole Detection & Risk Analysis System

RoadSense AI is a web-based smart road monitoring system that detects potholes using an AI model and visualizes them on an interactive map. The system also estimates route risk and accident probability based on detected road conditions.

## Features

- AI-powered pothole detection using TensorFlow.js
- Live camera analysis for road monitoring
- Interactive map visualization using Leaflet
- Route generation between origin and destination
- Risk score and accident probability estimation
- Automatic pothole logging on the map
- Local storage of detected pothole locations

## Technologies Used

- HTML
- CSS
- JavaScript
- TensorFlow.js
- Teachable Machine
- Leaflet.js
- OpenStreetMap
- OSRM Routing API

## How It Works

1. The user sets an origin and destination on the map.
2. The system generates a route using OpenStreetMap routing.
3. The camera analyzes the road using an AI model trained to detect potholes.
4. When a pothole is detected:
   - A marker is placed on the map.
   - The pothole is stored locally.
5. The system calculates a risk score based on potholes along the route.

## Project Structure
