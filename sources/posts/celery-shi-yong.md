title:celery的使用

tag:celery,队列

date:2014-08-28

1. 安装

  celery首推的队列就是rabbitmq
  
  mac下：
   `brew install rabbitmq`
   
  linux:
  `sudo apt-get install rabbitmq-server`
  
  celery，直接pip install celery就行了
  
2. task

        from celery import Celery
        app = Celery('tasks', broker='amqp://guest@localhost//')
  
        @app.task
        def add(x, y):
            return x + y
            
   在同级目录运行`$ celery -A tasks worker --loglevel=info` 启动一个worker。并将add加入的任务队列中。
      
   在当前目录重新打开一个python命令行窗口，输入：   
   
        >>> from tasks import add
        >>> add.delay(4, 4)
        
   具有backend的worker(一般没必要)：
   
        from time import sleep
        from celery import Celery
  
        backend = "db+mysql://root:123@127.0.0.1/celery"
        broker='amqp://guest@localhost//'
        app = Celery('tasks', backend=backend, broker=broker)
 
        @app.task
        def add(x, y):
            sleep(10)
            return x + y

   这样运行结构就会写入的mysql中了，这里需要安装SQLAlchemy。
 
   delay是Task.apply_async的快捷函数，表示异步执行，这样会得到celery的最好控制。
   
3. 配置   
     * 方法1  
  
            from celery import Celery

            app = Celery()
            import celeryconfig
            app.config_from_object(celeryconfig)
    
    * 方法2
    
            class Config:
                CELERY_ENABLE_UTC = True
                CELERY_TIMEZONE = 'Europe/London'

            app.config_from_object(Config)
            
    还有好几种方法...

4. flower
   
   celery监控工具，直接`pip install flower`就行了，然后运行flower命令，就可以查看celery的运行清空。
   
5. 总结

      * celery作为异步队列一般不需要太关心执行的结果，可`@app.task(ignore_result=True)`忽略结果，也可以在config中设置`CELERY_IGNORE_RESULT=True`
     * default_retry_delay=300, max_retries=5可以设置重试的时隔和最多次数，retry机制也是celery可靠的特点。
     * 可以通过设置具有优先级的worker来决定那些任务需要优先执行。  
