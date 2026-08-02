# SpotHole AI Backend Foundation

This is the FastAPI backend for SpotHole AI. Currently in Phase 3A: Project Initialization.

## Setup Instructions

1. **Create Virtual Environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

4. **Run Application**
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://127.0.0.1:8000`
Health check: `http://127.0.0.1:8000/api/health`
