
from fastapi import FastAPI, UploadFile, File, HTTPException
try:
    from ai.core import analyze_image
except ImportError:
    # If starting from root backend dir
    from backend.ai.core import analyze_image
import shutil
import os
import uuid

app = FastAPI(title="AgriSafe AI Engine")

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/analyze")
async def analyze_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to upload and analyze an agricultural image.
    """
    try:
        # Create unique filename
        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run inference
        result = analyze_image(file_path)
        
        # Determine overall safety score
        # Simple weighted sum of sub-scores for demonstration
        disease_sev = result['disease']['severity']
        chem_risk = result['residue']['chemical_stress_index'] / 100.0
        soil_health_inv = (100 - result['soil']['soil_health_score']) / 100.0
        
        risk_score = (disease_sev * 0.4) + (chem_risk * 0.3) + (soil_health_inv * 0.3)
        safety_score = int(100 * (1.0 - risk_score))
        
        overall_result = {
            "analysis": result,
            "overall": {
                "safety_score": max(0, min(100, safety_score)),
                "risk_category": "Safe" if safety_score > 80 else "Monitor" if safety_score > 50 else "High Risk"
            }
        }
        
        # Cleanup (optional? keeping for now)
        # os.remove(file_path)
        
        return overall_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
