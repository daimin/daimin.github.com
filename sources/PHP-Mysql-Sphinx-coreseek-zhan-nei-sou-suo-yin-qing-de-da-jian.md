title:PHP+Mysql+Sphinx(coreseek)站内搜索引擎的搭建

tags:php,mysql,sphinx,coreseek,搜索

date:2013-09-10

后台搜索速度越来越慢，考虑着用专业的搜索工具。   
Sphinx是一个基于SQL的全文检索引擎，可以结合MySQL,PostgreSQL做全文搜索，它可以提供比数据库本身更专业的搜索功能，使得应用程序更容易实现专业化的全文检索。 它提供php,java,ruby,python等多种语言的api。
我这里使用的是coreseek，Coreseek为应用提供全文检索功能，目前的版本（2.x 3.x）基于Sphinx 0.9.8，支持使用Python定义数据源，支持中文分词。

1. 下载安装coreseek，在这里[下载](http://www.coreseek.cn/uploads/csft/4.0/coreseek-4.1-win32.zip)coreseek最新版4.1。下载后直接解压就行了。比如说 D:\coreseek-4.1-win32。
2. 修改etc目录下面的 csft_mysql.conf文件。首先是数据源定义：

        #数据源定义
        source mysql
	        {
	            type                    = mysql
	
	            sql_host                = localhost
	            sql_user                = root
	            sql_pass                = 
	            sql_db                  = 
	            sql_port                = 3306
	            sql_query_pre           = SET NAMES utf8
	
        	    sql_query = SELECT id, group_id, type, UNIX_TIMESTAMP(date_added) AS date_added, title, content FROM documents

	            sql_attr_uint    = group_id 
	            sql_attr_timestamp  =  date_added
	
	            sql_query_info_pre      = SET NAMES utf8                                        
	    	    sql_query_info          = SELECT * FROM payinfo WHERE id=$id
	        }

    * type: 数据库类型，目前支持 mysql 与 pgsql 
    * sql_host、sql_user、sql_pass、sql_port: mysql数据库的相关配置
    * sql_query_pre： 索引数据获取前执行的查询，这里用来设置字符集
    * sql_query: 全文检索要显示的内容，在这里尽可能不使用where或 group by，将 where 与 groupby 的内容交给 sphinx，由 sphinx 进行条件过滤与 groupby 效率会更高
    * sql_attr_*: 表示一些属性字段，你原计划要用在 where, orderby, groupby 中的字段要在这里定义
    * sql_query_info： 文档信息查询。 可选选项，默认为空。 仅对 mysql 数据源有效。
    * sql_query_info_pre： 命令行查询前查询。 可选选项，默认为空。 仅对 mysql 数据源有效。
    

3. 索引定义

        #index定义
        index mysql
        {
            source            = mysql
            path            = var/data/mysql
            docinfo            = extern
            mlock            = 0
            morphology        = none
            min_word_len        = 1
            html_strip                = 0
            charset_dictpath = etc/                             #Windows环境下设置，/符号结尾，最好给出绝对路径，例如：C:/usr/local/coreseek/etc/...
            charset_type        = zh_cn.utf-8
            enable_star = 1
            min_infix_len = 3
        }

    * source 源名称
    * path 索引记录存放目录，如 d:/sphinx/data/cgfinal ,实际存放时会存放在 d:/sphinx/data 目录，然后创建多个 cgfinal 名称，不同扩展名的索引文件。
    * docinfo: 文档信息(docinfo)的存储模式。可选选项，默认是“extern”，可用的值包括'none', 'extern' 和 'inline'。
    * min_word_len: 最小索引词长度。可选选项，默认为1（索引任何词）。只有长度不小于这个最小索引词长度的词会被索引。
    * charset_type: 字符集编码类型。可选选项，默认为“sbcs”。可用的值包括“sbcs”和“utf-8”。 对于使用Coreseek的中文用户，可选的值还可以有“zh_cn.utf-8 ”、“zh_cn.gbk”和“zh_cn.big5”（需要编译时提供iconv支持）。当设置charset_type值为上面的值时，系统默认您开启了中文分词特性。
    * charset_dictpath: 设置中文分词词典所在的目录，默认是mmseg3
    * enable_star: 允许前缀/中缀索引上的星号语法（或称通配符）。可选选项，默认为0（不使用通配符）。可用值为1或者0。所有关键字都根据索引时的 min_prefix_len 和 min_infix_len settings设置被视为前缀或者中缀。如*da*, *dai
    * min_infix_len：索引的最小中缀长度。可选选项，默认为0（不索引中缀）。
    * min_prefix_len：索引的最小前缀长度。可选选项，默认为0（不索引前缀）。
    * 前缀和中缀不能同时索引。索引了前缀和中缀会使索引慢很多，请斟酌。
    * 其它的参数请参见 [Coreseek 4.1 参考手册](http://www.coreseek.cn/docs/coreseek_4.1-sphinx_2.0.1-beta.html#conf-min-infix-len)
    
4. 全局索引定义 

        #全局index定义
        indexer
        {
            mem_limit            = 128M
        }
    
    * mem_limit 索引使用内存最大限制，根据机器情况而定，默认是32M，太小的会影响索引的性能。
    

5. searchd服务定义
   
        searchd
        {
            listen                  =   9312
            read_timeout        = 5
            max_children        = 30
            max_matches            = 1000
            seamless_rotate        = 0
            preopen_indexes        = 0
            unlink_old            = 1
            pid_file = var/log/searchd_mysql.pid  #请修改为实际使用的绝对路径，例如：/usr/local/coreseek/var/...
            log = var/log/searchd_mysql.log        #请修改为实际使用的绝对路径，例如：/usr/local/coreseek/var/...
            query_log = var/log/query_mysql.log #请修改为实际使用的绝对路径，例如：/usr/local/coreseek/var/...
            binlog_path =                                #关闭binlog日志
        }

    * 这个不多，请参见手册。
    

6. 生成索引并启动后台

        D:\coreseek-4.1-win32>bin\indexer -c etc\csft_mysql.conf --all
        # 索引配置中定义的所有索引。
        D:\coreseek-4.1-win32>bin\searchd -c etc\csft_mysql.conf --console
        # 运行检索守护进程
        # 另外打开一个CMD窗口，然后：
        D:\coreseek-4.1-win32>bin\search -c etc\csft_mysql.conf -a 100
        # 查询所有包含100的文档。注意这里的需要考虑的分词规则，100成功，可能10就不会成功。

7. php客户端使用

        require ( "sphinxapi.php" );
        # sphinx提供的PHP客户端。
        $cl = new SphinxClient ();
        $cl->SetServer('127.0.0.1', 9312);
        $cl->SetConnectTimeout ( 3 );
        $cl->SetArrayResult ( true );
        $cl->SetMatchMode ( SPH_MATCH_EXTENDED);
        $res = $cl->Query ( 'all', "*" );
        print_r($res['matches']);
        # 连接到searchd服务器，根据服务器的当前设置执行给定的查询(搜索所有的索引中包含all)，取得并返回结果集。

> 只是一个简单的记录，主要是自己备忘。详细的使用方式，参见 [Coreseek 4.1 参考手册](http://www.coreseek.cn/docs/coreseek_4.1-sphinx_2.0.1-beta.html#conf-min-infix-len)

        
