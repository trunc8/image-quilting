from fastapi import FastAPI, Path, Query
from typing import Dict
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def read_root():
    return "Welcome to TEXTURify RESTful API!"

# @app.get("/symptoms/{q_symptom}")
# def read_all_symptoms(q_symptom: str):
#     if q_symptom == "":
#         return {"symptoms": []}

#     symptoms_list = []
#     for symptom in symptoms.keys():
#         if q_symptom.lower() in symptom.lower():
#             symptoms_list.append(symptom)
#     return {"symptoms": symptoms_list}

