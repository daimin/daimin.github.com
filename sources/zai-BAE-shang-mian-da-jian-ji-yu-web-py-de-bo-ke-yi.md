title:在BAE上面搭建基于web.py的博客（一）

tags:web.py,wordpress,markdown,python,bae,教程,mako

date:2013-08-23

1. 下载安装python，我这里安装的是python2.6.5。你可以从[这里](http://www.python.org/getit/)下载安装，我使用的系统是windowsxp。你只要下载相应的版本了。然后点击安装就可以了。
2. 下载web.py，从[这里](http://webpy.org/install)下载，对于web.py我没有安装，直接放置到工程木下面而已。你可以解压压缩包，然后运行`python setup.py install`。
3. 我使用的开发工具的pydev，这是一个eclipse的python开发插件，如果你感觉卡，可以调整eclipse.ini的-Xms，默认好像是40m，可以到-Xms256m。
4. 模板引擎，web.py自带有一个模板引擎，但是功能较弱，而且运行速度也不怎么样，我最开始也是使用的这个引擎，但是用起来有很多局限性，我这里推荐[mako](http://www.makotemplates.org/)，这个引擎的速度号称是python里面最快的模板引擎了，具体我也没有验证过，不过确实好用，确定就是文档比较少，不过你还是可以在网上找到一些资料，如：[http://www.cnblogs.com/RChen/archive/2007/06/15/mako_doc_translation_2.html](http://www.cnblogs.com/RChen/archive/2007/06/15/mako_doc_translation_2.html)
5. 关于前端页面，你可以自己写一套，你也可以去拿一套现存的，你不知道哪里有？wordpress那么多好看的主题，难道不是吗？找到你心仪的主题，然后很快的用web.py改成你自己的网站，岂不是很爽。不过不要忘记加上主题的作者信息。
6. 使用markdown进行写作，比如我现在写的这篇文件就是用markdown写的，[python的markdown处理包](https://pypi.python.org/pypi/Markdown)，下载对应你的python版本的包。
7. BAE百度的人品之作，速度不错，免费配额也不错，Python支持也不错，比起国外的还要靠谱很多。 
8. 最简单的helloworld。你可以在[web.py cookbook](http://webpy.org/cookbook/helloworld.zh-cn)上面找到。  

		import web
		
		urls = ("/.*", "hello")
		app = web.application(urls, globals())
		
		class hello:
		    def GET(self):
		        return 'Hello, world!'
		
		if __name__ == "__main__":
		    app.run()

9. 搭建我们的博客
  
    * 用pydev建立一个工程就OK了，假定该工程为**demo**，然后将**web.py的包文件夹**，**mako的包文件夹**,**markdown包文件夹**，拷贝到该工程下。
  
    * 在工程根目录建立文件夹templates,建立静态文件夹static，默认static目录中的文件，可以通过URL直接访问，当然这是在你本地，如果是在BAE上面就需要写处理脚本了，当然你也可以放在其它的服务器上面。
    * 定义urls
   
            urls = (
               r'/(\d*)', 'Index',
            )
   url采用的一个url的正则匹配一个逻辑处理类，我这里称之为handler。
   (\d*)对应了Index的GET或POST方法的出self参数外的第一个参数。
   注意url配置，要用r前缀，表示不对正则中的\进行转义。

    * 3个root变量
   
            app_root = os.path.dirname(__file__)
	        templates_root = os.path.join(app_root, 'templates/' + conf.theme)
	        static_root = os.path.join(app_root, 'static')

    * 定义mako的模板渲染器
   
            render = render_mako(
                templates_root,
                input_encoding='utf-8',
                output_encoding='utf-8',
            )

    * 定义一个基类，因为业务中，我们有很多都是相同的，那么我们就放在基类中进行处理。

            class Base():
                def __init__(self):
                    self._conf = conf.site
                    #do what you want.

    * 定义Index类。

            class Index(Base):
			    def __init__(self):
			        Base.__init__(self)#必须调用基类的构造函数
			
			    def GET(self, page):
			        self.say = "Hello World"
			        return render.index(page=self)


        在子类的构造函数中必须要调用基类的构造函数，web.py中用GET方法处理客户端的get请求，对应的POST方法处理post请求，GET和POST方法中的处理第一个参数外的参数，都是对应url中的捕获组中的值。

        `render.index`中的index表示一个模板文件，其中的参数是可以在模板中直接访问的，如果是web.py的模板，就需要$def with (page)后才可以使用，mako中可以直接使用的。

    * 运行
            
        本机就这样运行，然后在浏览器中输入localhost:8080，就可以访问了，8080可以修改为你绑定的端口。

   		    web.config.debug = True
		    app = web.application(urls, globals())
			app.notfound = errNotFound
			if __name__ == "__main__":
				app.run()
   
        如果是在BAE上面就是这样，

			app = web.application(urls, globals()).wsgifunc()
			
			from bae.core.wsgi import WSGIApplication
			application = WSGIApplication(app)

        然后还要在BAE上面注意的是**修改app.conf的handler**加上：

			- url : /(\d*)
			script : index.py
          
        **之后还要着重的介绍一下BAE的使用。**


> 有什么不对的地方还请留言指正，大家一起学习。