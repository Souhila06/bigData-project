from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from core.logger import logger
import joblib
import pandas as pd

# importation du modèle ML
model = joblib.load('/Users/nassimoukaci/Documents/GitHub/bigdata/app/backend/api/routes/ai/svm_model_last.joblib')


router = APIRouter()

class PredictionRequest(BaseModel):
    input_data: str

class PredictionResponse(BaseModel):
    predicted_class: str
 #   confidence: float  # Facultatif : Ajoutez cela si votre modèle renvoie une probabilité ou un score


@router.post("/send", response_model=PredictionResponse)
async def predict_class(request: PredictionRequest) -> PredictionResponse:
    """
    Prédire la classe à partir des données d'entrée fournies sous forme de chaîne de caractères.
    """
    try:
        # Vérification des données d'entrée
        if not request.input_data.strip():
            raise HTTPException(status_code=400, detail="Input data cannot be empty.")

        # Log input data (optionnel)
        logger.info(f"Received input for prediction: {request.input_data[:100]}...")

        # Prétraitement des données (si nécessaire)
        # preprocessed_data = preprocess_input(request.input_data)

        # Colonnes attendues
        columns = [
            'heart_rate',
            'IMU_hand_1', 'IMU_hand_2', 'IMU_hand_3', 'IMU_hand_4', 'IMU_hand_5', 'IMU_hand_6', 
            'IMU_hand_7', 'IMU_hand_8', 'IMU_hand_9', 'IMU_hand_10', 'IMU_hand_11', 'IMU_hand_12', 
            'IMU_hand_13', 'IMU_hand_14', 'IMU_hand_15', 'IMU_hand_16', 'IMU_hand_17',
            'IMU_chest_1', 'IMU_chest_2', 'IMU_chest_3', 'IMU_chest_4', 'IMU_chest_5', 'IMU_chest_6', 
            'IMU_chest_7', 'IMU_chest_8', 'IMU_chest_9', 'IMU_chest_10', 'IMU_chest_11', 'IMU_chest_12', 
            'IMU_chest_13', 'IMU_chest_14', 'IMU_chest_15', 'IMU_chest_16', 'IMU_chest_17',
            'IMU_ankle_1', 'IMU_ankle_2', 'IMU_ankle_3', 'IMU_ankle_4', 'IMU_ankle_5', 'IMU_ankle_6', 
            'IMU_ankle_7', 'IMU_ankle_8', 'IMU_ankle_9', 'IMU_ankle_10', 'IMU_ankle_11', 'IMU_ankle_12', 
            'IMU_ankle_13', 'IMU_ankle_14', 'IMU_ankle_15', 'IMU_ankle_16', 'IMU_ankle_17'
        ]

        # Transformer la chaîne en liste de valeurs
        data = [float(value) for value in request.input_data.split(",")]

        # Créer le DataFrame
        sample = pd.DataFrame([data], columns=columns)

        # Afficher les colonnes du DataFrame
        #print(df.columns)
        predicted_class = str(model.predict(sample)[0])
        confidence = 0.95  # Exemple de confiance (facultatif)
        print(predicted_class)

        # Retourner la réponse
        return PredictionResponse(
            predicted_class=predicted_class,
            confidence=confidence,
        )

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


def preprocess_input(input_data: str) -> Dict:
    """
    Prétraiter les données d'entrée pour le modèle.
    """
    # Exemple de prétraitement : convertir en minuscules, supprimer les espaces inutiles, etc.
    return {"processed_data": input_data.strip().lower()}