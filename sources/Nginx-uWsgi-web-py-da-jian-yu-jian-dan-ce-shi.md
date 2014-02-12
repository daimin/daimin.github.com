title:Nginx+uWsgi+web.py 搭建与简单测试

tags:web.py,nginx,uwsgi

date:2013-08-27

> Nginx + uWsgi + web.py 效率真是不错。

1. 安装uWsgi  
    * 首先是下载 [http://projects.unbit.it/downloads/uwsgi-1.9.14.tar.gz](http://projects.unbit.it/downloads/uwsgi-1.9.14.tar.gz)
    * 解压 `sudo python setup.py build`
    * 安装 `make`

2. nginx和web.py的安装就不多说

3. nginx配置

        location / {
          include uwsgi_params;
          #uwsgi_pass 127.0.0.1:9002;
          #对应uwsgi.ini配置的socket文件
          uwsgi_pass unix:/tmp/uwsgi.sock;
        }
        #静态文件访问
        location /static/ {
          if (-f $request_filename) {
            rewrite ^/static/(.*)$  /static/$1 break;
          }
        }
 
4. 基于web.py的脚本index.py
   
        import web

        urls = ("/.*", "hello")
        app = web.application(urls, globals())

        class hello:
            def GET(self):
                return 'Hello, world!'

        #if __name__ == "__main__": #注意将改行注释掉
        application = app.wsgifunc()

5. uWsgi的配置

        [uwsgi]
        #socket = 127.0.0.1:9002
        #用socket文件方式
        socket = /tmp/uwsgi.sock
        chdir = /data/www/webpy/
        processes = 8
        threads = 2
        master = true
        module = index
        ;pidfile = /data/uwsgi-bin/uwsgi.pid
        ;listen = 128
        #守护进程方式运行，并指明日志文件
        daemonize = /data/www/webpy/uwsgi.log

    注意chdir指向程序目录，module是主运行文件，见上，加入pidfile后好像对性能有影响，所以这里注释掉。

6. 运行 `sudo uwsgi uwsgi.ini`

7. 测试  
   测试使用的是apache的ab工具。`ab -n1000 -c100 http://192.168.1.1:8080/`，结果如下： 

   ![qiniu_1377586380417.gif](http://vaga-static.qiniudn.com/qiniu_1377586380417.gif "web.py")

   拿php来测试下，同样的服务器,同样的nginx，使用的是nginx + php-fpm fastcgi的模式。

   ![qiniu_1377586409480.gif](http://vaga-static.qiniudn.com/qiniu_1377586409480.gif "php")

   **看得出比PHP还是快了不少**
   