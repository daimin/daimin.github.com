title:mysql主从延迟怎么解决

tags:mysql

date:2020-05-28

#### 主从延迟产生的原因：
1. master数据库可以并发写，但是主从复制却是单线程；

2. 复制过去在salve重放的时候，产生了锁等待；

3. 服务器太差或者网络太差；

4. master和slave的负载过高，分配给主从复制的cpu资源过少，跟不上master数据修改的速度；

#### 判断是否产生主从延迟
  通过 show slave status 进行查看，从Seconds_Behind_Master参数的值来判断，是否有发生主从延时。        
  其值有这么几种：

    * NULL - 表示io_thread或是sql_thread有任何一个发生故障，也就是该线程的Running状态是No,而非Yes.
    * 0 - 该值为零，是我们极为渴望看到的情况，表示主从复制状态正常
    * 正值，表示主从延迟已经出现，数据越大表示落后主库越多

  用mk-heartbeat来判断，这个没用过，不做讲解。

#### 解决方法

1. 分库，平摊主库服务器压力；

2. 降低主库的读压力，可以将读全部切换到从库，且增加多个从库，缓解单一从库读负载过高的情况；

3. 开启多线程的主从复制，提高从库的重发速度。（mysql5.6.3已经支持）

4. 加缓存，减少直接请求数据的请求数量；

5. 使用更好的数据硬件；检查网络，主库从库要在同一个子网，且网卡带宽要够；

6. 如果从库数据对可靠性不是要求很高，可以设置从库的sync_binlog=0（0表示MySQL不控制binlog的刷新，由文件系统自己控制它的缓存的刷新；N则是每N次事务，刷新日志到磁盘）。

7. innodb_flush_log_at_trx_commit 参数的调整，innodb引擎受这个参数影像很大。
    * 默认值1的意思是每一次事务提交或事务外的指令都需要把日志写入（flush）硬盘，这是很费时的。mysql崩溃或者系统崩溃都不会丢数据
    * 设成2的意思是事务提交的时候不直接写入硬盘而是先写入操作系统缓存。日志会每秒从缓存flush到硬盘，所以只有系统崩溃或断电才会丢失1秒的数据。
    * 0最快，每次事务提交不会触发写磁盘的操作，而是每秒将日志写入磁盘，所以进程崩溃会丢失1秒数据。

8. 设置从库的slave_net_timeout（读取log失败，多久重试），如果出现了延迟，这个值应该调整。
    master-connect-retry（主库宕机获取连接丢失情况下，从库多久连接一次主库）。  
    这两个参数调整，也能减少主库或者日志发生问题的情况下，恢复同步所隔的时间，降低这种情况所产生的延迟。













