import numpy as np
import logging
from matplotlib import pyplot as plt
import os
import sys
import json
import tensorflow as tf
import cv2
##------------------------------------------------------------------------------------------------
## Global Variables
##------------------------------------------------------------------------------------------------    
gDATADIR = os.path.dirname(os.path.realpath(__file__))
gIMAGE = sys.argv[1]
#gMODELFLAG = int(sys.argv[2])
gELECTRODE = os.path.join(gDATADIR, "electrode.model")
gHARVEST = os.path.join(gDATADIR, "harvest.model")

##------------------------------------------------------------------------------------------------
## Supress logging from tensorflow
##------------------------------------------------------------------------------------------------
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # FATAL
logging.getLogger('tensorflow').setLevel(logging.FATAL)
##------------------------------------------------------------------------------------------------
## Predict Growth
## @param image, image taken from system camera
## @param model flag, 0 = electrode prediction, 1 = harvest prediction
## @return classification
##------------------------------------------------------------------------------------------------  
def PredictGrowth(image, model_flag):
    
    ##------------------------------------------------------------------------------------------------
    ## Find amount of green
    ##------------------------------------------------------------------------------------------------    
    def FindGreen(image):
        light_green = (30,  25,  100)
        dark_green  = (102, 255, 255) 
        
        def createGreenMask(image):
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            mask_green = cv2.inRange(hsv, light_green, dark_green)
            return mask_green

        greenMask = createGreenMask(image)
        return np.sum(greenMask==255)
    
    ##------------------------------------------------------------------------------------------------
    ## Prepare image files
    ##------------------------------------------------------------------------------------------------    
    def prepare(filepath):
        IMG_SIZE = 150
        img_array = cv2.imread(filepath, 1)
        resized_image = cv2.resize(img_array, (IMG_SIZE, IMG_SIZE))
        num_green_pixels = FindGreen(resized_image)
        return num_green_pixels
    
    if model_flag == 2:
        model = tf.keras.models.load_model(gELECTRODE) 
        CATEGORIES = ["NOK","ElectrodesOK"]     
    if model_flag == 1:
        model = tf.keras.models.load_model(gHARVEST) 
        CATEGORIES = ["NOK","HarvestOK"] 
        
    prediction = model.predict([int(prepare(image))])
    growth_class = CATEGORIES[int(np.argmax(prediction,axis=1))]
    return growth_class

prediction1 = PredictGrowth(gIMAGE, 1)
prediction2 = PredictGrowth(gIMAGE, 2)
model_prediction = {'harvest': prediction1, "electrode": prediction2}
final_prediction = json.loads(json.dumps(model_prediction))
print(final_prediction)
