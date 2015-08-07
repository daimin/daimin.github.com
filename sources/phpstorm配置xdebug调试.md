title:php-resque的安装和使用

tags:php,phpstorm,xdebug

date:2015-08-07

# phpstorm配置xdebug调试
1. 安装xdebug，记得xdebug的版本和php的版本一致。
2. 配置php.ini中关于xdebug的配置。

        [xdebug]
        zend_extension="Your xdebug install path"
        xdebug.remote_enable = On
        xdebug.remote_handler = dbgp   
        xdebug.remote_host= localhost
        xdebug.remote_port = 9000
        xdebug.idekey = PHPSTORM
        
3. 打开phpStorm，进入File>Settings>PHP>Servers。 这里要填写服务器端的相关信息，name填localhost，host填localhost，port填80，debugger选XDebug。这里设置的是将要进行xdebug调试的服务器地址。在这之前请设置好php解释器。
4. 进入File>Settings>PHP>Debug，看到XDebug选项卡，port填9000，其他默认。这里的port地址是你在php.ini中xdebug配置中的`xdebug.remote_port`的值。
5. 进入File>Settings>PHP>Debug>DBGp Proxy，IDE key 填 PHPSTORM，host 填localhost，port 填80。这里的IDE KEY是你在php.ini中xdebug配置中的`xdebug.idekey`的值。
6. 在Run>Debug/Run Configurations 中设置Debug配置，如下图: 
               ![http://77g0dq.com1.z0.glb.clouddn.com/5F6B6D94-270D-459E-BDF9-802364F6942F.png](http://77g0dq.com1.z0.glb.clouddn.com/5F6B6D94-270D-459E-BDF9-802364F6942F.png)  
            
7. 在代码中需要调试处，加上断点，然后在Run菜单中运行你配置的App。
