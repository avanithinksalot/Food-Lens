import sys
import json
import os

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the core analysis logic
try:
    from ai.core import analyze_image
except ImportError as e:
    # Fallback if module structure is broken (shouldn't happen)
    print(json.dumps({"error": f"Module import error: {str(e)}"}))
    sys.exit(1)

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No image path provided"}))
            sys.exit(1)
            
        image_path = sys.argv[1]
        
        # Run analysis
        analysis_result = analyze_image(image_path)
        
        # Ensure the output matches the exact format expected by the frontend/backend bridge
        # The core returns { disease: {...}, residue: {...}, soil: {...} }
        # We need to add 'overall' summary here if not present, as the Node backend expects it?
        # Checking backend/server.js: it expects specific keys.
        # Let's augment the result with 'overall' summary logic here to keep Node backend simple.
        
        if 'overall' not in analysis_result:
            # Calculate overall score based on the sub-components
            disease_sev = analysis_result['disease'].get('severity', 0)
            chem_risk = analysis_result['residue'].get('chemical_stress_index', 0) / 100.0
            soil_health_score = analysis_result['soil'].get('soil_health_score', 50)
            
            # Formula: Lower risk is better. Health is inverted risk.
            risk_score = (disease_sev * 0.4) + (chem_risk * 0.3) + ((100 - soil_health_score)/100.0 * 0.3)
            safety_score = int(100 * (1.0 - risk_score))
            safety_score = max(0, min(100, safety_score))
            
            cat = "Safe" if safety_score > 80 else "Monitor" if safety_score > 50 else "High Risk"
            
            analysis_result['overall'] = {
                "safety_score": safety_score,
                "risk_category": cat
            }

        print(json.dumps(analysis_result))
        
    except Exception as e:
        # Catch-all for any runtime errors to prevent node process from hanging
        print(json.dumps({
            "error": str(e),
            "disease_risk": {"disease_name": "Error", "probability": 0, "severity_score": 0},
            "overall": {"safety_score": 0, "risk_category": "Error"} 
        }))
        sys.exit(1)
