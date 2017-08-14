title:python协程使用

tag:python,协程

date:2015-03-10

协程是一种比线程更轻量级的执行体。它不是有系统内核控制调度，而是自己协同调度。Python通过yield提供了对协程的基本支持，但是不完全。而第三方的gevent为Python提供了比较完善的协程支持。

    from gevent import monkey
    # 由于切换是在IO操作时自动完成，所以gevent需要修改Python自带的一些标准库，这一过程在启动时通过monkey
    monkey.patch_socket()
    import gevent

    def f(n):
        for i in range(n):
            print gevent.getcurrent(), i
            gevent.sleep(0) # 要想协程起作用，可以通过gevent.sleep()交出控制权


    g1 = gevent.spawn(f, 5)
    g2 = gevent.spawn(f, 5)
    g3 = gevent.spawn(f, 5)

    g1.join()
    g2.join()
    g3.join()
    
    output:
    <Greenlet at 0x10bc44c30: f(5)> 0
    <Greenlet at 0x10bd600f0: f(5)> 0
    <Greenlet at 0x10bd60190: f(5)> 0
    <Greenlet at 0x10bc44c30: f(5)> 1
    <Greenlet at 0x10bd600f0: f(5)> 1
    <Greenlet at 0x10bd60190: f(5)> 1
    <Greenlet at 0x10bc44c30: f(5)> 2
    <Greenlet at 0x10bd600f0: f(5)> 2
    <Greenlet at 0x10bd60190: f(5)> 2
    <Greenlet at 0x10bc44c30: f(5)> 3
    <Greenlet at 0x10bd600f0: f(5)> 3
    <Greenlet at 0x10bd60190: f(5)> 3
    <Greenlet at 0x10bc44c30: f(5)> 4
    <Greenlet at 0x10bd600f0: f(5)> 4
    <Greenlet at 0x10bd60190: f(5)> 4
    
可以看到协程的交替运行了。

在实际的使用中，我们不需要使用gevent.sleep去控制，而是在遇到io时候，gevent会自动控制。

    from gevent import monkey
    # 由于切换是在IO操作时自动完成，所以gevent需要修改Python自带的一些标准库，这一过程在启动时通过monkey
    monkey.patch_socket()
    import gevent
    import urllib2

    def f(url):
        print 'GET: %s' % url
        resp = urllib2.urlopen(url)
        data = resp.read()
        print '%d bytes received from %s.' % (len(data), url)


    gevent.joinall([
        gevent.spawn(f, 'http://www.baidu.com/'),
        gevent.spawn(f, 'http://www.taobao.com/'),
        gevent.spawn(f, 'http://www.163.com/'),
    ])
    
    output:
    GET: http://www.baidu.com/
    GET: http://www.taobao.com/
    GET: http://www.163.com/
    46944 bytes received from http://www.taobao.com/.
    88998 bytes received from http://www.baidu.com/.
    662118 bytes received from http://www.163.com/.
    
可以看出在同一个进程中执行，但是顺序却不同了，可见网络io的时候是并发执行的。