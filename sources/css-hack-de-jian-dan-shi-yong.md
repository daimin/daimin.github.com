title:css hack的简单使用

tags:css,hack,ie

date:2013-08-16

![pic_1376622770249.jpg](http://vaga-static.qiniudn.com/pic_1376622770249.jpg "IE hack")

>今天调布局，很是麻烦啊，为毛世界上要有IE这样坑爹的浏览器，而且在TC竟然还占绝大多数。
总结了几点：

1. 第一种

        margin-left:-601px; /*所有的浏览器*/
        *margin-left:-601px; /*ie6,ie7*/
        _margin-left:-601px; /*只有ie6*/
        *margin-left:-602px !important; /*只有ie7*/
        margin-left:/*\**/:603px\9; /* 所有浏览器IE浏览器 */

2. 第二种，利用条件注释语句：

        <!--[if IE]>
            此内容只有IE可见 
        <![endif]-->
        
        <!--[if IE 8]>
            只有IE8
        <![endif]-->
        
        <!--[if !IE 7]>
            除了IE7的IE浏览器
        <![endif]-->

        <!--[if gt IE 7]>
            高于IE7的IE浏览器
        <![endif]-->
        
        <!--[if lt IE 7]>
            低于IE7的IE浏览器
        <![endif]-->
        
        <!--[if lte IE 7]>
            低于或等于IE7的IE浏览器
        <![endif]-->
