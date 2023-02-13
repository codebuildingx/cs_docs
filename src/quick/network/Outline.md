---
category:
- 计算机网络
---

# 计算机网络

## 基础问题

### TCP和UDP的区别

- TCP是面向连接的协议，提供的是可靠传输，在收发数据前需要通过三次握手建立连接，使用ACK对收发的数据进行正确性检验。而UDP是无连接的协议，不管对方有没有收到或者收到的数据是否正确。
- TCP提供可靠的服务；UDP不保证可靠交付。 
- TCP提供流量控制和拥塞控制，而UDP没有。
- TCP对系统资源的要求高于UDP，所以速度也比UDP慢。
- 每一条TCP连接只能是一对一的；UDP支持一对一、一对多、多对一和多对多的通信方式
- TCP面向字节流，把数据看成一连串无结构的字节流；UDP是面向报文的。 (TCP数据包是没有边界的，会出现粘包的问题，UDP包是独立的，不会出现粘包问题。)
- TCP首部开销20字节；UDP的首部开销小，只有8个字节。 

所以在应用方面，如果强调数据的完整性和正确性用TCP，当要求性能和速度的时候，使用UDP更加合适。

注：单凭TCP是不能保证完整性的，要是有黑客伪造TCP包，是无法识别的。

### 服务器出现了大量TIME_WAIT怎么处理?

使用下面的命令可以查看服务器中各种连接的状态
```shell
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```
该语句解释：
- /^tcp/ 表示对每一行进行正则匹配，因为我们netstat会产生udp的行，所以我们要用正则过滤
- ++S[$NF]，就有点类似于，用字典统计文件。比如hello world hello。那么++S[$NF]的结果就是S["hello"] = 2,S["world"] = 1
- for (var in array) 就是数组的遍历
- 最后print a,S[a] 就很容易懂了，就是 2，hello 1,world

可以得到形如下面的结果:
```
TIME_WAIT 814
CLOSE_WAIT 1
FIN_WAIT1 1
ESTABLISHED 634
SYN_RECV 2
LAST_ACK 1
```

常用的三个状态是：ESTABLISHED表示正在通信 、TIME_WAIT表示主动关闭、CLOSE_WAIT表示被动关闭。

**服务器出现大量的TIME_WAIT的场景**:

在高并发短连接的TCP服务器上，当服务器处理完请求后立刻主动正常关闭连接。这个场景下会出现大量socket处于TIME_WAIT状态。如果客户端的并发量持续很高，此时部分客户端就会显示连接不上。

**处理方法：**

后台业务服务器，通常需要调用redis、mysql以及其他http服务和grpc服务，在服务相互调用中，如果使用的是短连接，高并发时就会产生大量TIME_WAIT，如何解决呢？一般情况下，redis等客户端会有连接池，我们要做的是设置好相关的连接服用参数，一般会有连接数、连接重用时间、连接空闲数等。所以在应用中通过设置合理的连接池参数可以避免TIME_WAIT状态过多的问题：

- 1.检查http连接池

- 2.检查grpc连接池

- 3.检查redis连接池

- 4.检查mysql连接池

### 服务器出现大量close_wait的连接的原因以及解决方法

close_wait状态是在TCP四次挥手的时候收到FIN但是没有发送自己的FIN时出现的，服务器出现大量close_wait状态的原因有两种：

- 服务器内部业务处理占用了过多时间，都没能处理完业务；或者还有数据需要发送；或者服务器的业务逻辑有问题，没有执行close()方法
- 服务器的父进程派生出子进程，子进程继承了socket，收到FIN的时候子进程处理但父进程没有处理该信号，导致socket的引用不为0无法回收

**处理方法：**
- 停止应用程序
- 修改程序里的bug

## 进阶问题

### 什么是nagle 算法?

Nagle算法就是为了尽可能发送大块数据，避免网络中充斥着许多小数据块。 Nagle算法的基本定义是任意时刻，最多只能有一个未被确认的小段。 所谓“小段”，指的是小于MSS尺寸的数据块，所谓“未被确认”，是指一个数据块发送出去后，没有收到对方发送的ACK确认该数据已收到。

**Nagle 算法的规则**（可参考 tcp_output.c 文件里 tcp_nagle_check 函数注释）：

- 如果包长度达到 MSS，则允许发送；
- 如果该包含有 FIN，则允许发送；
- 设置了 TCP_NODELAY 选项，则允许发送；
- 未设置 TCP_CORK 选项时，若所有发出去的小数据包（包长度小于 MSS）均被确认，则允许发送；
- 上述条件都未满足，但发生了超时（一般为 200ms），则立即发送。

看如下的例子：

Client端每次发送1个字节，将字符串hello发送到Server端，然后server再全部发送给Client，使用了nagle算法之后结果如下：

- 应用层调用send 5次，由于Nagle算法，HELLO 被分成 2个包发送了，第一次发送了H， 第二次将ELLO合成一个包发送，这样大可以减少Samll packet的数量，增加TCP传输的效率

- 分成的2个数据包，并没有连续被发出，这也符合Nagle算法的原则，即TCP连接上最多只能有一个未被确认的小分组，等待收到ACK之后，才发第二个封包。

**Delay ack 和 Nagle**

PC1和PC2进行通信，PC1发数据给PC2，PC1使用Nagle算法，PC2有delay ACK机制

PC1发送一个数据包给PC2，PC2会先不回应，delay ACK。
PC1再次调用send函数发送小于MSS的数据，这些数据会被保存到Buffer中，等待ACK，才能再次被发送。

从上面的描述看，显然已经死锁了，PC1在等待ACK，PC2在delay ACK，那么解锁的代价就是Delay ACK的Timer到期，至少40ms[40ms~500ms不等]，也就是2种算法在通信的时候，会产生不必要的延时！

**如何避免Delay ack 和 Nagle**

避免使用write-write-read模式。

以发送http请求为例，当http header 和 http body的大小都比较小时， 应合起来一起发送，而不是先发送header，在发送body。 如果client不合起来一起发送，而是先发送header，那么如果服务器端设置delay ack，那么client端就会因为没有收到ack而不能立即发送body，从而造成网络延迟。

**如何禁用Nagle**

linux提供了TCP_NODELAY的选项来禁用Nagle算法。