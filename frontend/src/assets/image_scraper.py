from PIL import Image
import os


def extract_textures(image_path, num_textures, output_folder):
    # Open the image
    img = Image.open(image_path)

    # Get the size of the original image
    img_width, img_height = img.size

    # Calculate the width and height of each individual texture
    texture_width = 384
    texture_height = 270

    # Loop through each texture
    for i in range(num_textures):
        # Define the region to crop
        left = i * texture_width
        upper = 0
        right = left + texture_width
        lower = texture_height

        # Crop the texture
        texture = img.crop((left, upper, right, lower))

        # Save the extracted texture to the output folder
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        texture.save(f"{output_folder}/texture_{i + 1}.png", "PNG")


# Example usage
image_path = "./holds.png"
num_textures = 20
output_folder = "outputs"

extract_textures(image_path, num_textures, output_folder)
