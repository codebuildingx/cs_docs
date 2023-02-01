---
category:
  - C++
---

# c++面经
## c++基础

### c++内存模型

C++内存分为5个区域（堆栈全常代)

**堆 heap** ：
由new分配的内存块，其释放编译器不去管，由我们程序自己控制（一个new对应一个delete）。如果程序员没有释放掉，在程序结束时OS会自动回收。涉及的问题：“缓冲区溢出”、“内存泄露”

**栈 stack** ：
是那些编译器在需要时分配，在不需要时自动清除的存储区。存放局部变量、函数参数。
存放在栈中的数据只在当前函数及下一层函数中有效，一旦函数返回了，这些数据也就自动释放了。

**全局/静态存储区 （.bss段和.data段）** ：
全局和静态变量被分配到同一块内存中。在C语言中，未初始化的放在.bss段中，初始化的放在.data段中；在C++里则不区分了。

**常量存储区 （.rodata段）** ：
存放常量，不允许修改（通过非正当手段也可以修改）

**代码区 （.text段）** ：
存放代码（如函数），不允许修改（类似常量存储区），但可以执行（不同于常量存储区）

### 区别以下指针类别
```cpp
int *p[10]
int (*p)[10]
int *p(int)
int (*p)(int)
```
int *p[10]表示指针数组，强调数组概念，是一个数组变量，数组大小为10，数组内每个元素都是指向int类型的指针变量。

int (*p)[10]表示数组指针，强调是指针，只有一个变量，是指针类型，不过指向的是一个int类型的数组，这个数组大小是10。

int *p(int)是函数声明，函数名是p，参数是int类型的，返回值是int *类型的。

int (*p)(int)是函数指针，强调是指针，该指针指向的函数具有int类型参数，并且返回值是int类型的。


## 如何禁用拷贝构造
- 如果你的编译器支持 C++11，直接使用 delete

- 可以把拷贝构造函数和赋值操作符声明成private同时不提供实现。

- 可以通过一个基类来封装第二步，因为默认生成的拷贝构造函数会自动调用基类的拷 贝构造函数，如果基类的拷贝构造函数是 private，那么它无法访问，也就无法正常 生成拷贝构造函数。

### new、operator new与placement new区别是什么?

**new**：

new是一个关键字，不能被重载。

new 操作符的执行过程如下：
1. 调用operator new分配内存 ；
2. 调用构造函数生成类对象；
3. 返回相应指针。

**operator new**：

operator new就像operator + 一样，是**可以重载**的。如果类中没有重载operator new，那么调用的就是**全局的::operator new**来完成堆的分配。同理，operator new[]、operator delete、operator delete[]也是可以重载的。

**placement new**：

**只是operator new重载的一个版本**。它并不分配内存，只是返回指向已经分配好的某段内存的一个指针。因此不能使用delete关键字删除它，需要手动调用对象的析构函数。

如果你想在**已经分配的内存**中创建一个对象，使用new时行不通的。也就是说placement new允许你在一个已经分配好的内存中（栈或者堆中）构造一个新的对象。原型中void* p实际上就是指向一个已经分配好的内存缓冲区的的首地址。

STL中常用placement new去指定内存地址创建对象。



## 类和对象篇

### const成员方法中如果要修改成员变量的值，要怎么做？
- 方法1：使用mutable关键字
```cpp
#include <iostream>
using namespace std;

class A 
{
public:
    A(int m):
      m_(m)
    {

    }
    void const_set(int i) const
    {
        m_ = i;
    }
    int get_val() const 
    {
        return m_;
    }
private:
    mutable int m_;
};

int main()
{
    A a(1);
    a.const_set(2);
    cout << "a value = " << a.get_val() << endl;
}
```
- 方法2：const成员函数中的this指针是被增加了const属性的， 可以强制类型转换去掉const。
```cpp
#include <iostream>
using namespace std;

class A 
{
public:
    A(int m):
      m_(m)
    {

    }
    void const_set(int i) const
    {
        const_cast<A*>(this)->m_ = i;
    }
    int get_val() const 
    {
        return m_;
    }
private:
    int m_;
};

int main()
{
    A a(1);
    a.const_set(2);
    cout << "a value = " << a.get_val() << endl;
}
```
## STL