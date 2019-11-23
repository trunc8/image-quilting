# Image Quilting for Texture Synthesis & Transfer

### Course Project for CS663

***

Implementation of Texture Synthesis and Texture Transfer using Image Quilting. Based on the work of Alexei Efros and William Freeman. 

## Usage

First, clone this repository using `git clone https://github.com/tezansahu/ImageQuilting.git`

#### CLI Tool:
To use the CLI tool associated with our project do the following:

* `cd code/`
* To perform Texture Synthesis use: `python3 main.py --synthesis -i <texture_img> -b <block_size> -o <overlap_size> -t <tolerance>`
* To perform Texture Transfer use: `python3 main.py --transfer -i1 <texture_img> -i2 <target_img> -b <block_size> -o <overlap_size> -t <tolerance> -a <alpha>`

For more details, use `python3 main.py -h`

#### TEXTURify Cross-Platform App:
Go into the TEXTURify directory using `cd TEXTURify/`

To set up the **FastAPI Server**, do the following:
```
cd server/
pip3 install -r requirements.txt
uvicorn texturify_api:app --reload
```
The server would start running on `localhost:8000`

Now, to set up the **Ionic App**, spin up a new terminal & type `ionic serve` *[After installing ionic using `npm`]*

This starts the app on `localhost:8100`.

Disable CORS on your browser (using some extension) and start playing with the app.

## Results

#### Some Results for Texture Synthesis
| **Input Image** | **Synthesized Texture**|
|:--:|:--:|
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t20.png) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/synthesis/t20_b=40_o=20_t=0_1.png) |
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t11.png) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/synthesis/t11_b=50_o=20_t=0_1.png) |
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t17.jpeg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/synthesis/t17_b=50_o=20_t=0_1.png) |
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t14.jpg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/synthesis/t14_b=50_o=20_t=0_1.png) |
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t1.png) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/synthesis/t1_b=50_o=20.png) |
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t16.png) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/synthesis/t16_b=50_o=20_t=0_1.png) |


#### Some Results for Texture Transfer

| **Target Image** | **Texture Image** | **Result** |
|:--:|:--:|:--:|
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/landscape.jpeg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/van_gogh.jpeg) | ![](https://raw.github.com/tezansahu/ImageQuilting/master/results/transfer/van_gogh_landscape_b=10_o=5_a=0_2_t=0_1.png)|
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/tezan.jpg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/painting.jpg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/results/transfer/painting_tezan_b=10_o=5_a=0_2_t=0_1.png)|
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/lincoln.jpg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/t4.jpg) | ![](https://raw.github.com/tezansahu/ImageQuilting/master/results/transfer/t4_lincoln_b=10_o=5_a=0_2_t=0_1.png)|
| ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/tendulkar.jpg) | ![](https://raw.githubusercontent.com/tezansahu/ImageQuilting/master/images/scribble.png) | ![](https://raw.github.com/tezansahu/ImageQuilting/master/results/transfer/scribble_tendulkar_b=20_o=10_a=0_2_t=0_05.png)|

***
<p align='center'>Created with :heart: by <a href="https://www.linkedin.com/in/tezan-sahu/">Tezan Sahu</a>, <a href="https://www.linkedin.com/in/sahasiddharth611/">Siddharth Saha</a> & <a href="https://www.linkedin.com/in/saavi-yadav-7ab61a151/">Saavi Yadav</a></p>

