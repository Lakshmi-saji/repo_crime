from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

# ─── Training Data (sample — replace with real dataset) ─────────────────────
TRAINING_DATA = [
    ("wallet stolen purse bag pickpocket shop mall", "Theft"),
    ("stolen car vehicle break hijack", "Theft"),
    ("hit punch beat attack injured hospital", "Assault"),
    ("knife weapon physical attack road fight", "Assault"),
    ("fake cheque fraud scam online deceive money", "Fraud"),
    ("phishing email bank account hack password", "Cybercrime"),
    ("social media hacked data breach ransomware", "Cybercrime"),
    ("shot killed gun murder dead body", "Murder"),
    ("killed stabbed homicide found dead", "Murder"),
    ("armed robbery gun hold up store cash", "Robbery"),
    ("bank robbery forced money threat weapon", "Robbery"),
    ("graffiti paint property damage destruction broke window", "Vandalism"),
    ("drugs seized narcotics sold distribute possession", "Drug Offense"),
    ("arrested with cocaine heroin marijuana dealing", "Drug Offense"),
    ("kidnap abduct child missing ransom", "Kidnapping"),
    ("taken away forcibly hostage restrained", "Kidnapping"),
]

texts, labels = zip(*TRAINING_DATA)

# ─── Model ───────────────────────────────────────────────────────────────────
model = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, stop_words='english')),
    ('clf', MultinomialNB()),
])
model.fit(texts, labels)

CRIME_TYPES = list(set(labels))

def classify_crime(description: str) -> dict:
    """Return predicted crime type and confidence scores."""
    probs = model.predict_proba([description])[0]
    classes = model.classes_
    top_idx = int(np.argmax(probs))
    top_scores = sorted(zip(classes, probs.tolist()), key=lambda x: -x[1])[:3]
    return {
        'predicted_crime_type': classes[top_idx],
        'confidence': round(float(probs[top_idx]) * 100, 1),
        'top_predictions': [{'type': t, 'confidence': round(p * 100, 1)} for t, p in top_scores],
    }

def predict_risk(region: str, fir_count: int) -> dict:
    """Predict regional risk level based on FIR count."""
    if fir_count >= 20:
        level, score = 'High', min(95, 60 + fir_count * 1.5)
    elif fir_count >= 10:
        level, score = 'Medium', min(75, 40 + fir_count * 2)
    elif fir_count >= 5:
        level, score = 'Low-Medium', 35 + fir_count * 2
    else:
        level, score = 'Low', max(5, fir_count * 5)
    return {
        'region': region,
        'risk_level': level,
        'risk_score': round(score, 1),
        'fir_count': fir_count,
        'recommendation': {
            'High': 'Deploy additional patrol units immediately',
            'Medium': 'Increase patrol frequency in the area',
            'Low-Medium': 'Monitor the area closely',
            'Low': 'Maintain standard patrol schedule',
        }[level],
    }
