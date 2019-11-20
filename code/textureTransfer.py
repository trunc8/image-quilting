import numpy as np
from PIL import Image
from minimumCostPathFunc import minimumCostMask 


def Construct(textureImgArray, targetImgArray, blockSize, overlapSize, alpha):
    textureImgArray = np.array(textureImgArray)
    targetImgArray = np.array(targetImgArray)
    [m,n,c] = textureImgArray.shape
    outSizeX = targetImgArray.shape[1]
    outSizeY = targetImgArray.shape[0]
    blocks = []
    for i in range(m-blockSize[0]):
        for j in range(n-blockSize[1]):
            #blocks are added to a list
            blocks.append(textureImgArray[i:i+blockSize[0],j:j+blockSize[1],:])                              
    blocks = np.array(blocks)
    #final image is initialised with elemnts as -1.
    finalImage = np.ones([outSizeX, outSizeY, c])*-1
    finalImage[0:blockSize[0],0:blockSize[1],:] = textureImgArray[0:blockSize[0],0:blockSize[1],:]
    noOfBlocksInRow = 2 + np.ceil((outSizeX - 2*(blockSize[1] - overlapSize))/(blockSize[1] - 2*overlapSize))
    noOfBlocksInCol = 2 + np.ceil((outSizeY - 2*(blockSize[0] - overlapSize))/(blockSize[0] - 2*overlapSize))
    for i in range(int(noOfBlocksInRow)-1):
        for j in range(int(noOfBlocksInCol)-1):
            # print(i, j)
            if i == 0 and j == 0:
                continue
            #start and end location of block to be filled is initialised
            startX = int(i*(blockSize[0] - overlapSize))
            startY = int(j*(blockSize[1] - overlapSize))
            endX = int(min(startX+blockSize[0],outSizeX))
            endY = int(min(startY+blockSize[1],outSizeY))
            toFill = finalImage[startX:endX,startY:endY,:]
            targetBlock = targetImgArray[startX:endX,startY:endY,:]
            #MatchBlock returns the best suited block
            matchBlock = MatchBlock(blocks, toFill, targetBlock, blockSize, alpha)
            B1EndY = startY+overlapSize-1
            B1StartY = B1EndY-(matchBlock.shape[1])+1
            B1EndX = startX+overlapSize-1
            B1StartX = B1EndX-(matchBlock.shape[0])+1
            if i == 0:      
                overlapType = 'v'
                B1 = finalImage[startX:endX,B1StartY:B1EndY+1,:]
                mask = minimumCostMask(matchBlock[:,:,0],B1[:,:,0],0,overlapType,overlapSize)
            elif j == 0:          
                overlapType = 'h'
                B2 = finalImage[B1StartX:B1EndX+1, startY:endY, :]
                mask = minimumCostMask(matchBlock[:,:,0],0,B2[:,:,0],overlapType,overlapSize)
            else:
                overlapType = 'b'
                B1 = finalImage[startX:endX,B1StartY:B1EndY+1,:]
                B2 = finalImage[B1StartX:B1EndX+1, startY:endY, :]
                mask = minimumCostMask(matchBlock[:,:,0],B1[:,:,0],B2[:,:,0],overlapType,overlapSize)
            mask = np.repeat(np.expand_dims(mask,axis=2),3,axis=2)
            maskNegate = mask==0
            finalImage[startX:endX,startY:endY,:] = maskNegate*finalImage[startX:endX,startY:endY,:]
            finalImage[startX:endX,startY:endY,:] = matchBlock*mask+finalImage[startX:endX,startY:endY,:]
    return finalImage

def SSDError(Bi, toFill, targetBlock, alpha): 
    [m,n,p] = toFill.shape
    #blocks to be searched are cropped to the size of empty location
    Bi = Bi[0:m,0:n,0:p]
    #Locations where toFill+1 gives 0 are those where any data is not stored yet. Only those which give greater than 1 are compared for best fit.
    # print(Bi.shape, toFill.shape, targetBlock.shape)
    error = (1-alpha)*np.sum(((toFill+0.99)>0.1)*(Bi - toFill)*(Bi - toFill)) + alpha*np.sum(((toFill+0.99)>0.1)*(Bi - targetBlock)*(Bi - targetBlock))
    return [error,Bi]

def MatchBlock(blocks, toFill, targetBlock, blockSize, alpha):
    [minError,bestBlock] = SSDError(blocks[0,:,:,:], toFill, targetBlock, alpha)
    for i in range(blocks.shape[0]):
        [error,Bi] = SSDError(blocks[i,:,:,:], toFill, targetBlock, alpha)
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

texture = np.array(LoadImage('../images/t4.jpg'))
target = np.array(LoadImage('../images/lincoln.jpg'))

# print(data.shape)
out = Construct(texture, target, [100,100], 30, 0.5)
SaveImage(out,'output_transfer.png')