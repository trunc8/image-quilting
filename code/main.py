from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
import argparse
import textureSynthesis
import textureTransfer
import sys

## Get parser arguments
parser = argparse.ArgumentParser()
parser.add_argument("--synthesis", action="store_true", help="perform synthesis")
parser.add_argument("--transfer", action="store_true", help="perform transfer")
parser.add_argument("-i", "--img_path", type=str, help="path of image you want to quilt")
parser.add_argument("-i1", "--texture_img_path", type=str, help="path of texture image")
parser.add_argument("-i2", "--target_img_path", type=str, help="path of target image")
parser.add_argument("-b", "--block_size", type=int, default=100, help="block size in pixels")
parser.add_argument("-o", "--overlap", type=int, default=20, help="overlap size in pixels")
parser.add_argument("-s", "--scale", type=float, default=2, help="scaling w.r.t. to input image")
parser.add_argument("-t", "--tolerance", type=float, default=0.1, help="tolerance fraction")
parser.add_argument("-a", "--alpha", type=float, default=0.1, help="weightage of target image intensity error wrt texture boundary error")

args = parser.parse_args()

def LoadImage( infilename ) :
    img = Image.open(infilename).convert('RGB')
    data = np.asarray(img)
    return data

def synthesis(args):
    try:
        img = LoadImage(args.img_path)
        img_size = img.shape

        # Get the generated texture
        new_h, new_w = int(args.scale * img_size[0]), int(args.scale * img_size[1])
        # print(img.shape)
        new_img = textureSynthesis.Construct(img, [args.block_size, args.block_size], args.overlap, new_h, new_w, args.tolerance)

        # Save generated image if required
        img_name = args.img_path.split("/")[-1].split(".")[0]
        img_to_save = Image.fromarray(new_img.astype('uint8'), 'RGB')
        img_to_save.save("../results/synthesis/" + img_name + "_b=" + str(args.block_size) + "_o=" + str(args.overlap) + "_t=" + str(args.tolerance) + ".png")
    
    except Exception as e:
        print("Error: ", e)
        sys.exit(1)

def transfer(args):
    try:
        texture_img = LoadImage(args.texture_img_path)
        target_img = LoadImage(args.target_img_path)

        new_img = textureTransfer.Construct(texture_img, target_img, [args.block_size, args.block_size], args.overlap, args.alpha, args.tolerance)

        # Save generated image if required
        texture_img_name = args.texture_img_path.split("/")[-1].split(".")[0]
        target_img_name = args.target_img_path.split("/")[-1].split(".")[0]
        img_to_save = Image.fromarray(new_img.astype('uint8'), 'RGB')
        img_to_save.save("../results/transfer/" + texture_img_name + "_" + target_img_name + "_b=" + str(args.block_size) + "_o=" + str(args.overlap) + "_a=" + str(args.alpha).replace(".", "_") + "_t=" + str(args.tolerance) + ".png")
    except Exception as e:
        print("Error: ", e)
        sys.exit(1)


if __name__ == "__main__":
    if args.synthesis and args.transfer:
        print("Cannot perform synthesis & transfer simultaneously")
        sys.exit(1)
    elif args.synthesis:
        synthesis(args)
    elif args.transfer:
        transfer(args)
