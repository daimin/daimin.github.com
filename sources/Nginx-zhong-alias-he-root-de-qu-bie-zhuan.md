title:Nginx中alias和root的区别(转)

tags:nginx,alias,root

date:2013-08-01

nginx貌似没有虚拟目录的说法，因为它本来就是完完全全根据目录来设计并工作的。

如果非要给nginx安上一个虚拟目录的说法，那就只有alias标签比较“像”，干脆来说说alias标签和root标签的区别吧。

最基本的区别：alias指定的目录是准确的，root是指定目录的上级目录，并且该上级目录要含有location指定名称的同名目录。使用alias标签的目录块中不能使用rewrite的break。

说不明白，看下配置：

    location /abc/ {
        alias /home/html/abc/;
    }

在这段配置下，http://test/abc/a.html 就指定的是 /home/html/abc/a.html。这段配置亦可改成

    location /abc/ {
        root /home/html/;
    }

这样，nginx就会去找/home/html/目录下的abc目录了，得到的结果是相同的。

但是，如果我把alias的配置改成：

    location /abc/ {
        alias /home/html/def/;
    }

那么nginx将会从/home/html/def/取数据，这段配置还不能直接使用root配置，如果非要配置，只有在/home/html/下建立一个 def->abc的软link（快捷方式）了。

一般情况下，在location /中配置root，在location /other中配置alias是一个好习惯。

至于alias和root的区别，我估计还没有说完全，如果在配置时发现奇异问题，不妨把这两者换换试试。

> 原文链接：nginx 虚拟目录？的配置[http://www.sudone.com/nginx/nginx_alias.html]