# trunc8
import copy
import math

arr = [[ 0.26045197,  0.66184973,  0.79957904,  0.82613958,  0.39644677],
       [ 0.09284838,  0.59098542,  0.13045167,  0.06170584,  0.01265676],
       [ 0.16456109,  0.87820099,  0.79891448,  0.02966868,  0.27810629],
       [ 0.03037986,  0.31481138,  0.06477025,  0.37205248,  0.59648463],
       [ 0.08084797,  0.10305354,  0.72488268,  0.30258304,  0.230913  ]]

arr2 = copy.deepcopy(arr)

rows = len(arr)
cols = len(arr[0])
print(rows, "\t", cols)

for i in arr:
    print(i)

for i in range(1,rows):
    # print("first: ", 0)
    arr2[i][0] = arr2[i][0] + min(arr2[i-1][0], arr2[i-1][1])
    for j in range(1, cols-1):
        arr2[i][j] = arr2[i][j] + min(arr2[i-1][j-1], arr2[i-1][j], arr2[i-1][j+1])
    # print("last: ", cols-1)
    arr2[i][cols-1] = arr2[i][cols-1] + min(arr2[i-1][cols-2], arr2[i-1][cols-1])

print("Minimum cost array is: ")
for i in arr2:
    print(i)

min_index = [0]*rows
min_cost = min(arr2[-1])
for k in range(1,cols-1):
    if arr2[-1][k] == min_cost:
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
    
    min_cost = min(arr2[i][lower_bound:upper_bound+1])
    for k in range(lower_bound, upper_bound+1):
        if arr2[i][k] == min_cost:
            min_index[i] = k


path = []
for i in range(0, rows):
    path.append((i+1, min_index[i]+1))
print("Minimum cost path is: ")
print(path)