title:MYSQL show 命令详解

tags:mysql,show,命令,解释

date:2013-08-12

`show tables或show tables from database_name或show database_name.tables;`  
解释：显示当前数据库中所有表的名称

`show databases;`  
解释：显示mysql中所有数据库的名称

`show processlist;`  
解释：显示系统中正在运行的所有进程，也就是当前正在执行的查询。大多数用户可以查看
他们自己的进程，但是如果他们拥有process权限，就可以查看所有人的进程，包括密码。

`show table status;`  
解释：显示当前使用或者指定的database中的每个表的信息。信息包括表类型和表的最新更新时间

`show columns from table_name from database_name; 或show columns from database_name.table_name;`或`show fields;`
解释：显示表中列名称（和 desc table_name 命令的效果是一样的）

`show grants for user_name@localhost;`  
解释：显示一个用户的权限，显示结果类似于grant 命令

`show index from table_name;或show keys;`  
解释：显示表的索引

`show status;`  
解释：显示一些系统特定资源的信息，例如，正在运行的线程数量

`show variables;`  
解释：显示系统变量的名称和值

`show privileges;`  
解释：显示服务器所支持的不同权限

`show create database database_name;`  
解释：显示创建指定数据库的SQL语句

`show create table table_name;`  
解释：显示创建指定数据表的SQL语句

`show engies;`  
解释：显示安装以后可用的存储引擎和默认引擎。

`show innodb status;`  
解释：显示innoDB存储引擎的状态

`show logs;`  
解释：显示BDB存储引擎的日志

`show warnings;`  
解释：显示最后一个执行的语句所产生的错误、警告和通知

`show errors;`  
解释：只显示最后一个执行语句所产生的错误

上面的大部分命令都可以用like，比如 `show table like ‘%abce%’`  。