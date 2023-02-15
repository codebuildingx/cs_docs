# 操作系统

## 基础题目

### 操作系统的主要功能
一般来说，现代操作系统主要提供下面几种功能

- **进程管理**: 进程管理的主要作用就是任务调度，在单核处理器下，操作系统会为每个进程分配一个任务，进程管理的工作十分简单；而在多核处理器下，操作系统除了要为进程分配任务外，还要解决处理器的调度、分配和回收等问题
- **内存管理**：内存管理主要是操作系统负责管理内存的分配、回收，在进程需要时分配内存以及在进程完成时回收内存，协调内存资源，通过合理的页面置换算法进行页面的换入换出
- **设备管理**：根据确定的设备分配原则对设备进行分配，使设备与主机能够并行工作，为用户提供良好的设备使用界面。
- **文件管理**：有效地管理文件的存储空间，合理地组织和管理文件系统，为文件访问和文件保护提供更有效的方法及手段。
- **提供用户接口**：操作系统提供了访问应用程序和硬件的接口，使用户能够通过应用程序发起系统调用从而操纵硬件，实现想要的功能。

### Linux 进程和线程的区别？
对于线程来讲，其地址空间 mm_struct、目录信息 fs_struct、打开文件列表 files_struct 都是和创建它的任务共享的。

但是对于进程来讲，地址空间 mm_struct、目录信息 fs_struct、打开文件列表 files_struct 都要是独立拥有的，都需要去申请内存并初始化它们。

在 Linux 内核中并没有对线程做特殊处理，还是由 task_struct 来管理。从内核的角度看，用户态的线程本质上还是一个进程。只不过和普通进程比，稍微"轻量"了那么一些。

https://heapdump.cn/article/4683828

### mmap和read/write的区别
mmap() 是通过将**虚拟内存地址**映射到文件的**页缓存(Page Cache)**来实现的。当对映射后的虚拟内存进行读写操作时，其效果等价于直接对文件的**页缓存**进行读写操作。对文件的页缓存进行读写操作，也等价于对文件进行读写操作。

### Linux中进程的状态
|状态|含义|
|-|-|
|TASK_RUNNING|	可运行状态。未必正在使用CPU，也许是在等待调度|
|TASK_INTERRUPTIBLE	|可中断的睡眠状态。正在等待某个条件满足|
|TASK_UNINTERRUPTIBLE	|不可中断的睡眠状态。不会被信号中断|
|__TASK_STOPPED	 |暂停状态。收到某种信号，运行被停止|
|__TASK_TRACED	|被跟踪状态。进程停止，被另一个进程跟踪|
|EXIT_ZOMBIE |	僵尸状态。进程已经退出，但尚未被父进程或者init进程收尸|
|EXIT_DEAD	|真正的死亡状态|

https://quant67.com/post/linux/taskstatus.html

### ps命令中STAT字段的含义
|符号  | 状态 |
|-|-|
|D|      无法中断的休眠状态（通常 IO 的进程）； |
|R|      正在运行可中在队列中可过行的； |
|S|      处于休眠状态； |
|T|      停止或被追踪； |
|W|      进入内存交换 （从内核2.6开始无效）； |
|X|      死掉的进程 （基本很少见）； |
|Z|      僵尸进程； |
|<|      优先级高的进程 |
|N|      优先级较低的进程 |
|L|      有些页被锁进内存；| 
|s|      进程的领导者（在它之下有子进程）； |
|l|      多线程，克隆线程（使用 CLONE_THREAD, 类似 NPTL pthreads）； |
|+|      位于后台的进程组；|

### 如何查看进程的内存分布
```cat /proc/<pid>/maps```和```cat /proc/<pid>/smaps```


### vmstat 中的buffer和cache有什么区别？
Buffer 既可以用作“将要写入磁盘数据的缓存”，也可以用作“从磁盘读取数据的缓存”。

Cache 既可以用作“从文件读取数据的页缓存”，也可以用作“写文件的页缓存”。
这样，我们就回答了案例开始前的两个问题。

简单来说，Buffer 是对磁盘数据的缓存，而 Cache 是文件数据的缓存，它们既会用在读请求中，也会用在写请求中。

https://cloud.tencent.com/developer/article/1844990
### 什么是惊群现象，怎么解决
什么是惊群现象？

以accept为例子， 在Linux2.6版本之前， 如果你创建了一个主进程， 在主进程创建了socket、bind、listen之后，fork()出来多个进程，每个子进程都开始循环处理（accept）这个listen_fd。每个进程都阻塞在accept上，当一个新的连接到来时候，所有的进程都会被唤醒，但是其中只有一个进程会接受成功，其余皆失败，重新休眠。

**对于accept的惊群**， Linux2.6的版本已经解决了，大概的处理方式就是，当内核接收到一个客户连接后，只会唤醒等待队列上的第一个进程（线程）,所以如果服务器采用accept阻塞调用方式，在最新的linux系统中已经没有“惊群效应”了

**对于epoll的惊群**， 依旧存在：
accept确实应该只能被一个进程调用成功，内核很清楚这一点。但epoll不一样，它监听的文件描述符，accept(建连接)，还有可能是其他网络IO事件的，而其他IO事件是否只能由一个进程处理，是不一定的，内核不能保证这一点，这是一个由用户决定的事情，例如可能一个文件会由多个进程来读写。所以，对epoll的惊群，内核则不予处理。

**惊群的解决办法**：

1.加锁， nginx采用ngx_use_accept_mutex来避免惊群。Nginx通过一次仅允许一个进程将 listen fd 放入自己的 epoll 来监听其 READ 事件的方式来达到 listen fd"惊群"避免。

2.SO_REUSEPORT。


### 现代操作系统的分段和分页
https://www.cnblogs.com/xuanyuan/p/15266447.html

### epoll的工作原理
epoll底层实现中有两个关键的数据结构，一个是eventpoll，另一个是epitem。

其中eventpoll中有两个成员变量分别是rbr和rdlist,前者指向一颗红黑树的根，后者指向双向链表的头。

而epitem则是红黑树节点和双向链表节点的综合体，也就是说epitem即可作为树的节点，又可以作为链表的节点，并且epitem中包含着用户注册的事件。

当用户调用epoll_create()时，会创建eventpoll对象（包含一个红黑树和一个双链表）；

而用户调用epoll_ctl(ADD)时，会在eventpoll 结构体中的红黑树红黑树上增加节点（epitem对象）；

接下来，操作系统会默默地在通过epoll_event_callback()来管理eventpoll对象。当有事件被触发时，操作系统则会调用epoll_event_callback函数，将含有该事件的epitem添加到双向链表中。

当用户需要管理连接时，只需通过epoll_wait()从eventpoll对象中的双链表下"摘取"epitem并取出其包含的事件即可。

### 野指针为什么可能导致进程crash?
访问指针的时候，通过查询页表进行虚拟地址向物理地址的映射，当这个地址无效时，就会产生缺页中断，内核中有一个page_fault_handler用于处理该中断，如果野指针指向的地址无效，操作系统就会发送11号信号(SIGSEGV)终止此进程，于是进程异常终止崩溃。


### Linux mmap函数的实现原理
mmap函数会在进程的用户控制中分配一个VMA，并与一个文件相关联。当访问这块内存时， 将会产生缺页中断， 在缺页中断处理函数中，将寻找该文件的页缓存(Page Cache), 通过修改页表， 实现将VMA映射到Page Cache中。

## 进阶题目

### 操作系统PCB(task struct)内有哪些内容
**任务ID**：
```c
pid_t pid;
pid_t tgid;
struct task_struct *group_leader;
```
**亲缘关系**:
```c
struct task_struct __rcu *real_parent; 
struct task_struct __rcu *parent; 
struct list_head children;
struct list_head sibling;
```

**任务状态**:
```c
volatile long state;
int exit_state;
unsigned int flags;
```

**权限**:
```c
const struct cred __rcu         *real_cred;
const struct cred __rcu         *cred;
```
**运行统计**:
```c
u64        utime;//用户态消耗的CPU时间
u64        stime;//内核态消耗的CPU时间
unsigned long      nvcsw;//自愿(voluntary)上下文切换计数
unsigned long      nivcsw;//非自愿(involuntary)上下文切换计数
u64        start_time;//进程启动时间，不包含睡眠时间
u64        real_start_time;//进程启动时间，包含睡眠时间
```

**调度相关**:
```c
//是否在运行队列上
int        on_rq;
//优先级
int        prio;
int        static_prio;
int        normal_prio;
//调度器类
const struct sched_class  *sched_class;
//调度实体
struct sched_entity    se;
//调度策略
unsigned int      policy;
```

**信号处理**:
```c
/* Signal handlers: */
struct signal_struct    *signal;
struct sighand_struct    *sighand;
struct sigpending    pending;
```
**内存管理**:
```c
struct mm_struct                *mm;
struct mm_struct                *active_mm;
```
**文件和文件系统**:
```c
//文件系统信息
struct fs_struct                *fs;
//打开的文件的信息
struct files_struct             *files;
```

**命名空间**:
```c
struct nsproxy *nsproxy;
```