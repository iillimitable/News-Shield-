import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
from preprocess import preprocess_text

# Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(MODEL_DIR, 'logistic_regression_model.pkl')

def train():
    print("Starting ML Model Training Pipeline...")
    
    # Ensure directories exist
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Look for dataset
    # We expect a CSV with 'text' and 'label' (Real/Fake or 1/0)
    # If not found, we will create a dummy one just for demonstration,
    # but the user should place a real dataset like ISOT Fake News Dataset here.
    dataset_path = None
    for file in os.listdir(DATA_DIR):
        if file.endswith('.csv'):
            dataset_path = os.path.join(DATA_DIR, file)
            break
            
    if not dataset_path:
        print("No CSV dataset found in 'data/' folder.")
        print("Creating a small dummy dataset for testing purposes...")
        dummy_data = {
            'text': [
                "The earth is flat and scientists are lying to us.",
                "NASA confirms water exists on Mars.",
                "Vaccines contain microchips to track citizens.",
                "The local government passed a new tax law today.",
                "Aliens have landed in New York City.",
                "Stock market reaches all-time high this week.",
                "Drinking bleach cures all known viruses.",
                "New study shows eating vegetables improves health.",
                "Politician admits to being a lizard person.",
                "Apple announces new iPhone model for next year."
            ],
            'label': ['Fake', 'Real', 'Fake', 'Real', 'Fake', 'Real', 'Fake', 'Real', 'Fake', 'Real']
        }
        df = pd.DataFrame(dummy_data)
        dataset_path = os.path.join(DATA_DIR, 'dummy_dataset.csv')
        df.to_csv(dataset_path, index=False)
        print(f"Created dummy dataset at {dataset_path}")
    else:
        print(f"Found dataset: {dataset_path}")
        df = pd.read_csv(dataset_path)
        
    # Handle Kaggle dataset typo "lable"
    if 'lable' in df.columns and 'label' not in df.columns:
        df = df.rename(columns={'lable': 'label'})
        
    # If there's a title, combine it with text for better context
    if 'title' in df.columns and 'text' in df.columns:
        df['text'] = df['title'].fillna('') + " " + df['text'].fillna('')
        
    if 'text' not in df.columns or 'label' not in df.columns:
        print(f"Error: Dataset must contain 'text' and 'label' columns. Found columns: {list(df.columns)}")
        return
        
    print(f"Dataset loaded. Total records: {len(df)}")
    
    # Drop missing values
    df = df.dropna(subset=['text', 'label'])
    
    # Standardize labels to 'Real' and 'Fake' if they are 1/0
    # Assuming 1 is Real, 0 is Fake in some datasets. Adjust as needed.
    df['label'] = df['label'].replace({1: 'Real', 0: 'Fake', '1': 'Real', '0': 'Fake'})
    
    # Keep only Real and Fake labels
    df = df[df['label'].isin(['Real', 'Fake'])]
    
    print("Preprocessing text data (this may take a while for large datasets)...")
    df['clean_text'] = df['text'].apply(preprocess_text)
    
    # Split data
    X = df['clean_text']
    y = df['label']
    
    print("Splitting data into training and testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Vectorization
    print("Applying TF-IDF Vectorization...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Model Training
    print("Training Logistic Regression Model...")
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_tfidf, y_train)
    
    # Evaluation
    print("Evaluating Model...")
    y_pred = model.predict(X_test_tfidf)
    
    acc = accuracy_score(y_test, y_pred)
    # Map labels to 0 and 1 for precision/recall (Real=1, Fake=0)
    y_test_binary = [1 if label == 'Real' else 0 for label in y_test]
    y_pred_binary = [1 if label == 'Real' else 0 for label in y_pred]
    
    # Only calculate detailed metrics if we have both classes
    if len(set(y_test)) > 1:
        prec = precision_score(y_test_binary, y_pred_binary)
        rec = recall_score(y_test_binary, y_pred_binary)
        f1 = f1_score(y_test_binary, y_pred_binary)
        cm = confusion_matrix(y_test, y_pred, labels=['Real', 'Fake'])
    else:
        prec, rec, f1, cm = 0, 0, 0, "N/A"
        
    print("\n" + "="*40)
    print("MODEL EVALUATION REPORT")
    print("="*40)
    print(f"Accuracy:  {acc * 100:.2f}%")
    if len(set(y_test)) > 1:
        print(f"Precision: {prec * 100:.2f}%")
        print(f"Recall:    {rec * 100:.2f}%")
        print(f"F1 Score:  {f1 * 100:.2f}%")
        print("\nConfusion Matrix (Real, Fake):")
        print(cm)
    print("="*40 + "\n")
    
    # Save Model and Vectorizer
    print("Saving model and vectorizer...")
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved Vectorizer to {VECTORIZER_PATH}")
    print(f"Saved Model to {MODEL_PATH}")
    print("Training Pipeline Completed Successfully!")

if __name__ == "__main__":
    train()
