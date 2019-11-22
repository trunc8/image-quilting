from fastapi import FastAPI, Path, Query
from typing import Dict
from pydantic import BaseModel
from firebase import Firebase
import requests
from PIL import Image
from io import BytesIO
import numpy as np
import textureSynthesis
import textureTransfer
# from starlette.middleware.cors import CORSMiddleware

# origins = [
#     "http://localhost.tiangolo.com",
#     "https://localhost.tiangolo.com",
#     "http:localhost",
#     "http:localhost:8100",
# ]

# Firebase configurations to store images
config = {
  "apiKey": "AIzaSyBfXHrnBU9s4LP4K6DcT5lVn5yVrF3r0i0",
  "authDomain": "texturify-57a0e.firebaseapp.com",
  "databaseURL": "https://texturify-57a0e.firebaseio.com",
  "storageBucket": "texturify-57a0e.appspot.com",
  "serviceAccount": "./texturify-57a0e-firebase-adminsdk-fdaus-84283c9c07.json"
}

firebase = Firebase(config)
auth = firebase.auth()
user = auth.sign_in_with_email_and_password("tezansahu@gmail.com", "test123")
db = firebase.database()
storage = firebase.storage()

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
    alpha: float

app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

def saveImgAndSend(img_path):
    # Store Image in Firebase & return its URL
    storage.child("Results/" + img_path.split("/")[-1]).put(img_path, user['idToken'])
    return storage.child("Results/" + img_path.split("/")[-1]).get_url(user['idToken'])

@app.get("/")
def read_root():
    return "Welcome to TEXTURify RESTful API!"

@app.post("/texture_synthesis/")
def texture_synthesis(synthesis: Synthesis):
    # Get image from URL
    response = requests.get(synthesis.img_url)
    img = np.asarray(Image.open(BytesIO(response.content)))
    new_h, new_w = int(synthesis.scale * img_size[0]), int(synthesis.scale * img_size[1])

    # Run the synthesis algorithm
    newImg = textureSynthesis.Construct(img, [synthesis.block_size, synthesis.block_size], synthesis.overlap, new_h, new_w, synthesis.tolerance)

    # Save the image, upload it to Firebase & send the URL back
    img_to_save = Image.fromarray(new_img.astype('uint8'), 'RGB')
    img_path = "./results_synthesis/result" + str(np.random.randint(0, 1000)) + ".png"
    img_to_save.save(img_path)
    return saveImgAndSend(img_path)

    # return synthesis.img_url

@app.post("/texture_transfer/")
def texture_transfer(transfer: Transfer):
    # Get image from URL
    response = requests.get(transfer.texture_img_url)
    texture_img = np.asarray(Image.open(BytesIO(response.content)))
    response = requests.get(transfer.target_img_url)
    target_img = np.asarray(Image.open(BytesIO(response.content)))
    

    # Run the synthesis algorithm
    newImg = textureTransfer.Construct(texture_img, target_img, [transfer.block_size, transfer.block_size], transfer.overlap, transfer.alpha, transfer.tolerance)

    # Save the image, upload it to Firebase & send the URL back
    img_to_save = Image.fromarray(new_img.astype('uint8'), 'RGB')
    img_path = "./results_transfer/result" + str(np.random.randint(0, 1000)) + ".png"
    img_to_save.save(img_path)
    return saveImgAndSend(img_path)



