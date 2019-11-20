from fastapi import FastAPI, Path, Query
from typing import Dict
from pydantic import BaseModel

class Synthesis(BaseModel):
    img_url: str
    scale: float
    blockSize: int
    overlapSize: int
    tolerance: float

class Transfer(BaseModel):
    texture_img_url: str
    target_img_url: str
    blockSize: int
    overlapSize: int
    tolerance: float

app = FastAPI()

@app.get("/")
def read_root():
    return "Welcome to TEXTURify RESTful API!"

@app.post("/texture_synthesis/")
def texture_synthesis(synthesis: Synthesis):
    # Run the synthesis algorithm
    return synthesis.img_url

@app.post("/texture_transfer/")
def texture_transfer(transfer: Transfer):
    # Run the transfer algorithm
    return transfer.target_img_url



