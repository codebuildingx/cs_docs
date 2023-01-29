# 操作系统

## 野指针为什么可能导致进程crash?
访问指针的时候，通过查询页表进行虚拟地址向物理地址的映射，当这个地址无效时，就会产生缺页中断，内核中有一个page_fault_handler用于处理该中断，如果野指针指向的地址无效，操作系统就会发送11号信号(SIGSEGV)终止此进程，于是进程异常终止崩溃。

## 操作系统PCB(task struct)内有哪些内容
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