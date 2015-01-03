title:用logstash+elasticsearch+Kibana+redis搭建实时日志查询、收集与分析平台(二)

tag:logstash,elasticsearch

date:2014-03-26

最近又在整那个日志分析平台，之前由于服务器没到位，然后又其它任务要做，这里就搁置了，经理说这个还是要弄，下周就能给我个服务器，希望吧。

最近弄elasticsearch集群部署，其实我的集群，就是virtualbox上面的两个系统（s1,s2），可怜啊，搞得电脑慢死了。

elasticsearch是去中心化的，多个节点中哪台先起来，哪台就是master，如果master挂了，其它有成为master资格的节点中的一个就会成为master，这个由elasticsearch系统自己调配。

elasticsearch会将索引分片存储在不同的节点上，形成分布式搜索。

elasticsearch局域网集群设置：

* 各个节点要设置相同的`cluster.name: elasticsearch`；
* 不同的`node.name: "Franz Kafka"`，`node.master: true`设置节点是否有成为master节点的资格；
* `node.data: true`指定该节点是否存储数据；
* 禁止广播侦测：`discovery.zen.ping.multicast.enabled: false`；
* 设置可以成为master的节点地址：`discovery.zen.ping.unicast.hosts: ["192.168.56.101"]`，这样当有新的节点加入的时候就能通过master就发现了。

启动各个节点的elasticsearch。

---

logstash的elasticsearch的设置，主要是indexer中的output的设置：



    elasticsearch {
           protocol => "transport"
           embedded => false
           host => "192.168.56.101"
           port => "9300"
           cluster => "logstash_cluster"
           #node_name => "es_master"
    }


protocol表示logstash采用何种方式和elasticsearch交互。  
protocol有三种类型：node、transport、http。  

* node会将自己作为一个elasticsearch节点加入集群，不过该节点只负责交互不存储数据；  
* transport就不会将自己作为一个node，而是直接使用集群中现有的节点；  
* http类型就是使用REST/HTTP去交互。  

如果不填写protocol，jruby默认是node方式，而ruby环境默认是http。

> 我使用node类型一直不成功，从节点一直提示找不到logstash新加入的节点，各位有谁知道的麻烦告知一下。