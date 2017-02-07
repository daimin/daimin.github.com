title:安装scrapy

tags:scrapy

date:2014-04-03

scrapy超级难装，它依赖很多库，反正我在windows上面没有装成功，linux上面弄了N久终于装好了，现在来记录一下。

1. 要确保系统安装了如下的库，没有就执行安装。
   
     yum install gcc libffi-devel python-devel openssl-devel

     这里可能会失败，如果没有安装repo的key的话，你可以修改.repo文件，将其      **gpgcheck=0**

2. 编译安装python，这个没什么好说的。

    

3. 安装Twisted，这个很简单。可是http://pypi.python.org在国内真的不稳定，而且好慢。所以你可以使用一下的镜像：

    推荐使用豆瓣的，真心速度不错。

       http://pypi.douban.com/  豆瓣  
       http://pypi.hustunique.com/  华中理工大学  
       http://pypi.sdutlinux.org/  山东理工大学  
       http://pypi.mirrors.ustc.edu.cn/  中国科学技术大学  
    
       pip install Twisted -i http://pypi.douban.com/simple  

4. 安装w3lib  
pip install w3lib -i http://pypi.douban.com/simple  

5. 安装lxml  
pip install lxml -i http://pypi.douban.com/simple  

6. 安装scrapy，这里要注意cffi，在豆瓣上面是没有的，你可以去其他的地方找，pypi.python.org,或者github上面应该会有吧。前面第一步安装那几个devel库就是为了让这个能成功编译安装。安装scrapy就十分简单了：  
pip install scrapy -i http://pypi.douban.com/simple

> ok，好了，终于搞好了，   
> 准备用这个弄一个图书网站，爬虫 + 搜索引擎 + 大数据存储。哈哈！  



