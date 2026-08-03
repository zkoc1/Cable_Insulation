from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="Cable Insulation Analysis Service")

class AnalysisRequest(BaseModel):
    cable_type: str
    image_base64: str = ""

@app.get("/")
def read_root():
    return {"status": "online", "service": "Cable Insulation Analysis API"}

@app.post("/analyze")
def analyze_cable(request: AnalysisRequest):
    # Simulated OpenCV / SciPy Image processing response
    return {
        "cable_type": request.cable_type,
        "processed": True,
        "metrics": {
            "tmin": round(random.uniform(0.7, 1.2), 3),
            "tmax": round(random.uniform(1.3, 1.8), 3),
            "eccentricity": round(random.uniform(2.0, 9.5), 2),
            "ovality": round(random.uniform(96.0, 99.5), 2)
        }
    }
