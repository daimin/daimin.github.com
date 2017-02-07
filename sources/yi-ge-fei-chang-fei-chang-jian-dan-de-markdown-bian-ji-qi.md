title:一个非常非常简单的markdown编辑器

tags:markdown,python,pyqt

date:2013-09-25

之前一直使用*markdownPad*，功能是很强大，但是那个速度我就不想吐槽了，其实我只需要一个非常简单的markdown编辑器，只要简单的预览就够了，所以就有了这个markdown的编辑器。你可以在[这里](https://github.com/daimin/mdchick)得到它的源码。

***

**简单的介绍：** 

* 因为我的[博客](http://codecos.com)是用python写的，所以其markdown也是用的python的库进行解析的，然后大多数的md的编辑器都和博客使用的库的解析结果有所不同，包括markdownPad，只是它稍微好些而已，所以我就想自己用python来做一款简单的markdown的编辑器，这样写起博客来，就非常顺畅了。

* 编辑器使用[pyqt4](http://www.riverbankcomputing.co.uk/software/pyqt/download/)来编写，为什么不用qt?因为我不会，而且我要的是python的程序，这样才能最好的和博客一致。pyqt应该是python中最强大的UI库之一吧，很好用，文档多，而且很多的示例，强烈推荐之。

* 现在编辑器的功能只有编辑和预览的功能，后续应该会有**加粗**，**斜体**，**链接**，**插入代码块**，再加上nodepad的功能，不会更多了。

***
已经加上了**加粗**，**斜体**，**链接**，**插入代码块**，等一些简单的功能。如果感兴趣，请参考[源码](https://github.com/daimin/mdchick)

> 今天晚上要回家了，开心，激动，嘎嘎！