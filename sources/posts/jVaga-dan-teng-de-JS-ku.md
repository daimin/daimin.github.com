title:jVaga，蛋疼的JS库

tags:js

date:2011-07-12

很简单的，没多少代码，应该还有很多BUG，先做个标记在这里。
我的目标就是 **Make you easy use**。
主要就是模仿Jquery的使用，肯定没有jquery强大，但是肯定也要简单许多。

1. 能使用jVaga.extend进行对象扩展(prototype.js)。
2. 能进行简单的浏览器类型判断，jVaga.B，如果是IE则会返回IE版本号，如果是其它浏览器只会是布尔值。
3. 能使用jVaga()或者$，进行元素选择，你也可以使用jVaga.util.setNamespace自定义选择器标志符。
   选择器返回的是包装后的JS对象，你可以直接调用它提供的各种便利的方法。

    选择器用法：

        <!DOCTYPE html>
        <html lang="cn">
        <head>
        <meta charset="utf-8" />
        <script type="text/javascript" src="jvaga-0.3.0.js"></script>
         <script type="text/javascript">
        /*        window.onload = function(){
                        var dd = document.getElementById("track");
                        alert(dd.getAttribute);
                  }
         */
                   $(function(){
         
         // test1 : 命名空间设置             
         //             jVaga.util.setNamespace("$_$");
         //             alert($_$("#track"));
         // test : id
         //             alert($("#track"));
         /*$(".logo").each(function(e){
           alert(e.hasClass("logo1"));
         });
         */
         // class 选择，class检测, find二次选择，属性值获取,tagName选择
         //alert($(".logo")[0].hasClass("logo"));
         //alert($(".logo")[0].find("img")[0].attr('src'));
         //alert($("a")[0].text());
         // 链式使用
         //alert($(".logo")[0].find("img")[0].attr('src','xxxx.gif').attr('src'));
         // $("#ddd") $("[name='sds']:first > ") $("input") 
         // 浏览器测试
         //alert($.B.IE);
         //alert($.B.OP);
         //alert($.B.WK);
         //alert($.B.GK);
         //alert($.B.MS);
         
                   });
                 </script>
             </head>
             <body>
                 
               <div class="header">
                   <div class="logo"><img src="images/logo.png" /></div>
                   <div id="track">
                    <a href="#">首页</a>
                    <span class="arrow">&gt;&gt;</span>
                    绘图优化
                 </div>
               </div>
              <div id="main">
               <div class="blocks">
               
                 <div id="leaveBlank">
                    想象力的留白
               </div>
            
             <div class="block">
                  <div id="userInfo">
                      <h3>个人信息</h3>
                     <img src="images/userhead.jpg">
                  </div>
               </div>
                   <div class="article">
                   <div class="title">
                       <div class="title_cont">
                           我的文章标题
                       </div>
                       <div class="tag">
                           标签1 标签2
                       </div>
                   </div>
              </div>
                
             </body>
         </html>

4. jVaga.util下面有各种的工具函数，如：  
    toArray函数将参数转换成数组；addClass2TagNext给指定的标签的元素的下一个元素节点运用class；
    loadScript函数动态加载JS包；getEvent函数，兼容浏览器的Event对象的获取。

5. 给数组类型加入了each函数，能方便的遍历每个元素；给String加入了trim函数。

6. 提供了便利的Ajax支持，（为提供效率，使用了HttpRequest对象连接池，不知道是不是好的实践呢？）jVaga.Post对应post方式的AJax请求，jVaga.get就是get方式的了。

你可以自由的使用该工具，但是本人不保证其效率及功能的完整性，如果能有任何的反馈，我会很乐意的修改，如果你能将该工具用于任何的项目中，我也十分的荣幸，不过请保留本人的名字。

***

一不小心就0.3.1版本了，主要做了如下修改：

1. 这个版本主要对于节点选择器内部实现的改进

2. 简单来说，因为IE8+及Chrome、Safari、Firefox比较新的版本中

3. 都实现了比较好的选择器querySelector及querySelectorAll，这些选择器

4. 比我用Javascript实现的选择器，效率不知高多少倍，所以我在内部需要

5. 适配使用该接口实现。

6. 只是针对Css ClassName的选择的时候，应用了querySelectorAll,其它的情况下
  也是无法应用该接口

而用法还是如上面，所示：  
新版本的代码在[这里下载](http://vagascanner.googlecode.com/files/jvaga-0.3.1.js)