title:BAE中文编码引起的程序崩溃

tags:bae,中文编码

date:2013-08-26

![qiniu_1377505253074.jpg](http://vaga-static.qiniudn.com/qiniu_1377505253074.jpg "python")

我的博客修改了一些东西，主要是中文编码问题，在自己的机器上面是没有问题的。只是在BAE上面会有问题，而且这个问题又不是每次都出现，所以很纠结，查看了很久的日志*因为日志查询真的很慢啊，有木有啊*，在`index.py`中加上了如下的代码。
    
    import sys
    reload(sys)
    sys.setdefaultencoding('utf-8')

设置系统的默认编码。
可以去github上面下载相关的代码：[https://github.com/daimin/tolog](https://github.com/daimin/tolog)