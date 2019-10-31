from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
import argparse

## Get parser arguments
parser = argparse.ArgumentParser()
parser.add_argument("-i", "--img_path", required=True, type=str, help="path of image you want to quilt")
parser.add_argument("-b", "--block_size", type=int, default=20, help="block size in pixels")
parser.add_argument("-o", "--overlap", type=int, default=4, help="overlap size in pixels")
parser.add_argument("-s", "--scale", type=float, default=4, help="Scaling w.r.t. to input image")
parser.add_argument("-S", "--save", action="store_true")
parser.add_argument("-t", "--tolerance", type=float, default=0.1, help="Tolerance fraction")

args = parser.parse_args()


if name == "__main__":
    img = np.array(Image.open(args.img_path))
    img_size = img.shape

    # Get the generated texture
    new_h, new_w = int(args.scale * img_size[0]), int(args.scale * img_size[1])
    new_img = textureSynthesis(img, args.block_size, args.overlap, new_h, new_w, args.tolerance)

    # Display original & generated texture
    fig, axs = plt.subplots(1, 2)
    axs[0].imshow(img)
    axs[1].imshow(new_img)
    plt.show()

    # Save generated image if required
    if args.save:
        img_to_save = Image.fromarray(new_img.astype('uint8'), 'RGB')
        img_to_save.save("output.png")