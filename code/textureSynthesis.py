import numpy as np
from PIL import Image
from minimumCostPathFunc import minimumCostMask 

def Construct(imgArray, blockSize, overlapSize, outSizeX, outSizeY, tolerance):
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
    # finalImage[0:blockSize[0],0:blockSize[1],:] = imgArray[0:blockSize[0],0:blockSize[1],:]
    finalImage[0:blockSize[0],0:blockSize[1],:] = blocks[np.random.randint(len(blocks))]
    noOfBlocksInRow = 1 + np.ceil((outSizeX - blockSize[1])*1.0/(blockSize[1] - overlapSize))
    noOfBlocksInCol = 1 + np.ceil((outSizeY - blockSize[0])*1.0/(blockSize[0] - overlapSize))
    for i in range(int(noOfBlocksInRow)):
        for j in range(int(noOfBlocksInCol)):
            if i == 0 and j == 0:
                continue
            #start and end location of block to be filled is initialised
            startX = int(i*(blockSize[0] - overlapSize))
            startY = int(j*(blockSize[1] - overlapSize))
            endX = int(min(startX+blockSize[0],outSizeX))
            endY = int(min(startY+blockSize[1],outSizeY))

            toFill = finalImage[startX:endX,startY:endY,:]
            #MatchBlock returns the best suited block
            matchBlock = MatchBlock(blocks, toFill, blockSize, tolerance)
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
            finalImage[startX:endX,startY:endY,:] = maskNegate*toFill
            finalImage[startX:endX,startY:endY,:] = matchBlock*mask+toFill
            completion = 100.0/noOfBlocksInRow*(i + j*1.0/noOfBlocksInCol);

            print("{0:.2f}% complete...".format(completion), end="\r", flush=True)
            if endY == outSizeY:
                break

        if endX == outSizeX:
            print("100% complete!\n")
            break
    return finalImage

def SSDError(Bi, toFill): 
    error = np.sum(((toFill+0.99)>0.1)*(Bi - toFill)*(Bi - toFill))
    return [error]

def MatchBlock(blocks, toFill, blockSize, tolerance):   
    error = []
    [m,n,p] = toFill.shape
    bestBlocks = []
    # count = 0
    for i in range(blocks.shape[0]):
        #blocks to be searched are cropped to the size of empty location
        Bi = blocks[i,:,:,:]
        Bi = Bi[0:m,0:n,0:p]
        error.append(SSDError(Bi, toFill))
    minVal = np.min(error)
    bestBlocks = [block[:m, :n, :p] for i, block in enumerate(blocks) if error[i] <= (1.0+tolerance)*minVal]
    # for i in range(blocks.shape[0]):
    #     if error[i] <= (1.0+tolerance)*minVal:
    #         block = blocks[i,:,:,:]
    #         bestBlocks.append(block[0:m,0:n,0:p])
    #         count = count+1
    c = np.random.randint(len(bestBlocks))
    return bestBlocks[c]



# def SaveImage( npdata, outfilename ) :
#     print(npdata.shape)
#     img = Image.fromarray(npdata.astype('uint8')).convert('RGB')
#     img.save( outfilename )
