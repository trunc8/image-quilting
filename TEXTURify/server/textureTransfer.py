import numpy as np
from PIL import Image
from minimumCostPathFunc import minimumCostMask 


def Construct(textureImgArray, targetImgArray, blockSize, overlapSize, alpha, tolerance):
    textureImgArray = np.array(textureImgArray)
    targetImgArray = np.array(targetImgArray)
    # print(textureImgArray.shape, targetImgArray.shape)
    outSizeX = targetImgArray.shape[0]
    outSizeY = targetImgArray.shape[1]
    [m,n,c] = textureImgArray.shape
    blocks = []
    for i in range(m-blockSize[0]):
        for j in range(n-blockSize[1]):
            #blocks are added to a list
            blocks.append(textureImgArray[i:i+blockSize[0],j:j+blockSize[1],:])                              
    blocks = np.array(blocks)
    #final image is initialised with elemnts as -1.
    finalImage = np.ones([outSizeX, outSizeY, c])*-1
    finalImage[0:blockSize[0],0:blockSize[1],:] = textureImgArray[0:blockSize[0],0:blockSize[1],:]
    noOfBlocksInRow = 1+np.ceil((outSizeX - blockSize[1])*1.0/(blockSize[1] - overlapSize))
    noOfBlocksInCol = 1+np.ceil((outSizeY - blockSize[0])*1.0/(blockSize[0] - overlapSize))
    for i in range(int(noOfBlocksInRow)):
        for j in range(int(noOfBlocksInCol)):
            if i == 0 and j == 0:
                continue
            #start and end location of block to be filled is initialised
            startX = int(i*(blockSize[0] - overlapSize))
            startY = int(j*(blockSize[1] - overlapSize))
            endX = int(min(startX+blockSize[0],outSizeX))
            endY = int(min(startY+blockSize[1],outSizeY))
            # print(startX, endX, startY, endY)

            toFill = finalImage[startX:endX,startY:endY,:]
            targetBlock = targetImgArray[startX:endX,startY:endY,:]

            
            if targetBlock.shape != blocks.shape[1:]:
                blocks1 = []
                for x in range(m - targetBlock.shape[0]):
                    for y in range(n - targetBlock.shape[1]):
                        blocks1.append(textureImgArray[x:x+targetBlock.shape[0],y:y+targetBlock.shape[1],:]) 
                blocks1 = np.array(blocks1)
                matchBlock = MatchBlock(blocks1, toFill, targetBlock, blockSize, alpha, tolerance)
            # print(toFill.shape, targetBlock.shape)
            #MatchBlock returns the best suited block
            else:
                matchBlock = MatchBlock(blocks, toFill, targetBlock, blockSize, alpha, tolerance)
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

            completion = 100.0/noOfBlocksInRow*(i + j*1.0/noOfBlocksInCol);
            print("{0:.2f}% complete...".format(completion), end="\r", flush=True)

            if endY == outSizeY:
                break
        if endX == outSizeX:
            print("100% complete!", end="\r", flush = True)
            break
    return finalImage

def SSDError(Bi, toFill, targetBlock, alpha): 
    [m,n,p] = toFill.shape
    #blocks to be searched are cropped to the size of empty location
    Bi = Bi[0:m,0:n,0:p]
    #Locations where toFill+1 gives 0 are those where any data is not stored yet. Only those which give greater than 1 are compared for best fit.
    # print(Bi.shape, toFill.shape, targetBlock.shape)
    lum_Bi = np.sum(Bi, axis = 2)*1.0/3
    lum_target = np.sum(targetBlock, axis = 2)*1.0/3
    lum_toFill = np.sum(toFill, axis = 2)*1.0/3
    error = alpha*np.sqrt(np.sum(((toFill+0.99)>0.1)*(Bi - toFill)*(Bi - toFill))) + (1-alpha)*np.sqrt(np.sum(((lum_toFill+0.99)>0.1)*(lum_Bi - lum_target)*(lum_Bi - lum_target)))
    return [error]

def MatchBlock(blocks, toFill, targetBlock, blockSize, alpha, tolerance):
    error = []
    [m,n,p] = toFill.shape
    bestBlocks = []
    # count = 0
    for i in range(blocks.shape[0]):
        #blocks to be searched are cropped to the size of empty location
        Bi = blocks[i,:,:,:]
        Bi = Bi[0:m,0:n,0:p]
        error.append(SSDError(Bi, toFill, targetBlock, alpha))
    minVal = np.min(error)
    bestBlocks = [block[:m, :n, :p] for i, block in enumerate(blocks) if error[i] <= (1.0+tolerance)*minVal]
    # for i in range(blocks.shape[0]):
    #     if error[i] <= (1.0+tolerance)*minVal:
    #         block = blocks[i,:,:,:]
    #         bestBlocks.append(block[0:m,0:n,0:p])
    #         count = count+1
    c = np.random.randint(len(bestBlocks))
    return bestBlocks[c]
    
    
    # [minError,bestBlock] = SSDError(blocks[0,:,:,:], toFill, targetBlock, alpha)
    # for i in range(blocks.shape[0]):
    #     [error,Bi] = SSDError(blocks[i,:,:,:], toFill, targetBlock, alpha)
    #     if minError > error:
    #         bestBlock = Bi
    #         minError = error
    # return bestBlock

# def LoadImage( infilename ) :
#     img = Image.open(infilename).convert('RGB')
#     data = np.asarray(img)
#     return data

# def SaveImage( npdata, outfilename ) :
#     print(npdata.shape)
#     img = Image.fromarray(npdata.astype('uint8')).convert('RGB')
#     img.save( outfilename )

# texture = np.array(LoadImage('../images/scribble.jpg'))
# target = np.array(LoadImage('../images/tendulkar.jpg'))

# # print(data.shape)
# out = Construct(texture, target, [15, 15], 5, 0.1, 0.1)
# SaveImage(out,'../results/transfer/scribble_tendulkar_b15_o5_a0_1.png')