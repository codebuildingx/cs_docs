# 操作系统

## 基础题目

### 什么是惊群现象，怎么解决
什么是惊群现象？

以accept为例子， 在Linux2.6版本之前， 如果你创建了一个主进程， 在主进程创建了socket、bind、listen之后，fork()出来多个进程，每个子进程都开始循环处理（accept）这个listen_fd。每个进程都阻塞在accept上，当一个新的连接到来时候，所有的进程都会被唤醒，但是其中只有一个进程会接受成功，其余皆失败，重新休眠。

**对于accept的惊群**， Linux2.6的版本已经解决了，大概的处理方式就是，当内核接收到一个客户连接后，只会唤醒等待队列上的第一个进程（线程）,所以如果服务器采用accept阻塞调用方式，在最新的linux系统中已经没有“惊群效应”了

**对于epoll的惊群**， 依旧存在：
accept确实应该只能被一个进程调用成功，内核很清楚这一点。但epoll不一样，它监听的文件描述符，accept(建连接)，还有可能是其他网络IO事件的，而其他IO事件是否只能由一个进程处理，是不一定的，内核不能保证这一点，这是一个由用户决定的事情，例如可能一个文件会由多个进程来读写。所以，对epoll的惊群，内核则不予处理。

**惊群的解决办法**：

1.加锁， nginx采用ngx_use_accept_mutex来避免惊群。Nginx通过一次仅允许一个进程将 listen fd 放入自己的 epoll 来监听其 READ 事件的方式来达到 listen fd"惊群"避免。

2.SO_REUSEPORT。

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