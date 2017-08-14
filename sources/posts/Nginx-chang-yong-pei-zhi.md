title:Nginx 常用配置

tags:nginx,配置,php,php-fpm

date:2013-08-09

1. 用Nginx做Web服务器，如果没有处理好日志，日志文件可能会很恐怖~10G、20G
可以修改nginx.conf 找到access_log：

        access_log /dev/null;
        error_log /dev/null;
这样全部把他们丢到系统的黑洞里了
不用每时每刻都往系统磁盘疯狂的读写日志了 还延长硬盘的寿命

2. 检查配置 `/usr/local/webserver/nginx/sbin/nginx -t`

3. 重启nginx和php-fpm

        /etc/init.d/php-fpm restart
        killall -v nginx ; service nginx start

4. 重载配置 `/usr/local/nginx/sbin/nginx -s reload`

5. 是反向代理获得真实IP
  先在代理配置中加上

        proxy_set_header        Host $host; 
        proxy_set_header        X-Real-IP $remote_addr; 
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
然后，重载配置，可以从$_SERVER['HTTP_X_REAL_IP'] 和 $_SERVER['HTTP_X_FORWARDED_FOR']获取真实IP如果是服务器是Nginx，可以直接去，如果是Apache需要安装apache的一个第三方模块"mod_rpaf"了, 官方网站: http://stderr.net/apache/rpaf/。

6. 使用fcgi_cache来减少CPU压力

        fastcgi_cache_path /data/ngx_fcgi_tmp  levels=1:2  keys_zone=cache_php:30m inactive=1d                max_size=10g;
        fastcgi_cache   cache_php;
        fastcgi_cache_valid   200 302  1h;
        fastcgi_cache_min_uses  1;
        fastcgi_cache_use_stale error  timeout invalid_header http_500;
        fastcgi_cache_key $host$request_uri;
说明：
 `fastcgi_cache_path：fastcgi_cache`缓存目录，可以设置目录层级，比如1:2会生成16*256个字目录，cache_php是这个缓存空间的名字，cache是用多少内存（这样热门的内容nginx直接放内存，提高访问速度），inactive表示默认失效时间，max_size表示最多用多少硬盘空间。本来还有个fastcgi_temp_path参数，但发现似乎没用。

    *  `fastcgi_cache_valid`：定义哪些http头要缓存
    *  `fastcgi_cache_min_uses`：URL经过多少次请求将被缓存
    *  `fastcgi_cache_use_stale`：定义哪些情况下用过期缓存
    *  `fastcgi_cache_key`：定义fastcgi_cache的key，示例中就以请求的URI作为缓存的key，Nginx会取这个key的md5作为缓存文件，如果设置了缓存哈希目录，Nginx会从后往前取相应的位数做为目录
    *  `fastcgi_cache`：用哪个缓存空间
    
7. nginx 禁止IP访问

        server {
                listen       80 default_server;
                return       500;
        }

8. 禁止指定文件类型的访问 

        location ~ /.*\.pem {
                deny all;
        }
