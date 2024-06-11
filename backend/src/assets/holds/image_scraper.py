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

    # Calculate the number of rows and columns in the texture matrix
    num_rows = num_textures // 5
    num_cols = 5

    # Loop through each row and column
    for row in range(num_rows):
        for col in range(num_cols):
            # Define the region to crop
            left = col * texture_width
            upper = row * texture_height
            right = left + texture_width
            lower = upper + texture_height

            # Crop the texture
            texture = img.crop((left, upper, right, lower))

            # Save the extracted texture to the output folder
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)
            texture.save(f"{output_folder}/texture_{row*num_cols + col}.png", "PNG")


# Example usage
image_path = "./holds.png"
num_textures = 20
output_folder = "."

extract_textures(image_path, num_textures, output_folder)
