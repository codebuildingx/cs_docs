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

### 易混淆的几种指针相关的写法
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


### C++中static关键字的作用
**c/c++共有**

1）：修饰**全局变量**时，表明一个全局变量只对定义在同一文件中的函数可见。

2）：修饰**局部变量**时，该变量的值只会初始化一次，不会因为函数终止而丢失。但是只能在函数内部使用。  

3）：修饰**函数**时，表明该函数只在同一文件中调用，不能被其他文件调用。

**c++独有：**

4）：修饰类的**数据成员**，表明对该类所有对象共享该数据。

5）：用static修饰**类成员函数**。类成员函数可以直接通过类名+函数名调用，无须新建对象。一个静态成员函数只能访问传入的参数、类的静态数据成员和全局变量。因为static修饰的函数中不能使用this指针。

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

**只是operator new重载的一个版本**。它并不分配内存，只是返回指向已经分配好的某段内存的一个指针。因此不能使用delete关键字删除它，需要**手动调用对象的析构函数**。

如果你想在**已经分配的内存**中创建一个对象，使用new时行不通的。也就是说placement new允许你在一个已经分配好的内存中（栈或者堆中）构造一个新的对象。原型中void* p实际上就是指向一个已经分配好的内存缓冲区的的首地址。

**STL**中常用placement new去指定内存地址创建对象。



### 在A函数里用指针申请好空间后，这块空间需要返回给B函数，然后B函数使用后不再使用这块内存，虽然我们可以手动释放，但往往可能忘记释放，请问用什么方式解决?

可以使用智能指针解决。

下面是一个例子， A1、B1使用的是原生的指针， 如果B1()函数中不手动调用delete，就会造成内存泄漏。 A2、B2使用的是智能指针， B2()中无需手动调用delete。
```cpp
#include <iostream>
#include <string>
#include <memory>

using namespace std;

class Stu
{
public:
    Stu(int age):
        age_(age)
    {

    }
    Stu(const Stu& another)
    {
        age_ = another.age_;
        cout << "call copy constructor" << endl;
    }
    int get_age() const
    {
        return age_;
    }
private:
    int age_;
};

Stu* create_A1(int age)
{
    Stu *stu = new Stu(age);
    return stu;
}

void B1()
{
    Stu* stu_ptr = create_A1(10);
    cout << "student age = " << stu_ptr->get_age() << endl;
    delete stu_ptr;
}

shared_ptr<Stu> create_A2(int age)
{
    shared_ptr<Stu> stu_ptr = make_shared<Stu>(age);
    return stu_ptr;
}

void B2()
{
    shared_ptr<Stu> stu_ptr = create_A2(10);
    cout << "student age = " << stu_ptr->get_age() << endl;
}


int main()
{
    B1();
    B2();
}
```


### 智能指针shared_ptr的循环引用问题

```cpp
#include <memory>
#include <iostream>
class B;
class A {
public:
    std::shared_ptr<B> pointer_B;
    ~A() {
        std::cout << "A已经被删除" << std::endl;
    }
};

class B {
public:
    std::shared_ptr<A> pointer_A;
    ~B() {
        std::cout << "B已经被删除" << std::endl;
    }

};

int main()
{
    {
        std::shared_ptr<A> pointer_A(new A);
        std::shared_ptr<B> pointer_B(new B);
        pointer_A->pointer_B = pointer_B;
        pointer_B->pointer_A = pointer_A;
    }

    return 0;
}
```
![循环引用](https://raw.githubusercontent.com/zgjsxx/static-img-repo/main/website/quick/cpp/loop-reference.drawio.png)


## 类和对象篇

### 构造函数是否可以是虚函数?

不可以。虚函数的调用是通过虚函数表来查找的，而虚函数表由类的实例化对象的vptr指针指向，该指针存放在对象的内部空间中，需要调用构造函数完成初始化。如果构造函数是虚函数，那么调用构造函数就需要去找vptr，但此时vptr还没有初始化。构造函数将无法调用。

### 析构函数是否可以是虚函数?
可以。与构造函数不同，vptr已经完成初始化，析构函数可以声明为虚函数，且类有继承时，析构函数常常必须为虚函数。

### 构造函数是否可以抛出异常?
可以， 但不建议。
### 析构函数是否可以抛出异常?

C++**允许**在析构函数中抛出异常， 但是并**不推荐**在析构函数中抛出异常。

在析构函数中抛出异常，可能会出现下面的问题：

（1）对象正常结束，在析构时，触发析构函数中的异常，打印异常信息，退出。在这种情况下，抛出异常并没有什么问题，析构函数的异常会被外面捕获；当然，如果外面的程序没有继续释放剩余的资源，可能会造成内存泄露。

（2）对象离开作用域之前，抛出异常，此时会调用析构函数，析构函数再抛出异常，此时之前的异常就不能被捕获了，而且会造成程序crash。

因此**尽可能不让异常逃离析构函数**, 可以用try catch吞掉异常。


### 如何禁用拷贝构造函数
- 如果你的编译器支持 C++11，直接使用 delete

- 可以把拷贝构造函数和赋值操作符声明成private同时不提供实现。

- 可以通过一个基类来封装第二步，因为默认生成的拷贝构造函数会自动调用基类的拷贝构造函数，如果基类的拷贝构造函数是private，那么它无法访问，也就无法正常生成拷贝构造函数。


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

### 虚函数的实现原理
![虚函数](https://raw.githubusercontent.com/zgjsxx/static-img-repo/main/website/quick/cpp/virtual_func.drawio.png)

其中：

**B的虚函数表**中存放着```B::foo```和```B::bar```两个函数指针。

**D的虚函数表**中存放的既有继承自B的虚函数```B::foo```，又有重写（override）了基类虚函数```B::bar```的```D::bar```，还有新增的虚函数```D::quz```。

## STL

### vector的扩容机制是怎样的？
当vector的大小和容量相等（size==capacity）也就是满载时，如果再向其添加元素，那么vector就需要扩容。vector容器扩容的过程需要经历以下3步：
- 完全弃用现有的内存空间，重新申请更大的内存空间;
- 将旧内存空间中的数据，按原有顺序移动到新的内存空间中;
- 最后将旧的内存空间释放;

扩容因子由编译器决定，vs的扩容因子为**1.5**，gcc中，扩容因子为**2**。一般认为扩容因子1.5优于2.0，原因是以1.5作为扩容因子可以实现复用释放的内存空间。



### push_back和emplace_back的区别
emplace_back可以传递任意的用户传递进来的参数，**直接在容器的尾部**调用对应的构造函数构造对象，包括**无参构造函数**，**有参构造函数**，**复制构造函数**， **移动构造函数等**。
```cpp
template <class... Args>
void emplace_back (Args&&... args);
```

push_back只能接受左值引用或者右值引用， 它也是**直接在容器的尾部**直接构造对象，但是只会调用到类的**复制构造函数**， **移动构造函数等**。

**注意**：push_back目前已经不会通过先生成临时对象，再复制到容器尾这种低效的方式，它也是通过直接在容器内的尾部地址上直接创建对象。(网上很多文章关于这个点理解不太正确，容易误导人)

可以通过下面的例子看出二者的区别。

```cpp
#include <iostream>
#include <vector>
class A
{
public:
    A () 
    { 
        std::cout << "call A () \n"; 
    }
    A (int a, int b) 
        : a_ (a), 
        b_ (b)
    { 
        std::cout << "call A (int a, int b) \n"; 
    }
    A(const A& other)
    {
        a_ = other.a_;
        b_ = other.b_;
        std::cout << "I am being copy constructed.\n";
    }
    A(A&& other)    
    {  
        a_ = other.a_;
        b_ = other.b_;
        std::cout << "I am being moved.\n";  
    } 

private:
  int a_;
  int b_;
};

int main ()
{
    {
        std::vector<A> vec;
        vec.reserve(4);
        A a(1,2);
        std::cout << "call emplace_back:\n";
        vec.emplace_back();
        vec.emplace_back(1,2);
        vec.emplace_back(a);
        vec.emplace_back(std::move(a));
        std::cout<<"----------------------\n";
    }
    {
        std::vector<A> vec;
        vec.reserve(4);
        A a(1,2);
        std::cout << "call push_back:\n";
        // vec.push_back(); 错误
        // vec.push_back(1,2);错误
        vec.push_back(a);
        vec.push_back(std::move(a));
    }
  return 0;
}
```

执行结果:
```
call A (int a, int b) 
call emplace_back:
call A () 
call A (int a, int b) 
I am being copy constructed.
I am being moved.
----------------------
call A (int a, int b) 
call push_back:
I am being copy constructed.
I am being moved.
```


### vector resize/reserve的区别
**resize**:

resize(n)

如果n大于当前容器的capacity，size修改为n， capacity也变为n。 这个过程中除了会分配空间以外，也会完成对象的构建。

如果n小于当前容器的capacity，size修改为n， capacity不变。


```cpp
#include <iostream>
#include <vector>
using namespace std;
 
int main()
{
    vector<int> v{1,2,3,4,5};
    cout<<"size: "<<v.size()<<endl;
    cout<<"capacity: "<<v.capacity()<<endl;
    
    v.resize(8);
    cout<<"size: "<<v.size()<<endl;
    cout<<"capacity: "<<v.capacity()<<endl;
    v.resize(9);
    cout<<"size: "<<v.size()<<endl;
    cout<<"capacity: "<<v.capacity()<<endl;
    v.resize(5);
    cout<<"size: "<<v.size()<<endl;
    cout<<"capacity: "<<v.capacity()<<endl;
    v.resize(15);
    cout<<"size: "<<v.size()<<endl;
    cout<<"capacity: "<<v.capacity()<<endl;
    return 0;
}
```
执行结果:
```
size: 5
capacity: 5
size: 8
capacity: 10
size: 9
capacity: 10
size: 5
capacity: 10
size: 15
capacity: 15
```
**reserve**: 

reserve(n)

n大于当前容器的capacity时，会改变容器的capacity。这个过程只是分配空间， 不负责构建内容。

当n小于或者等于当前容量时，reserve什么也不做。


### deque容器的原理
![deque](https://raw.githubusercontent.com/zgjsxx/static-img-repo/main/website/quick/cpp/deque.png)
