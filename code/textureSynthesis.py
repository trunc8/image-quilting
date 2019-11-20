import numpy as np
from PIL import Image
from minimumCostPathFunc import minimumCostMask 

def Construct(imgArray, blockSize, overlapSize, outSizeX, outSizeY):
    imgArray = np.array(imgArray)
    [m,n,c] = imgArray.shape
    blocks = []
    for i in range(m-blockSize[0]):
        for j in range(n-blockSize[1]):
            #blocks are added to a list
            blocks.append(imgArray[i:i+blockSize[0],j:j+blockSize[1],:])                              
    blocks = np.array(blocks)
    #final image is initialised with elemnts as -1.
    finalImage = np.ones([outSizeX, outSizeY, c])*-1
    finalImage[0:blockSize[0],0:blockSize[1],:] = imgArray[0:blockSize[0],0:blockSize[1],:]
    noOfBlocksInRow = 2 + np.ceil((outSizeX - 2*(blockSize[1] - overlapSize))/(blockSize[1] - 2*overlapSize))
    noOfBlocksInCol = 2 + np.ceil((outSizeY - 2*(blockSize[0] - overlapSize))/(blockSize[0] - 2*overlapSize))
    for i in range(int(noOfBlocksInRow)-1):
        for j in range(int(noOfBlocksInCol)-1):
            if i == 0 and j == 0:
                continue
            #start and end location of block to be filled is initialised
            startX = int(i*(blockSize[0] - overlapSize))
            startY = int(j*(blockSize[1] - overlapSize))
            endX = int(min(startX+blockSize[0],outSizeX))
            endY = int(min(startY+blockSize[1],outSizeY))

            toFill = finalImage[startX:endX,startY:endY,:]
            #MatchBlock returns the best suited block
            matchBlock = MatchBlock(blocks, toFill, blockSize)
            B1EndY = startY+overlapSize-1
            B1StartY = B1EndY-(matchBlock.shape[1])+1
            B1EndX = startX+overlapSize-1
            B1StartX = B1EndX-(matchBlock.shape[0])+1
            if i == 0:      
                overlapType = 'v'
                B1 = finalImage[startX:endX,B1StartY:B1EndY+1,:]
                #print(B1.shape,matchBlock.shape,'v',B1StartY,B1EndY,startX,startY)
                mask = minimumCostMask(matchBlock[:,:,0],B1[:,:,0],0,overlapType,overlapSize)
            elif j == 0:          
                overlapType = 'h'
                B2 = finalImage[B1StartX:B1EndX+1, startY:endY, :]
                #print(B2.shape,matchBlock.shape,B1StartX,B1EndY)
                mask = minimumCostMask(matchBlock[:,:,0],0,B2[:,:,0],overlapType,overlapSize)
            else:
                overlapType = 'b'
                B1 = finalImage[startX:endX,B1StartY:B1EndY+1,:]
                B2 = finalImage[B1StartX:B1EndX+1, startY:endY, :]
                #print(B1.shape,B2.shape,matchBlock.shape)
                mask = minimumCostMask(matchBlock[:,:,0],B1[:,:,0],B2[:,:,0],overlapType,overlapSize)
            mask = np.repeat(np.expand_dims(mask,axis=2),3,axis=2)
            maskNegate = mask==0
            finalImage[startX:endX,startY:endY,:] = maskNegate*finalImage[startX:endX,startY:endY,:]
            finalImage[startX:endX,startY:endY,:] = matchBlock*mask+finalImage[startX:endX,startY:endY,:]
            if endY == outSizeY:
                break
        if endX == outSizeX:
            break
    return finalImage

def SSDError(Bi, toFill): 
    [m,n,p] = toFill.shape
    #blocks to be searched are cropped to the size of empty location
    Bi = Bi[0:m,0:n,0:p]
    #Locations where toFill+1 gives 0 are those where any data is not stored yet. Only those which give greater than 1 are compared for best fit.
    error = np.sum(((toFill+0.99)>0.1)*(Bi - toFill)*(Bi - toFill))
    return [error,Bi]

def MatchBlock(blocks, toFill, blockSize):
    [minError,bestBlock] = SSDError(blocks[0,:,:,:], toFill)
    for i in range(blocks.shape[0]):
        [error,Bi] = SSDError(blocks[i,:,:,:], toFill)
        if minError > error:
            bestBlock = Bi
            minError = error
    return bestBlock


def LoadImage( infilename ) :
    img = Image.open(infilename).convert('RGB')
    data = np.asarray(img)
    return data

def SaveImage( npdata, outfilename ) :
    print(npdata.shape)
    img = Image.fromarray(npdata.astype('uint8')).convert('RGB')
    img.save( outfilename )


# data = LoadImage('t8.png')
# data = np.array(data)
# print(data.shape)
# out = Construct(data, [100,100], 20, 400, 400)
# SaveImage(out,'out.png')







