
##**************************************************************************************
##**************************************************************************************
##**************************************************************************************
##**************************************************************************************
##************░█▀▀▄░▒█░░░░▒█▀▀█░▒█▀▀▀█░▒█▀▀▄░█▀▀▄░▒█▀▀▀█░▒█░▄▀░▒█▀▀▀░▀▀█▀▀**************
##************▒█▄▄█░▒█░░░░▒█░▄▄░▒█░░▒█░▒█▀▀▄▒█▄▄█░░▀▀▀▄▄░▒█▀▄░░▒█▀▀▀░░▒█░░**************
##************▒█░▒█░▒█▄▄█░▒█▄▄▀░▒█▄▄▄█░▒█▄▄█▒█░▒█░▒█▄▄▄█░▒█░▒█░▒█▄▄▄░░▒█░░**************
##**************************************************************************************
##************************** ▀▄▀▄▀▄GitHub - algobasket▄▀▄▀▄▀ ***************************
##**************************************************************************************
##**************************************************************************************
##************************************************************************************** 

import cv2
import matplotlib.pyplot as plt 
import numpy as np
from scipy.ndimage import generic_filter
import pytesseract
from google.cloud import vision
from google.oauth2 import service_account
import io
import sys 



# Function to get weak pixels by comparing each channel
def getWeak(im, targetChannel, Factor):
    r, g, b = cv2.split(im)  # Split image
    if targetChannel == 0:
        target = r
        mask = (target < Factor * b) * (target < Factor * g)
    elif targetChannel == 1:
        target = g
        mask = (target < Factor * r) * (target < Factor * b)
    elif targetChannel == 2:
        target = b
        mask = (target < Factor * r) * (target < Factor * g)
    else:
        raise Exception("Invalid channel number!\nInput 0 for red, 1 for green, 2 for blue")
    return np.array(mask, dtype=np.uint8)

# Function to fill with mean
def fill_with_mean(image):
    def mean_filter(arr):
        return np.mean(arr)
    mean_filled_image = generic_filter(image, mean_filter, size=4, mode='constant', cval=0.0)
    return mean_filled_image

# Read the image
args = sys.argv[1:]
code = args[0]
im = cv2.cvtColor(cv2.imread("captcha-codes/" + code + "-captcha-a.png"), cv2.COLOR_BGR2RGB)

# Apply bitwise and to get weak pixels 
Numbers = cv2.bitwise_and(im, im, mask=getWeak(im, 2, 1.1) + getWeak(im, 0, 1.1))

# Convert to grayscale
NumbersGray = cv2.cvtColor(Numbers, cv2.COLOR_RGB2GRAY)

# Add contrast to image
NumbersGray[NumbersGray < 50] = 1
NumbersGray[NumbersGray >= 50] = 0

# Apply mean filling
mean_filled_image = fill_with_mean(NumbersGray)

# Plotting
fig, axs = plt.subplots(nrows=3, ncols=1, sharex=True, sharey=True)

axs[2].imshow(mean_filled_image, cmap="gray")

for ax in axs:
    ax.axis("off")

# Save the image displayed in axs[2]
plt.savefig("captcha-b.png") 

# Set the path to your service account key file
key_path = 'service.json'

# Initialize a Vision API client with service account credentials
credentials = service_account.Credentials.from_service_account_file(key_path)
client = vision.ImageAnnotatorClient(credentials=credentials)

# Load the captcha image
with io.open('captcha-b.png', 'rb') as image_file:
    content = image_file.read()    

# Perform OCR on the captcha image
image = vision.Image(content=content)
response = client.text_detection(image=image)
texts = response.text_annotations

if texts:
    # Extract the description from the first annotation
    description = texts[0].description.strip()
    description = ' '.join(description.split()) 
    print(description)  
else:  
    print("No captcha detected")













