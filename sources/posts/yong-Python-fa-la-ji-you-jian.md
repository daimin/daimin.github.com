title:用Python发垃圾邮件

tags:python,邮件

date:2013-08-19

![qiniu_1376907717364.jpg](http://vaga-static.qiniudn.com/qiniu_1376907717364.jpg "解析页面发邮件")
> 这个程序写了很久了，是刚开始学习python的时候写的，主要就是抓取页面的邮箱，然后发送。直接看代码吧，是我少有的注释比较详细的代码了，希望会有点参考价值。
	
    #!/usr/bin/python
    # -*- coding:UTF-8 -*-   
    #encoding=utf-8
    #author:daimin(vagasnail#gmail.com)
    """
      1 能发送到多个邮箱
      2 使用多线程
      3 抓取指定的网页得到网页中的邮箱，然后发送(通过命令行参数获取网页地址)
    """
    import sys
    import smtplib
    from email.Message import Message  
    from time import sleep
    import threading
    import urllib2,urllib
    from BeautifulSoup import BeautifulSoup
    from BeautifulSoup import BeautifulStoneSoup
    import re


    to_addrs = ['target@xx.com']       #目标邮箱
    cc_addr = 'cc@xx.com'              #抄送  
    from_addr = 'from@xxx.com'         #发送邮箱

    # 标题和正文
        subject = u'这不是垃圾邮件' # u表示该字符使用unicode方式编码，注意这里只是起指示作用，用于一些函数处理
        content = u'你好，测试用的'

        class MyThread(threading.Thread):
        # const
        smtpserver = 'smtp.gmail.com'  
        username = 'vagasnail@gmail.com'  
        password = 'dai253685'  
        
        
        def __init__(self,no,msg,to_addr):
            threading.Thread.__init__(self) # 调用parent的__init__方法
            self.no = no
            self.msg = msg
            self.to_addr = to_addr

        def run(self):
            self.send_message()
        
        def send_message(self):
            print " start thread %d ....\n" % (self.no)
            sm = smtplib.SMTP(MyThread.smtpserver, port=587, timeout=20)  
            sm.set_debuglevel(1)                   #开启debug模式   
            sm.ehlo()  
            sm.starttls()                          #使用安全连接   
            sm.ehlo()  
            sm.login(MyThread.username, MyThread.password)
            
            sm.sendmail(from_addr, self.to_addr, self.msg)  
            sleep(5)  
            sm.quit()     

    # 使用urllib2 获取html文档
    # 使用BeautifulSoup解析html文档        
    def get_to_addrs(url):
        #pattern = re.compile(r'^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$')
        pattern = re.compile(r'\w+[\.\w]+@\w+\.\w+')
        global to_addrs
        req = urllib2.Request(url)
        res = urllib2.urlopen(req, timeout=10)
        html = res.read()
        res.close()
        
        match = pattern.findall(html)
        to_addrs.extend(match)
        #soup = BeautifulStoneSoup(html)
        '''
        ass = soup.findAll("a")
        for a in ass:
            h = a.get('href')
            if h <> None:
                h = h.strip()
                pos = h.find(tag)
                if pos <> -1:
                    mail = h.replace(tag,'')
                    mail = mail.strip()
                    to_addrs.append(mail)
        '''    
        
    if __name__ == "__main__": 
        """
    因为解码是python自动进行的，我们没有指明解码方式，python 就会使用 sys.defaultencoding 指明的方式来解码。
    很多情况下 sys.defaultencoding 是 ANSCII，如果 s 不是这个类型就会出错。
    拿上面的情况来说，我的 sys.defaultencoding 是 anscii，而 s 的编码方式和文件的编码方式一致，是 utf8 的。
    你可以明确的s.decode(xxx).encode(xxxx)来编码解码 (解码：将编码解释为字符串，编码：将字符串编码)
        """
        reload(sys)  # Python2.5 初始化后会删除 sys.setdefaultencoding 这个方法，我们需要重新载入
        sys.setdefaultencoding( "utf-8" ) 
        
        if len(sys.argv) <> 2:
            print "    Please input target page's url which you want handle!"
            exit(0)
        
        url = sys.argv[1]
        get_to_addrs(url)
        print to_addrs
        
        tno = 1
        for to_addr in to_addrs:
            message = Message()
            #message.set_charset('')
            
            
            message['Subject'] = subject    #邮件标题   
            message['From'] = from_addr
            message['To'] = to_addr   
            message['Cc'] = cc_addr   
            message.set_payload(content)    #邮件正文   
            msg = message.as_string() 
            #send_message(tno,msg,to_addr)        
            t = MyThread(tno,msg,to_addr)
            t.start()
            tno = tno + 1
                                   
     