import cv2
import numpy as np
from matplotlib import pyplot as plt
import os
import sys

#Model will need to be accessable on the server
gDATADIR = os.path.dirname(os.path.realpath(__file__))
gMODEL = os.path.join(gDATADIR,"model.yml")
gIMAGE = sys.argv[1] #get image passed in
gCOMPLETE = sys.argv[2] #get desired name for saving image
##------------------------------------------------------------------------------------------------
## Background Removal
##------------------------------------------------------------------------------------------------
def BackgroundRemoval(img):
    g_blurred = cv2.GaussianBlur(img, (5,5),0)
    blurred_float = g_blurred.astype(np.float32) / 255.0
    edgeDetector = cv2.ximgproc.createStructuredEdgeDetection(gMODEL)
    edges = edgeDetector.detectEdges(blurred_float) * 255.0

    def SaltPepperNoise(edgeImg):

        count = 0
        lastMedian = edgeImg
        median = cv2.medianBlur(edgeImg, 3)
        while not np.array_equal(lastMedian, median):
            zeroed = np.invert(np.logical_and(median, edgeImg))
            edgeImg[zeroed] = 0
            count = count + 1
            if count > 70:
                break
            lastMedian = median
            median = cv2.medianBlur(edgeImg, 3)

    edges_ = np.asarray(edges, np.uint8)
    SaltPepperNoise(edges_)

    def findSignificantContour(edgeImg):
        contours, hierarchy = cv2.findContours(
            edgeImg,
            cv2.RETR_TREE,
            cv2.CHAIN_APPROX_SIMPLE
        )
        # Find level 1 contours
        level1Meta = []
        for contourIndex, tupl in enumerate(hierarchy[0]):
        # Filter the ones without parent
            if tupl[3] == -1:
                tupl = np.insert(tupl.copy(), 0, [contourIndex])
                level1Meta.append(tupl)
        # From among them, find the contours with large surface area.
        contoursWithArea = []
        for tupl in level1Meta:
            contourIndex = tupl[0]
            contour = contours[contourIndex]
            area = cv2.contourArea(contour)
            contoursWithArea.append([contour, area, contourIndex])

        contoursWithArea.sort(key=lambda meta: meta[1], reverse=True)
        largestContour = contoursWithArea[0][0]
        return largestContour

    contour = findSignificantContour(edges_)
    # Draw the contour on the original image
    contourImg = np.copy(img)
    cv2.drawContours(contourImg, [contour], 0, (0, 255, 0), 2, cv2.LINE_AA, maxLevel=1)
    
    mask = np.zeros_like(edges_)
    cv2.drawContours(mask, [contour], 0, 255, -1)
    out = np.zeros_like(img) # Extract out the object and place into output image
    out[mask == 255] = img[mask == 255]

    return out

##------------------------------------------------------------------------------------------------
## Glare Removal
##------------------------------------------------------------------------------------------------    
def GlareRemoval(image):
    light_white = (0,   0,  200)
    dark_white  = (145, 60, 255)    
    def createGlareMask(image):
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        mask_white = cv2.inRange(hsv, light_white, dark_white)
        return mask_white
     
    inpaintMask = createGlareMask(image)
    final_img = cv2.inpaint(image, inpaintMask, 0.5, cv2.INPAINT_NS)   
    return final_img

img = cv2.imread(gIMAGE, 1)

background = BackgroundRemoval(img)
glare = GlareRemoval(background)

cv2.imwrite(gCOMPLETE, glare)
