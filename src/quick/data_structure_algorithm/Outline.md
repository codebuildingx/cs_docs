# 数据结构与算法


## 基础题


### 10亿个数据，从中找出最大的k个数(topK问题)
首先建一个堆，若是求前k个最大的数(降序)就建大堆，反之(升序)建小堆，但此次建堆只建k个数的堆(之前是建N个数的堆)，然后将剩下N-K个数依次去和堆顶的数(根节点)进行比较，如果要比堆顶的数大，则替换堆顶的数，再进行向下调整算法，然后循环依次进行比较，最终，最大的前k个数，就在该堆里面；

https://blog.csdn.net/weixin_43937101/article/details/114880124?share_token=6124cf34-46be-4e0b-9838-2474aa674d24



## 排序算法

### 快速排序
```cpp
### 快速排序
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

void swap(int *a, int *b)
{
	int tmp = *a;
	*a = *b;
	*b = tmp;
}

void dump(int *arr, int size)
{
	int idx;

	for (idx = 0; idx < size; idx++)
		printf("%d,", arr[idx]);
}

void quick_sort(int *arr, int start, int end) {
    int base = arr[start];
    int i = start;
    int j = end;
    int res = 0;

    if(i >= j) return;
    while (i < j) {
        while (i<j && arr[j]>=base) --j;
        while (i<j && arr[i]<=base) ++i;
        if (i < j) 
        {        
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[start], &arr[j]);

    quick_sort(arr, start, j-1);
    quick_sort(arr, j+1, end);
    return;
}

int main()
{
	int test[10] = {5, 8, 9, 23, 67, 1, 3, 7, 31, 56};
    quick_sort(test,0,9);
    dump(test, 10);
	return 0;
}
```

**时间复杂度**

最好O(nlogn) 

最坏O(n2)， 例如9，8，7，6，5，4，3，2，1  ->  1，2，3，4，5，6，7，8，9