title:mac上docker的安装和简单使用

tag:docker

date:2015-04-01

> 本来在centos上面安装docker，本来都成功了，但是运行不起来，发生如下错误：
`FATA[0000] inappropriate ioctl for device`，应该是内核版本太低，想升级内核，结果发现使用的vps无法升级内核，无奈只能在mbp上面安装了。

1. 安装boot2docker，官网网速太慢，在百度网盘上面找了一个1.4.1版本的，速度飞快，链接在[这里](http://pan.baidu.com/s/1eQxouwa)。

2. 安装好boot2docker，然后执行`boot2docker init`就行，初始化启动成功后，使用`boot2docker ssh`进入虚拟机(boot2docker采用virualbox)，可以在virualbox看到我们启动的主机。`export DOCKER_HOST=tcp://$(boot2docker ip 2>/dev/null):2375`在本机配置docker的host。

    Mac OS X -- boot2docker -- container 三者之间的关系
    ![](http://vaga-static.qiniudn.com/docker-install-800x417.png)
            

3. 进入虚拟机后其实docker已经启动了，如果没有执行`docker -d`。执行`docker images`会看到我们的docker镜像，如果没有，执行`docker pull learn/tutorial`，这样会拉取一个教程性质的镜像。

4. docker镜像其实也是类似于虚拟机的沙盒环境，不过肯定更轻量级，而且性能损耗更少。类似于ubuntu环境，可以用 `apt-get install` 来安装软件。`docker run learn/tutorial echo hello world`在指定的image上执行命令，不过这个是没有交互的，比如在镜像安装软件必须`docker run learn/tutorial apt-get install ping -y`。

5. 可以直接进入docker镜像命令行，`docker run -i -t  learn/tutorial  sh`(其实就是在镜像中运行sh命令而已)。在docker安装服务器上执行`docker ps`可以看到运行的实例(容器)。

6. `docker search ubuntu` 查询于ubuntu相关的镜像，也可以查询其它的镜像，如：`docker search centos`等等。

7. 在运行该镜像的容器中安装了软件，需要把新的内容保存到该镜像中去，否则下次启动该镜像又恢复成原样

        uqiu@localhost ~> docker ps -l
        CONTAINER ID        IMAGE                   COMMAND             CREATED             STATUS              PORTS               NAMES
        95903c1a2bf7        learn/tutorial:latest   /bin/bash           6 minutes ago       Up 5 minutes        80/tcp              thirsty_colden

    看到容器的 ID，然后执行

    `docker commit 95903c1a2bf7 learn/tutorial:latest`  #把当前容器的修改提交到镜像 learn/tutorial  中去。记住要在退出之前提交。镜像名其实是可以指定为其它名称的，只是下次进来时，需要使用修改后的镜像名才能进入最近的修改。
    
8. 检查容器的运行信息，`docker inspect 0911`，最后的参数是容器的id前4位。

9. ` docker push learn/ping`，发布自己的镜像，learn/ping是镜像名。前提是在[https://hub.docker.com/](https://hub.docker.com/)注册自己的帐号。

10. 端口映射

        boot2docker ssh -L 50080:localhost:40080  #这条命令可以在  boot2docker-vm  运行时执行，建立多个不同的映射就是执行多次，映射本机的50080到vm的40080

        docker run -i -t -p 40080:80 learn/tutorial bash # 映射vm的40080到learn/tutorial容器的80端口。
        
11. ssh映射

     * docker容器中安装ssh服务，并启动。commit后退出。
     
     * `boot2docker ssh -L 50080:localhost:40080 -L 50443:localhost:40443 -L50022:localhost:40022`，映射多个ip到localhost，并启动vm。
     
     * `docker run -i -t -p 40080:80 -p 40443:443 -p 40022:22 daimin/test bash`，映射端口方式启动docker容器，这个时候40022映射到了容器的22端口，也就是ssh端口，然后开启ssh服务。
     
     * 在控制台输入`ssh -p 50022 root@localhost`，发现提示输入用户密码，然后成功登录。
     

12. 用Dockerfile制作我们的image

    编写Dockerfile
    
        # sshd
        #
        # VERSION 0.0.1

        FROM centos:latest
        MAINTAINER Dai Min "daimin@mama.cn"

        # make sure the package respository is up to date
        RUN yum clean all
        RUN yum install -y openssh-server   # 安装ssh服务端
        RUN sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config # 修改sshd_config文件为密码登录，当然你可以自己修改为公钥登录
        RUN sed -i 's/PubkeyAuthentication yes/PubkeyAuthentication no/g' /etc/ssh/sshd_config  # 关闭公钥登录
        RUN sed -i 's/UsePAM yes/UsePAM no/g' /etc/ssh/sshd_config # 必须要关闭，否则登录后马上掉线

        RUN mkdir /var/run/sshd  # ssh运行目录
        RUN echo "root:123" | chpasswd  # 修改root密码
        
        # 下面这两句比较特殊，在centos6上必须要有，否则创建出来的容器sshd不能登录  
        RUN ssh-keygen -t dsa -f /etc/ssh/ssh_host_dsa_key
        RUN ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key

        # Expose port 22 from the container to the host
        EXPOSE 22
        CMD ["/usr/sbin/sshd", "-D"]  # 运行ssh服务
        
    然后进入到Dockerfile所在目录，执行`docker build -t eg_sshd .`，等待命令成功，`docker run -d -P --name=mytest eg_ssh`，在后台运行容器。
    
    然后用`sudo docker inspect mytest`查看容器信息，找到ip，如果容器ip连接不了，就使用其映射到的本机ip，如 `ssh -p 40022 root@127.0.0.1`，发现可以登录了。 