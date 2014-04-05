title:coreseek(sphinx)分布式设置

tags:coreseek,sphinx,distributed

date:2014-03-31

sphinx默认是单线程的，无论你是多少核的服务器，它始终只会使用一个核心。
有两个办法可以实现sphinx多核利用，两种都是使用sphinx的分布式设置。

### 1. 使用agent，远程索引声明

* 建立一个分布式索引，这个索引不会用来存储数据，只是用来合并查询数据，提供客户端调用而已
* 设置分布式索引的type=distributed
* 将local属性指向自身就行，这里就是dist
* agent执行独立运行的searchd进程，可以是本机的，也可以在其它机器上面运行，不过注意的是agent的数据源必须相同，否则无法合并。
* agent的数据源是我们采用一定的算法将一个数据源拆分成积分，如id取模或者是其它方式。
* 客户端进行搜索的时候就直接使用dist索引进程查询就行了。


        index dist
        {
        	type = distributed
        	local = chunk1
        	agent = localhost:9312:chunk2
        	agent = localhost:9312:chunk3
        	agent = localhost:9312:chunk4
        }

### 2. 使用local，本地索引声明

* 严格来说不算是分布式，只是多线程搜索
* coreseek4.1的手册上面明确的写着“全部本地索引会被依次搜索，仅使用1个CPU或核。”。
* 不过手册中没有翻译的文档中有一个dist_threads参数，这个参数指明并发查询现场数，里面写到，从sphinx-2.0.1-bata(coreseek4.1正是基于这个版本的sphinx)开始就可以使用了，它指明以多少个线程的方式去查询索引，线程数最好和索引数相同(不包括聚合索引，这里就是dist_test)。这里可以这样配置:



        index dist_test
        {
        	type = distributed
        	local = chunk1
        	local = chunk2
        	local = chunk3
        	local = chunk4
        }
        
        #...
        
        dist_threads = 4

* 这里的chunk1 - chunk4正是我们配置的多个索引，需要在同一份配置文件中配置，它们的数据源也是和上文一样的方式从一个数据源中拆分出来的。
可以参考[这篇文章](http://www.oschina.net/translate/sphinx-search-performance-optimization-multi-threaded-search)。

> coreseek4.1 基于sphinx-2.0.1-bata，其多线程查询支持可能并不完善，可能我们需要升级更高版本的sphinx才能更好的支持这一特性(我在虚拟机上面配置，似乎就没有启用多线程)。  
而且基于数据源拆分实现的分布式，可能会有一些隐患，需要我们仔细分析。
如果想实现比较完美的分布式搜索引擎可能solr，elasticsearch这些为分布式而生的搜索引擎会更符合我们的需要。