import pickle
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn

# Define the input schema matching the model's features
class PropertyFeatures(BaseModel):
    location: str
    area_sqft: float
    bhk: float
    bathrooms: float
    floor: float
    total_floors: float
    age_of_property: float
    parking: float
    lift: float

# Initialize FastAPI app
app = FastAPI(
    title="PropSight NM - Navi Mumbai House Price Prediction API",
    description="API for predicting house prices in Navi Mumbai based on property features.",
    version="1.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and preprocessor
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
    print("Model loaded successfully.")
except FileNotFoundError:
    model = None
    print("Warning: model.pkl not found. Please train the model first.")

try:
    with open("preprocessor.pkl", "rb") as f:
        preprocessor = pickle.load(f)
    print("Preprocessor loaded successfully.")
except FileNotFoundError:
    preprocessor = None
    print("Warning: preprocessor.pkl not found. Please train the model first.")


@app.get("/health")
def health_check():
    """Health check endpoint for Render."""
    if model is None or preprocessor is None:
        return {"status": "unhealthy", "message": "Model or preprocessor not loaded"}
    return {"status": "ok"}


@app.post("/predict")
def predict_price(features: PropertyFeatures):
    """Predict the house price based on input features."""
    if model is None or preprocessor is None:
        raise HTTPException(status_code=500, detail="Model is not initialized on the server.")

    try:
        # Convert Pydantic object to dictionary, then to DataFrame
        input_data = pd.DataFrame([features.dict()])
        
        # Preprocess features
        processed_data = preprocessor.transform(input_data)
        
        # Predict
        predicted_price = float(model.predict(processed_data)[0])
        
        # Calculate price per sqft
        price_per_sqft = predicted_price / features.area_sqft if features.area_sqft > 0 else 0
        
        # Mock confidence score (in MVP we can return a static high score or based on some heuristic)
        # Using a base 90% and minor variation based on area
        confidence_score = min(98.0, max(80.0, 95.0 - (features.age_of_property * 0.5)))
        
        # Determine low, mid, high range (+/- 5%)
        low_estimate = predicted_price * 0.95
        high_estimate = predicted_price * 1.05

        return {
            "predicted_price": predicted_price,
            "low_estimate": low_estimate,
            "high_estimate": high_estimate,
            "price_per_sqft": price_per_sqft,
            "confidence_score": confidence_score
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
