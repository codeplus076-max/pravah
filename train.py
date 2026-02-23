"""Model training script for Navi Mumbai house price prediction."""

import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_percentage_error, mean_absolute_error, r2_score
import xgboost as xgb


def load_data(filepath: str) -> pd.DataFrame:
    """Load the dataset from a CSV file.

    Args:
        filepath: Path to the CSV file.

    Returns:
        DataFrame containing the loaded data.
    """
    df = pd.read_csv(filepath)
    return df


def preprocess_and_train(df: pd.DataFrame):
    """Preprocesses the data and trains an XGBoost model.

    Args:
        df: Input DataFrame containing features and target.
    """
    # Define features and target
    target = "actual_price"
    features = [
        "location", "area_sqft", "bhk", "bathrooms", 
        "floor", "total_floors", "age_of_property", 
        "parking", "lift"
    ]
    
    X = df[features].copy()
    y = df[target].copy()

    # Define categorical and numerical features
    categorical_features = ["location"]
    numeric_features = [
        "area_sqft", "bhk", "bathrooms", "floor", 
        "total_floors", "age_of_property", "parking", "lift"
    ]

    # Preprocessing pipelines for both numeric and categorical data
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown="ignore")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    # Note: Target is highly variable according to location, we'll just train a direct model on target
    
    # Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # We will fit the preprocessor on training data and then transform 
    # both train and test to feed into XGBoost separately
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # Initialize XGBRegressor
    model = xgb.XGBRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        early_stopping_rounds=50,
        random_state=42,
        tree_method='hist'
    )

    # Fit model
    print("Training model...")
    model.fit(
        X_train_processed, 
        y_train,
        eval_set=[(X_test_processed, y_test)],
        verbose=False
    )

    # Predictions
    y_pred = model.predict(X_test_processed)

    # Evaluate metrics
    mape = mean_absolute_percentage_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("\n--- Model Evaluation ---")
    print(f"MAPE: {mape:.4f}")
    print(f"MAE: {mae:.2f}")
    print(f"R2 Score: {r2:.4f}")

    # Save the model and preprocessor
    print("\nSaving model and preprocessor...")
    with open("model.pkl", "wb") as f:
        pickle.dump(model, f)
    
    with open("preprocessor.pkl", "wb") as f:
        pickle.dump(preprocessor, f)
        
    print("Saved successfully at 'model.pkl' and 'preprocessor.pkl'.")


if __name__ == "__main__":
    csv_path = "navi_mumbai_real_estate_uncleaned_2500_cleaned.csv"
    try:
        print(f"Loading data from {csv_path}...")
        df = load_data(csv_path)
        preprocess_and_train(df)
    except Exception as e:
        print(f"An error occurred: {e}")
