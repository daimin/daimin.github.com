title:mysql 用法备忘

tags:mysql

date:2013-08-26

> 工作中一直都用mysql，遇到一些问题，需要查来查去，下一次遇到相同的又忘记，又要查，很不方便啊，这次记在这里，备查。

![qiniu_1377507698298.jpg](http://vaga-static.qiniudn.com/qiniu_1377507698298.jpg "mysql")

1. Alter语句用法   
    * 修改列的类型信息   
ALTER TABLE 【表名字】 CHANGE 【列名称】【新列名称（这里可以用和原来列同名即可）】 BIGINT NOT NULL  COMMENT '注释说明'
    * 重命名列   
ALTER TABLE 【表名字】 CHANGE 【列名称】【新列名称】 BIGINT NOT NULL  COMMENT '注释说明'
    * 重命名表   
ALTER TABLE 【表名字】 RENAME 【表新名字】


2. 显示运行线程和杀死线程   
   
        show processlist;
        kill connection threadid;


3. `replace into` 会修改具有相同键的数据行的所有列的值


4. 导出查询结果到文件   

        SELECT id,dbname FROM `index` into outfile "d://aaa.txt";


5. 修改表的默认字符集
 
        ALTER TABLE tbl_name DEFAULT CHARACTER SET charset_name; 


6. `ALTER TABLE tbl_name CONVERT TO CHARACTER SET charset_name;` 转换表及所有字符字段的字符集


7. mysql添加用户   
   **好吧BAE不让我录入下面的sql语句，我读进行过滤了的啊，坑啊，难怪那么慢，过滤了多少东西啊，无力吐槽，图片看你怎么过滤！！！**
   ![qiniu_1377508847990.gif](http://vaga-static.qiniudn.com/qiniu_1377508847990.gif "mysql")


8.  绑定mysql服务到指定IP
    命令行启动时，使用   
    `/usr/local/mysql/bin/mysqld_safe --bind-address=127.0.0.1` 即可。  
    如果需要修改服务脚本，编辑/etc/init.d/mysqld，找到第330行，将此内容：
`$bindir/mysqld_safe --datadir=$datadir --pid-file=$server_pid_file $other_args`   
修改为：   
`$bindir/mysqld_safe --datadir=$datadir --pid-file=$server_pid_file --bind-address=127.0.0.1 $other_args`
即可。  
    启动服务后，使用netstat -nat|grep 3306可以看到服务只绑定在127.0.0.1上。


9. distinct 和 group by    
   这两种语句其实都差不都，distinct使用起来会方便些，group by 在加了索引后效率会高一些。


10. DATE_FORMAT 函数用法   
    DATE_FORMAT(paytime, '%Y-%m-%d')，这里paytime是待格式化的日期，%Y就是年，%m月，%d日，很简单。


11. insert和select

        replace into temp(`username`,`date`) select username,DATE_FORMAT(paytime, '%Y-%m-%d') as paydate from pay_detail where `paytime`<='2013-08-25 23：59：59' and `paytime`>='2013-07-26 00：00：00' group by username


> 以后遇到新的问题，还会增加在这里。