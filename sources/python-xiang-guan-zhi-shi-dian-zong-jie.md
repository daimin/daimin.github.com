title:python相关知识点整理

tags:python

date:2014-02-14

1. operator.itemgetter函数，它的值指名从第几个元素操作
比如:

        a = [('a',1),('b',3),('c',2)]
        a.sort(key=operator.itemgetter(1))
结果：
[('a', 1), ('c', 2), ('b', 3)]

        a.sort(key=operator.itemgetter(0))
结果：
[('a', 1), ('b', 3), ('c', 2)]

2. os.walk 和os.path.walk   
    os.walk有3个参数，top,topdown和onerror，top是要遍历的根目录，topdown为True则从根目录到子目录，否则先遍历子目录，后根目录，onerror是发生错误时候回调的函数。
os.walk返回3个值，root、dirs、files，root是当前遍历的相对根目录，dirs是当前根目录下的所有目录列表,files是文件列表。

    os.path.walk没有返回，用来遍历目录并给每次遍历目录数回调函数，参数1是待遍历的目录，参数2是回调函数，参数3是回传给回调函数的参数。回调函数有3个参数，参数1便是os.path.walk函数的第3个参数传递的值，参数2是当前目录下的所有子目录列表，参数3是文件列表。

3. hashlib的update函数会在上次加密的基础上继续加密
    
        >>> m.update("aaa")
        >>> print m.hexdigest()
        5d793fc5b00a2348c3fb9ab59e5ca98a
        >>> print m.hexdigest()
        5d793fc5b00a2348c3fb9ab59e5ca98a
        >>> m.update("aaa")
        >>> print m.hexdigest()
        e09c80c42fda55f9d992e59ca6b3307d


4. python使用绝对路径运行项目的时候，必须保证自己依赖的库和模块在绝对路径中能够找到，否则就切换到相对路径中执行。比如cron执行python时，可以先cd到当前项目路劲，然后执行当前的python脚本文件，cd xxxx;python xxxx.py

5. python的类变量和java的不一样。对于JAVA来说，类变量只有一份，子类也是使用的父类的类变量，除非在子类中覆盖了父类的类变量，那么子类就会使用自己的类变量。而对于python来说，如果子类改变的类变量的值，那么不会影响到父类，其其它的子类。但是深究来说，我们重写给子类的类变量赋值，其实就相当于覆盖了该变量，因为python是动态变量，所以归根是一样的。

6. python中 // 一直执行取整除法，不过对于/，python2和python3会有不同，python3是浮点除法，不过在python2中可以通过引入 `from __future__ import division` 使/为浮点除

7. 列表切片如果不存在，会返回空列表，而索引访问则会报错：IndexError: list index out of range

        >>> s = [1,3,24]
        >>> s[10:]
        >>> []
        >>> s[10]
        >>> IndexError: list index out of range

8. xrange(N)，将返回0..N-1的生成器，range(N)讲返回0..N-1的列表

9. lambda 表达式创建的函数其实是一个闭包函数，和普通函数是不一样的。如果调用一个lambda函数，可能会产生闭包函数已经完成调用，导致每次的值都是最后一次的值，可以在函数中定义额外的参数来保存每一次的值。

        def multipliers():
            return [lambda x : i * x for i in range(4)]`  #  late binding 变量的值是在函数被调用的时候被查找的，那么这个时候循环早已完成，那么i的值就是循环最后的值了，也就是3.

        def multipliers():
            return [lambda x, i=i : i * x for i in range(4)]  #这里使用了一个额外的参数i来绑定(消除lage binding)闭包中的i的值，那么在调用的适合，使用的i就是默认参数中的i的值了。

        print [m(2) for m in multipliers()]


10. 对于函数的默认参数，只会在函数定义的时候创建，之后无论多少次的使用，都是使用的同一个。
如：

        def extendList(val, list=[]):
           list.append(val)
           return list

        list1 = extendList(10)
        list2 = extendList(123,[])
        list3 = extendList('a')

        print "list1 = %s" % list1
        print "list2 = %s" % list2
        print "list3 = %s" % list3

    最后的结果会是：   
    list1 = [10, 'a']  
    list2 = [123]   
    list3 = [10, 'a']  
    list1和list3使用的是同一个列表，只有list2，重新传入了一个list，所以是使用的传入的list。

11. type(x) 返回x的描述x的类型的type对象，，而isinstance(obj,class)，直接判断obj是否是class的实例，能作用于各种subclass，或者是新旧类型的类声明方式。而type(x)它不能对subclass起作用，对旧的类声明方式(class A:pass)也无作用，type(x)会返回<type “instance”>对象，与原类对象并不相等，新的类声明方式(class A(object):pass)是相等的，但是对于subclass也是不起作用的。

12. __builtin__模块代表了python中默认内置的函数的对象,如果碰到要重写buildin函数，可以import __buildin__然后调用buildin函数，这样不会对对当前scope的函数造成影响。

13. os模块是和操作系统相关的，sys适合解释器相关的。

14. copy 仅拷贝对象本身，而不拷贝对象中引用的其它对象。 deepcopy 除拷贝对象本身，而且拷贝对象中引用的其它对象。

15. os.path是module，包含了各种处理长文件名(路径名)的函数。sys.path是由目录名构成的列表，python解释器依据这个查找模块及初始化。

16. re.match() 函数只检查 RE 是否在字符串开始处匹配，而 re.search() 则是扫描整个字符串。

17. reduce是对集合中的item 进行归并，其实和map/reduce中的reduce的概念差不多。它有两个参数，分别代表前一次迭代的值及本次迭代item的值。它还拥有一个startval。
简单实现：

        def reduce_impl(func, argvs, startVal=None):
           if startVal is not None:
               argv1 = startVal
           else:
               argv1 = argvs[0]

           for argv2 in argvs[1:]:
               argv1 = func(argv1, argv2)
           return argv1


18.  生成器和函数的主要区别在于函数 return a value，生成器 yield a value同时标记或记忆 point of the yield 以便于在下次调用时从标记点恢复执行。 yield 使函数转换成生成器，而生成器反过来又返回迭代器。

19. `__future__`模块是未来python版本默认支持的特性，比如python3就支持了。

        from __future__ import unicode_literals # 默认字符串都是unicode的了
        from __future__ import print_function # print语句现在是一个函数
        from __future__ import division # '/'除法现在是浮点除
        from __future__ import absolute_import # 要使用绝对导入，而不能使用相对导入的方式

20. `__builtins__`是对内建模块的引用，python2.*的`__builtin__`或python3.x的`builtins`。

21. `(i for i in [1,2,3,4])` 生成生成器，`[i for i in[1,2,3,4]]` 生成列表。

22. `__all__ = ["add", "x"]`，表示在import * 的时候，只会import 这些成员。

23. `__init__.py`中的`__path__`代表当前包的路劲，只要将当前包下的模块的解决路劲加入到path中，就可以从直接从包中引入了这些模块了。 

24. 如果一个累中`__slots__ = ("name", "age")`，那么就不能动态绑定其它的属性了，只能是`__slots__`中的。  

25. enumerate 会返回索引和元素
    
        l = [1,2,32,4,22,5]
  
        for idx, it in enumerate(l):
        print "{}=>{}".format(idx, it)
   
   
    output:
       
        0=>1
        1=>2
        2=>32
        3=>4
        4=>22
        5=>5

  
26. inspect提供自省功能

    (1).对是否是模块，框架，函数等进行类型检查。

    (2).获取源码

    (3).获取类或函数的参数的信息

    (4).解析堆栈
    
        inspect.stack() # 得到当前代码的调用堆栈
        is{module|class|function|method|builtin}(obj): #检查对象是否为模块、类、函数、方法、内建函数或方法。
        isroutine(obj): #用于检查对象是否为函数、方法、内建函数或方法等等可调用类型。用这个方法会比多个is*()更方便，不过它的实现仍然是用了多个is*()。
        getmembers(object[, predicate]):# dir函数的升级版本
        getmodule # 它返回object的定义所在的模块对象。
        # 此外还可以返回源码
        get{file|sourcefile}(object): #获取object的定义所在的模块的文件名|源代码文件名
        getargvalues(frame): # 仅用于栈帧，获取栈帧中保存的该次函数调用的参数值，返回元组
        #... 还有很多自省相关的函数


27. requests的编码 

        r = request.get("http://xxx.com")
        print r.encoding

    r.encoding 可以得到requests猜测的response的数据的编码，但是可能不正确，你可以自己检查response的编码，然后设置r.encoding='xxx'，这样下一次调用r.text的时候就会使用r.encoding的编码将r.text的值转换为当前python解释器所用的字符编码的字符。

