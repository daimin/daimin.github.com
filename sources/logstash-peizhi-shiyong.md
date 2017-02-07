title:用logstash+elasticsearch+Kibana+redis搭建实时日志查询、收集与分析平台

tag:logstash,elasticsearch,Kibana,redis

date:2014-03-02

hadoop之类的是高帅富用的，我们用不过来。这里搭建一个简单的日志平台。

logstash是一个管理日志和事件的工具，你可以收集它们，解析它们，并存储它们以供以后使用(例如日志搜索)，logstash有一个内置的web界面，用来搜索你的所有日志。logstash在部署时有两种运行模式：standalone和centralized：
   
   * standalone：standalone的意思是所有的事情都在一台服务器上运行，包括日志收集、日志索引、前端WEB界面都部署在一台机器上。

   * centralized：就是多服务器模式，从很多服务器运输(ship)日志到一台总的日志(collector)服务器上用来索引和查找。

    需要注意的是logstash本身并没有什么shipper和collector这种说法，因为不论是运输日志的进程还是汇集总的日志的进程运行的都是同一个程序，只是使用的配置文件不同而已。

### 这里部署centralized模式


1. 准备两台机器：server1 (192.168.56.102)，server2(192.168.56.101)。

2. server1和server2中都安装JDK6以上版本，并配置JAVA环境变量：


        export JAVA_HOME=/data/softwares/jdk1.6.0_45
        export PATH=$JAVA_HOME/bin:$PATH
        export CLASSPATH=.:$JAVA_HOME/lib/*.jar

2. server1上面运行logstash shipper和redis，用来收集日志，其实server1可以是多台生产服务器，我们做的就是监控这些服务器的日志。server2是日志分析服务器，安装logstash indexer和elasticsearch以及Kibana。

4. server1安装redis，直接yum install redis就可以了

5. server1安装logstash，`wget https://download.elasticsearch.org/logstash/logstash/logstash-1.3.3-flatjar.jar `，这个包很大，因为Kibana集成到里面了。

6. server1运行redis-server，运行redis数据库，编写shipper:



        input {
           file {
              type => "syslog"
              path => ["/var/log/messages", "/var/log/lastlog", "/var/log/*.log"]
           }
        
           file {
               type => "nginx-access"
               path => "/var/log/nginx/access.log"
           }
        }
        
        output {
            redis {
                host => "192.168.56.102"
                port => 6379
                data_type => "list"
                key => "logstash"
            }
        }

     保存为shipper.conf，然后执行`java -jar logstash-1.3.3-flatjar.jar agent -f shipper.conf`。

7. 将logstash从server1拷贝到server2中，并下载elasticsearch，`wget 'https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.7.tar.gz'`。

8. 安装elasticsearch，解压后，直接运行$elasticsearch_root/bin/elasticsearch -f，等待运行成功，注意其中的**publish_address**为之后在indexer.conf中output中配置的端口。

9. 运行indexer，编写indexer.conf:
 
        input {
          redis {
            host => "192.168.56.102"
            port => "6379"
            data_type => "list"
            key => "logstash"
            type => "redis-input"
          }
        }
        
        filter {
           grok {
              type => "linux-syslog"
              pattern => "%{SYSLOGLINE}"
           }
        
           grok {
               type => "nginx-access"
               pattern => "%{IPORHOST:source_ip} - %{USERNAME:remote_user} \[%{HTTPDATE:timestamp}\] %{QS:request} %{INT:status} %{INT:body_bytes_sent} %{QS:http_referer} %{QS:http_user_agent} %{QS:x_forword} %{QS:upstream_cache_status}&@&(%{HOST:domain}|-)"
           }
        }
        
        output {
          elasticsearch {
            host => "127.0.0.1"
            port => "9301"
          }
        }

    执行`java -jar logstash-1.3.3-flatjar.jar agent -f indexer.conf`。

10. server2上运行Kibana，`java -jar logstash-1.3.3-flatjar.jar web`，然后再浏览器中打开 `http://192.168.56.101:9292`，应该可以看到统计结果。

11. 上面的端口如果不能访问注意修改iptables，运行后如果页面还是不能访问，需要等几十秒。**redis可以安装在server2上面，这样会不会更好？**
        
***
**关于filter的写法，这里我们最常使用的就是grok，可以参考logstash的官网，上面有很多介绍。 **


**实际上我们可以用logstash完成很多功能，比如报警功能(使用metrics插件和ruby插件)，统计nginx访问日志，并按照自己的需求，这个就需要对grok进行编码了，主要就是正则表达式的编写，如果一个grok不够的话，还可以加上一个grok，诸如此类的。**

