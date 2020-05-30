title:golang相关

tags:golang

date:2017-03-21

---

1. 变量定义： 

    * 和其它语言不一样，它将类型放在后面，`var a int` ，它不需要分号。还可以这样声明：
    
            var (
                v1 int
                v2 string
            )

    * 初始化：如下三种都是合法：

            var v1 int = 10
            var v2 = 10 //编译器可以自动推导出类型
            v3 := 10  //不需要var，声明和初始化一起，声明后的不能用:=初始化，这种简式的变量声明只能放在函数内部
    * 赋值，它也支持这种 `i, j = j, i`，这里i和j就交换了值。
    * 字符串类型必须是双引号
    * 如果变量定义了而未使用，编译会报错；import语句也是，未用的import也会编译报错


2. 常量

    * 字面常量就是硬编码的数字，字符串等等。
    * 定义常量: `const A int = 1`
    * 枚举

            const (
                A = iota //在const使用重置为0
                B
            )


3. 数组

    * golang的数组是大小不可以变的，定义的时候就要给定，`[32] byte`
    * 数组切片后就成了另外一个类型了：数组切片，这个时候大小就可以自动变化了。
    * 数组遍历用range关键字，也可以用传统的for语句，推荐range
    * 数组是值类型，赋值和参数传递的时候都会复制所有元素。
    * 数组切片：myArray[:5]将数组切片，也可以make一个数组切片

            mys1 := make([]int, 5) // 初始值为0，初始大小为5
            mys2 := make([]int, 5, 10) //初始值为0，初始大小为5，预留10个大小
            mys3 := []int{1,2,3,4,5} //直接初始化一个包含5个元素的切片

    * 数据常用内置函数
        * cap函数，返回数组(**这里的数组包括切片，下同**)大小;
        * len函数返回当前的个数;
        * append给数组添加元素

4. map，键值对集合

    * `var myMap map[string] PersonInfo`，键类型是string，值类型为PersonInfo
    * make创建map：`myMap = make(map[string] PersonInfo, 100)`，创建map并指定初始大小
    * delete删除元素 `delete(myMap, "1234")`，删除键值"1234"的元素
    * 查找

            value, ok := myMap["1234"]
            if ok { // finded
                // do what you want
            }

5. 错误处理

    * error接口，所有的错误都实现了这个接口
    * defer 相当于try...catch语句的finally。
    * panic打印错误，并终止流程，并返回调用函数处，由上层panic继续执行，直到goroutine被终止。

6. 接口
   
   * golang接口很宽松，只要实现了方法就算是实现了接口，并不需要显式的实现。
   * interface{} 表示any类型
   * 用组合实现了继承，可以见第7点。

7. 类，golang的类就是结构体

    * 对象是引用类型，而结构体是值类型
        
            //建立对象，它是引用类型（推荐，因为类一般比较大，引用省内存）
            rect1 := new(Rect)
            rect2 := &Rect{}
            rect3 := &Rect{0, 0, 100, 200}
            rect4 := &Rect{width: 100, height:200}

            // 也可以，它是值类型
            rect = Rect{}
            rect = Rect{0, 0, 100, 200}
            rect = Rect{width: 100, height:200}

    * 没有构造函数
    
    * 利用组合实现继承

            type A struct {
                Name string
            }

            func (a *A) say() {
                fmt.Println("Hello " + a.Name)
            }

            type AA struct {
                A
            }

            aa := &AA{}
	        aa.say()
            
            // 这里AA的对象就拥有了A类所有的属性和方法，接口的继承也是同理
            // 匿名字段，当匿名字段是一个struct的时候，那么这个struct所拥有的全部字段都被隐式地引入了当前定义的这个struct，起始类似如下代码：
            aa := &AA{A{"Vaga"}}
	        aa.say()

8. 并发

    * goroutine就是go实现的协程，语言级实现，函数调用前面加一个go关键字就是并发执行了。
    * golang的并发通讯，推荐channel，如：`ch := make(chan int)`，`ch <- 1`表示向chan中写入1，`<-ch`表示从chan中读取，在读取。写入后操作是阻塞的，直到被读取，读取钱读取也是阻塞的，知道被写入。
    * `var ch2 chan<- float64` 单向的channel，只能被写；`var ch3 <-chan int `只能被读。
    * close(ch)关闭channel
    * 多核运行，可能需要设置`runtime.GOMAXPROCS(16)` 16就是核心数
    * 锁，实现并发通讯的另一种方式，原则上就是锁住共享内存
    * 实现IPC就只有两种方式：**共享内存**和**消息传递**。

9. 类型断言

        type T struct{}
        var _ I = T{}

        其中 I为interface
        //上面用来判断 type T是否实现了I,用作类型断言，如果T没有实现借口I，则编译错误.


---
> 如上，先这样。。。






    



