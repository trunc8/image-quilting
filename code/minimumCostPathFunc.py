
import copy
import math
import numpy as np

def minimumCostPathOnArray(arr):
    """
    Standard array 'arr' is traversed top to bottom in minimum cost path
    Return value: arr_mask
    """
    arr_mask = np.ones(np.array(arr).shape)

    rows = len(arr)
    cols = len(arr[0])

    for i in range(1,rows):
        arr[i][0] = arr[i][0] + min(arr[i-1][0], arr[i-1][1])
        for j in range(1, cols-1):
            arr[i][j] = arr[i][j] + min(arr[i-1][j-1], arr[i-1][j], arr[i-1][j+1])
        arr[i][cols-1] = arr[i][cols-1] + min(arr[i-1][cols-2], arr[i-1][cols-1])

    min_index = [0]*rows
    min_cost = min(arr[-1])
    for k in range(1,cols-1):
        if arr[-1][k] == min_cost:
            min_index[-1] = k

    for i in range(rows-2, -1, -1):
        j = min_index[i+1]
        lower_bound = 0
        upper_bound = 1 # Bounds for the case j=1
        
        if j==cols-1:
            lower_bound = cols-2
            upper_bound = cols-1
        elif j>0:
            lower_bound = j-1
            upper_bound = j+1
        
        min_cost = min(arr[i][lower_bound:upper_bound+1])
        for k in range(lower_bound, upper_bound+1):
            if arr[i][k] == min_cost:
                min_index[i] = k


    path = []
    for i in range(0, rows):
        arr_mask[i,0:min_index[i]] = np.zeros(min_index[i])
        path.append((i+1, min_index[i]+1))
    # print("Minimum cost path is: ")
    # print(path)
    return arr_mask

def minimumCostMask(Ref, B1, B2, overlap_type, overlap_size):
    """
    B1, B2, Ref are numpy arrays
    B1 and B2 are already present, we're trying to add Ref
    Regions of overlap will have best of Ref and other block
    To highlight the parts of Ref lost, the numpy.ones() array
    ref_mask will denote those pixels as 0.
    Placement is as follows:
        __ B2
        B1 Ref
    overlap_type: Type of overlap
    overlap_size: Number of layers to overlap
    Return value: ref_mask
    """
    ref_mask = np.ones(Ref.shape)
    #vertical
    if overlap_type=='v':
        arr = np.power(B1[:,-overlap_size:]-Ref[:,0:overlap_size], 2).tolist()
        ref_mask[:,0:overlap_size] = minimumCostPathOnArray(arr)

    #horizontal
    elif overlap_type=='h':
        arr = np.power(B2[-overlap_size:, :]-Ref[0:overlap_size, :], 2)
        arr = arr.transpose()
        arr = arr.tolist()
        ref_mask[0:overlap_size,:] = minimumCostPathOnArray(arr).transpose()
    #both
    elif overlap_type=='b':
        # Vertical overlap
        arrv = np.power(B1[:,-overlap_size:]-Ref[:,0:overlap_size], 2).tolist()
        ref_mask[:,0:overlap_size] = minimumCostPathOnArray(arrv)
        # Horizontal overlap
        arrh = np.power(B2[-overlap_size:, :]-Ref[0:overlap_size, :], 2)
        arrh = arrh.transpose()
        arrh = arrh.tolist()
        ref_mask[0:overlap_size,:] = ref_mask[0:overlap_size,:]*(minimumCostPathOnArray(arrh).transpose())
        # To ensure that 0's from previous assignment to ref_mask remain 0's
    else:
        print("Error in min path")

    return ref_mask


# Uncomment below lines to run this as stand-alone file

#arr = np.random.rand(15,15)
#print(minimumCostMask(arr, arr, arr, 'b', 7))