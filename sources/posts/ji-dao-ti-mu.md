1. 每门功课不小于80的学生姓名

        name   kecheng chengji
        张三	  语文	  82
        张三	  数学	  91
        李四	  语文	  79
        李四	  数学	  92
        李四	  英语	  88
        王五	  语文	  83
        王五	  数学	  84
        王五	  英语	  92

        select  name from s where `name` not in (
          select `name` from s where chengji<80)  group by `name`
        
        select `name` from s group by name having min(chengji) > 80
        
        
        
2. 如下：

        from operator import itemgetter
        """
        找出n个中r个数字组合的个数，要求递减，不准重复
        1,2,3,4,5
        有：
        543
        542
        541
        532
        531
        521
        432
        431
        421
        321
        """
        n = 9  # n为1-9
        r = 8  # r < n   

        ttree = {n: {}}

        outputs = []

        def nodeadd(val, node_):
            if val < 2:
                return
            arr = range(val-1, 0, -1)
            if len(arr) > 0:
                for i in arr:
                   node_[i] = {}
                   nodeadd(i, node_[i])

        def find(node_, nl):
            global outputs, r
            if len(nl) == r:
                nnl = int(nl)
                if nnl not in outputs:
                    outputs.append(nnl) 
                return
            node_ = sorted(node_.iteritems(), key=itemgetter(0), reverse=True)
            for i, it in node_:
                nnl = "{}{}".format(nl, i)
                #print it 
                find(it, nnl)
                find(it, "%d" % i)


        print "Add data to tree ------"
        nodeadd(n, ttree[n])  
        print ttree
        print "Find data from tree ------"
        find(ttree[n], nl="%d" % n)
        print "Result is ------"
        outputs.sort(reverse=True)
        print outputs


    


       


