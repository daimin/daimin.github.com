title:写了一个静态博客

tags:github,静态,python

date:2014-02-13

BAE的域名要备案了，所以我的原来的博客[http://codecos.com](http://codecos.com)，无法使用了。找了一下国内的其它的免费的空间或引擎都是需要域名备案的。

之前就知道github是可以创建个人网站，还可以绑定一个域名，这货可是国外的，就不需要域名备案。

gihub pages使用的是Jekyll引擎，如果你以一定的结构存放markdown文档的话，是可以自动生成html的，我这里没有去用这个，学习一个东西好像没什么必要，你可以参考[这篇文章](http://www.ruanyifeng.com/blog/2012/08/blogging_with_jekyll.html)。

我使用python开发的，网站根据一定的结构组织，使用mako模板引擎，markdown文档放在一个指定的目录，然后执行以下python脚本就可以解析markdown文档并使用模板生成整个网站的内容了。

对比我之前的网站，这个网站是全静态化的，速度上会有优势，而且文章和tag的URL更加的友好，总之我比较满意。

网站地址：[http://blog.codecos.com](http://blog.codecos.com)，就是这篇文章所在。

代码：[https://github.com/daimin/daimin.github.com](https://github.com/daimin/daimin.github.com)

> 下一步我该做一个怎样的应用呢？

