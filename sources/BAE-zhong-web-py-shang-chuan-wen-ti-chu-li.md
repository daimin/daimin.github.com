title:BAE中web.py上传问题处理

tags:web.py,bae,上传,问题

date:2013-08-16

> 这个问题困扰我了两天，在BAE中使用web.py默认的上传方式是不能上传的，通过不懈的努力终于解决了。

1. 首先你要设置tempfile库的tempdir，BAE文档上面说修改了tempfile的临时目录，但是实际是在web.py中还是使用的系统默认的/tmp/xxx目录，所以首先需要修改。

        from bae.core import const
        tempfile.tempdir = const.APP_TMPDIR
    可以放置在app运行之前的代码前，保证其能被设置一次就够了。

2. 开始我使用的是web.py cookbook中的示例上传代码，文本文件上传是没有问题，但是二进制文件是不行的，无论怎么样多会丢失很多字节，想来应该是BAE修改了python一些库的代码。

    web.py中除了web.input()来获取请求数据外，海油web.data()函数，web.input()是经过**web.py处理过**的数据的，方便我们使用，而web.data()中获取的就是原本提交的数据。这里的问题就是在web.py的处理的时候，会使二进制数据丢失很多。所以我们来处理web.data()中的数据。
    
    web.data()中获取的数据就是字符串，可以直接保存为文件，但是还是不能正常使用，因为里面有协议头和其它一些乱七八糟的东西，我们只要中间的entity就OK了。

    前面大概包括空行是4行：

        ------WebKitFormBoundaryecUZ2xK6QjVl5e3K
        Content-Disposition: form-data; name="attac"; filename="jquery.edatagrid.js"
        Content-Type: application/x-javascript
        
    后面是5行：

        ------WebKitFormBoundaryecUZ2xK6QjVl5e3K
        Content-Disposition: form-data; name="name"
        
        pxblog
        ------WebKitFormBoundaryecUZ2xK6QjVl5e3K--
    
    ok,去掉这几行

        d = web.data()
        import StringIO
        s1 = StringIO.StringIO(d)
        s2 = StringIO.StringIO()
        lines =  s1.readlines()
        lines = lines[4:-5]
        s1.close()
    
    现在的lines中就是我们所要的数据了，然后保存起来就是我们所要的。

3. 其实从Content-Disposition中可以得到filename，然后取得文件信息。
![pic_1376642423074.jpg](http://vaga-static.qiniudn.com/pic_1376642423074.jpg "悲剧")
