title:php-resque的安装和使用

tags:php,php-resque

date:2014-03-13

>Resque 是 Github 基于 Redis 开发的 background job 系统。PHP-Resque 是把 Resque porting 到 PHP 的方案。

redis的安装和运行就不多说，安装后运行就行了。

从github中下载php-redis,[https://github.com/chrisboulton/php-resque](https://github.com/chrisboulton/php-resque)。加压后进入解压目录。

安装Composer：

    apt-get install curl
    cd /usr/local/bin
    curl -s http://getcomposer.org/installer | php
    chmod a+x composer.phar
    

放置composer.phar到php-resque的安装目录，执行：

    php composer.phar install
    
可能会提示失败，是因为没有安装phpunit，执行如下：

    wget https://phar.phpunit.de/phpunit.phar
    chmod +x phpunit.phar
然后也是在php-resque目录中执行php phpunit.phar，应该会成功。

如果都成功的话，就安装好了php-resque了，接下来可以运行demo中的代码。

demo/job.php是一个简单的job:

    class PHP_Job
    {
      // 每个Job都有这个方法，worker就是调用这个方法的。
    	public function perform()
    	{
            fwrite(STDOUT, 'Start job! -> ');
    		sleep(1);
    		fwrite(STDOUT, 'Job ended!' . PHP_EOL);
    	}
    }

demo/queue.php是一个队列插入示例：

    <?php
    if(empty($argv[1])) {
    	die('Specify the name of a job to add. e.g, php queue.php PHP_Job');
    }
    
    require __DIR__ . '/init.php';
    date_default_timezone_set('Asia/Shanghai');
    //设置后台存储
    Resque::setBackend('127.0.0.1:6379');
    // job的参数
    $args = array(
    	'time' => time(),
    	'array' => array(
    		'test' => 'test',
    	),
    );
    
    //添加队列和job
    $jobId = Resque::enqueue($argv[1], $argv[2], $args, true);
    echo "Queued job ".$jobId."\n\n";

命令行输入：

    php demo/queue.php default PHP_Job

demo/check_status.php 是检查job的执行情况。

    php demo/check_status.php jobid

worker的一个实现：


    <?php

    date_default_timezone_set('Asia/Shanghai');
    require  __DIR__.'/../../job.php';
    
    require __DIR__.'/../bin/resque';

**这里要require 包含job代码的文件，如果该文件中没有队列中指定的job名的类(定义了perform的类)，job将执行失败。**

基本就是这样，我简单的记录一下，记忆力不好，怕忘了。
