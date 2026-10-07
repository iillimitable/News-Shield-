# NewsShield (Hybrid Verification System)

NewsShield is a full-stack, hybrid news-claim verification application. It combines traditional Machine Learning (NLP + Logistic Regression) with real-time web search (Tavily) and Generative AI (Groq) to classify a news claim as `Real`, `Fake`, or `Unverified`.

> **Important:** NewsShield is an assistive verification tool, not an absolute source of truth. AI results and ML predictions can be wrong when evidence is incomplete, outdated, or contradictory. Always evaluate the referenced sources yourself.

## Project Overview

In the era of rapid information spread, fake news has become a significant societal issue. NewsShield attempts to combat this by evaluating a single claim using two distinct approaches:
1. **Machine Learning Analysis:** Uses a trained Natural Language Processing (NLP) model to recognize linguistic patterns common in fake or real news.
2. **Web Evidence Analysis:** Fetches real-time context from the web and uses a large language model to reason about the truthfulness of the claim based purely on recent evidence.

## Problem Statement

Fake news detection relies heavily on context. Static machine learning models (like Logistic Regression trained on past datasets) struggle with novel, breaking news because they lack recent context. Conversely, pure web-search approaches can be easily confused by heavily biased but widely shared articles. NewsShield addresses this problem by combining **Pattern Recognition** (ML) and **Fact Retrieval** (Web + LLM) into a single hybrid pipeline.

## How NewsShield Works

```text
User claim
	|
	v
Express API (/api/verify)
	|
	+--> 1. ML Service (/predict via Python Flask)
	|       |
	|       +--> NLP Preprocessing -> TF-IDF Vectorization -> Logistic Regression
	|       +--> Returns ML Prediction (Real/Fake) & Confidence
	|
	+--> 2. Tavily News Search
	|       |
	|       +--> Retrieves recent source titles, URLs, content, and relevance scores
	|
	+--> 3. Groq AI Analysis
			|
			+--> Analyzes the retrieved web evidence against the claim
			+--> Returns Web Verdict, Reason, and Evidence Scores
					|
					+--> React Dashboard combines and displays both ML and Web results
					+--> MongoDB stores verification history for signed-in users
```

## NLP Pipeline

The NLP pipeline is responsible for cleaning and preparing raw text data for the machine learning model.
The steps include:
- **Lowercase conversion:** Ensuring all text is uniform.
- **Noise Removal:** Removing URLs, special characters, and punctuation.
- **Tokenization:** Splitting sentences into individual words.
- **Stop-word removal:** Filtering out common words (like "the", "is", "in") that don't add significant meaning.
- **Lemmatization:** Reducing words to their base or dictionary form (e.g., "running" becomes "run").

## TF-IDF

**Term Frequency-Inverse Document Frequency (TF-IDF)** is a statistical measure used to evaluate how important a word is to a document in a collection or corpus.
- **Term Frequency (TF):** How frequently a word appears in a document.
- **Inverse Document Frequency (IDF):** Reduces the weight of words that occur very frequently in the dataset and increases the weight of rare words.
This technique converts text into numerical vectors that our machine learning model can understand.

## Logistic Regression

Logistic Regression is a fundamental classification algorithm in machine learning. Despite the name, it is used for classification, not regression. It calculates the probability that a given input belongs to a certain class (e.g., Real or Fake). We use it because it is computationally efficient, interpretable, and performs surprisingly well on binary text classification tasks like fake news detection.

## ML Prediction

The ML prediction is the output of our Logistic Regression model. It provides a classification label (`Real` or `Fake`) and a confidence score based on the probability calculated by the model. This prediction relies *entirely* on patterns learned from the training dataset, without knowing current real-world facts.

## Tavily Evidence Retrieval

To bridge the gap in the ML model's knowledge, NewsShield queries the Tavily Search API. Tavily fetches live, contextually relevant articles, news snippets, and sources directly related to the user's claim.

## Groq AI Analysis

The evidence retrieved by Tavily is sent to Groq AI (using a large language model). The LLM acts as a reasoning engine. It reads the user's claim, reads the collected web evidence, and logically deduces whether the web evidence supports or contradicts the claim.

## Hybrid Verification Architecture

By separating the ML prediction from the Web Evidence verification, NewsShield explicitly highlights conflicts. If the ML model says a claim sounds "Real" (because it uses standard journalistic language), but Groq says it's "Fake" (because the web evidence contradicts it), both results are displayed to the user. The Groq explanation helps clarify *why* the web evidence leads to a specific conclusion.

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Lucide React |
| Backend | Node.js, Express 5, Axios, Mongoose |
| Machine Learning | Python 3, Flask, scikit-learn, pandas, NLTK, joblib |
| Database | MongoDB |
| External APIs | Tavily Search API, Groq Chat Completions API |

## Project Structure

```text
NewsShield-final/
├── ml-service/              # NEW: Python Machine Learning Service
│   ├── data/                # Place your fake news dataset CSV here
│   ├── models/              # Saved model (.pkl) files
│   ├── app.py               # Flask API
│   ├── preprocess.py        # NLP Preprocessing logic
│   ├── train_model.py       # Training pipeline
│   └── requirements.txt     # Python dependencies
├── backend/                 # Node.js + Express API
│   ├── models/
│   │   ├── User.js
│   │   └── Verification.js  # Updated with ML fields
│   ├── server.js            # Updated to call ML Service
│   ├── package.json
│   └── .env                 
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ResultCard.jsx # Updated with ML UI
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   └── ...
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Installation

Clone the repository and install dependencies for all three parts of the application.

### 1. ML Service (Python)
Ensure Python 3.8+ is installed.
```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Backend (Node.js)
```bash
cd backend
npm install
```

### 3. Frontend (React)
```bash
cd frontend
npm install
```

## Dataset

To train the model, you need a labeled fake news dataset. 
Place a CSV file inside `ml-service/data/` (e.g., `dataset.csv`).
The CSV must contain at least two columns:
- `text`: The news content or headline.
- `label`: The classification (`Real` or `Fake`, or `1`/`0`).

*If no dataset is found, `train_model.py` will automatically generate a tiny dummy dataset to ensure the pipeline runs, but a real dataset is required for accurate predictions.*

## Model Training

Before running the ML service, you must train the model and save the vectorizer and classifier:
```bash
cd ml-service
python train_model.py
```
This script will output an evaluation report (Accuracy, Precision, Recall, F1 Score, Confusion Matrix) and save the `.pkl` files in `ml-service/models/`.

## Running the ML Service

Open a terminal and start the Flask API:
```bash
cd ml-service
python app.py
```
The service runs at `http://localhost:5000`.

## Running Backend

Configure `backend/.env`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/newsshield
JWT_SECRET=your_secret
TAVILY_API_KEY=your_tavily_key
GROQ_API_KEY=your_groq_key
ML_SERVICE_URL=http://localhost:5000/predict
```

Open a second terminal:
```bash
cd backend
node server.js
```
The Node API runs at `http://localhost:5001`.

## Running Frontend

Open a third terminal:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

## API Endpoints

### ML Service (Python)
| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `POST` | `/predict` | Returns ML prediction and confidence for given text |

### Backend (Node.js)
| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/verify` | Calls ML service, Tavily, and Groq; combines results |
| `POST` | `/api/history` | Saves hybrid verification record |
| `GET` | `/api/history/:userId` | Retrieves user history |

## Limitations

1. **Static ML Model:** The Logistic Regression model only knows patterns from its training data. It cannot verify recent events (e.g., a news event from today) unless the LLM + Web Search catches it.
2. **Web Search Dependency:** If Tavily cannot find relevant sources, the web verdict defaults to `Unverified`.
3. **LLM Hallucination:** While Groq is constrained by the provided web evidence, LLMs can occasionally misinterpret complex nuances in text.

## Future Scope

- Implement deep learning architectures (like LSTM or BERT) for the ML classification pipeline.
- Implement automated model retraining using a pipeline (e.g., Apache Airflow) to feed newly verified fake news into the training dataset.
- Add multi-language support by upgrading the NLP preprocessing pipeline to handle non-English text.
