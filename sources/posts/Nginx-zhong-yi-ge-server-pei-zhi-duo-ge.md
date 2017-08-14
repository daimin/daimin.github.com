title:Nginx中一个server配置多个location

tags:nginx,location,server,配置

date:2013-08-04

#####nginx中的location的匹配规则是“先匹配正则，再匹配普通”，同级的就是先后顺序了。
-------

**我这里需要实现：**

1. 一个server中配置两个location对应不同的root目录

2. 两个location分别对应不同的phpfpm代理的location配置  
 
3. 一个特定的url使用一个别名，这里要用别名，不要用root，alias指定的目录是准确的，root是指定目录的上级目录 

          location /texasholdem/bug/ {
               alias /data1/www/texasholdem/bug/;
               index  index.php index.html index.htm ;
          }
    
4. 指定域名的配置  

         location / {
             root   /data1/www/wp/; 
             index  index.php index.html index.htm ;
         }  

5. 对应特定的url的phpfpm配置，注意root的值，root就是document_root
因为就上文来说document_root就是/data1/www/，这里不能用alias。  

         location ~ /texasholdem/bug/(.*)\.php$ {
            root           /data1/www/;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_intercept_errors on;
            fastcgi_param  SCRIPT_FILENAME   $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }
    
6.  域名的php配置，只要配置相同的root就行了。
  
        location ~ \.php$ {
            root           /data1/www/wp/;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_intercept_errors on;
            fastcgi_param  SCRIPT_FILENAME   $document_root$fastcgi_script_name;
            include        fastcgi_params;
        }