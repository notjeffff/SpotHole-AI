import time
import base64
import io
from PIL import Image
from ultralytics import YOLO
from typing import Dict, Any

from app.core.settings import settings

class AIService:
    _instance = None
    _model = None
    _model_version = settings.YOLO_MODEL_PATH.split("/")[-1].replace(".pt", "")

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        try:
            print(f"Loading YOLO model from {settings.YOLO_MODEL_PATH}...")
            self._model = YOLO(settings.YOLO_MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            self._model = None

    def predict(self, base64_image_str: str) -> Dict[str, Any]:
        """
        Runs YOLOv8 inference on a base64 encoded image string.
        """
        start_time = time.time()
        
        response = {
            "detected": False,
            "class": None,
            "confidence": None,
            "bbox": None,
            "processing_time_ms": 0,
            "model_version": self._model_version
        }

        if self._model is None:
            return response

        try:
            # Strip the data:image/jpeg;base64, prefix if it exists
            if "," in base64_image_str:
                base64_image_str = base64_image_str.split(",")[1]
                
            image_data = base64.b64decode(base64_image_str)
            image = Image.open(io.BytesIO(image_data))
            
            # Run inference (we use verbose=False to keep logs clean)
            results = self._model(image, verbose=False)
            
            if results and len(results) > 0:
                result = results[0]
                
                # Check if there are any detections
                if len(result.boxes) > 0:
                    # For this MVP, grab the highest confidence box (the first one sorted by conf usually, or we just take the first)
                    box = result.boxes[0]
                    
                    response["detected"] = True
                    response["class"] = result.names[int(box.cls[0])]
                    response["confidence"] = float(box.conf[0])
                    
                    # xyxy format
                    coords = box.xyxy[0].tolist()
                    response["bbox"] = {
                        "x_min": coords[0],
                        "y_min": coords[1],
                        "x_max": coords[2],
                        "y_max": coords[3]
                    }

        except Exception as e:
            print(f"AI inference error: {e}")
            # If parsing or inference fails, we return detected=False
            
        finally:
            end_time = time.time()
            response["processing_time_ms"] = int((end_time - start_time) * 1000)
            
        return response

# Instantiate a global instance (loads the model)
ai_service = AIService()
