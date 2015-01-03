title:netbeans英文字体修改

tags:java,netbeans,英文字体

date:2013-07-31

1. 将 `JDK_HOME/jre/lib` 目录下的`fontconfig.properties.src`复制一份文件`fontconfig.properties`，并放在该目录下。

2. 编辑文件`fontconfig.properties`，查找到下面一行：  
`sequence.monospaced.GBK=chinese-ms936, alphabetic,dingbats,symbol `  
可以发现由于中文**monospaced**字体缺省查找顺序是先使用**chinese-ms936**，结果造成了英文被宋体来          显示。纠正非常简单，只需将**chinese-ms936**和**alphabetic**调换顺序就可以了： 
`sequence.monospaced.GBK=alphabetic,chinese-ms936,dingbats,symbol`

> google开始收录这个博客了，可是百度还说我没有添加网站。法克！

