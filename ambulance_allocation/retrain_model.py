import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Read and prepare data
df = pd.read_csv("final_dataset.csv")
df_cleaned = df.dropna()

# Prepare features and target
X = df_cleaned[['user_Latitude', 'user_Longitude', 'amb_latitude', 'amb_longitude', 'Travel Time (mins)', 'Distance (km)']]
y = df_cleaned['allocate']
y = y.map({'yes': 1, 'no': 0})

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.4f}")

# Save model
joblib.dump(model, 'model.pkl')
