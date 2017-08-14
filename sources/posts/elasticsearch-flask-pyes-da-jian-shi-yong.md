title:使用elasticsearch搭建一个搜索系统

tags:pyes,elasticsearch,flask

date:2014-03-29


要搭建一个日志分析系统，使用的elasticsearch+logstash+redis+kibana，搭建过程见之前的日志。

elasticsearch是一个分布式的搜索引擎，基于lucene，但是我们不需要学习太多的lucene的知识，就能很方便的使用。

它去中心化，会自动推举master，访问集群中的任何一个node，就是在和整个集群交互；添加节点只需要命名相同的集群名称，就能自动的加入。

相比sphinx来说:  
优点：  
它是实时(一定程度上)的，非常容易实现分布式，能直接搜索出文档，而不是像sphinx一样要用id去数据库查询文档内容。elasticsearch其实就如同一个数据库一般使用。elasticsearch对中文分词的支持也要比sphinx要好些，而且提供了更新丰富的api实现各种搜索需求。elasticsearch可以自动对索引分片，提高建立索引的速度。  
缺点:  
比sphinx的检索速度要慢，建立索引的速度也要慢点(elasticsearch可以自动分片存储)，生成的索引文件很大，比源文档要大得多。elasticsearch内存大户。

elasticsearch中文分词：

* 可以直接下载 [elasticsearch-rtf](https://github.com/medcl/elasticsearch-rtf/)，也可以进去下载你自己需要的插件。  可以参见[这篇博文](http://zhousheng29.iteye.com/blog/1849536)。

* 最新版本的elasticsearch使用mmseg插件时，可能会报错误，这是因为lunece4.6和mmseg插件不兼容，可以下载小于该版本的lucene来解决这个问题。

pyes是python操作elasticsearch的工具库。从[github](https://github.com/aparo/pyes/)上下载就行，使用参见[官方文档](http://pyes.readthedocs.org)。

1. 创建索引


        if self.__conn.indices.exists_index(self.__index_name):
            return
        try:
            #删除索引
            self.__conn.indices.delete_index(self.__index_name)
        except:
            pass
        #创建索引
        self.__conn.indices.create_index(self.__index_name)
        mapping = {
               u'date_added': {'boost': 1.0,
                              'index': 'not_analyzed',
                              'store': 'yes',
                              'type': u'date'},
               u'title': {'boost': 1.0,
                           'index': 'analyzed',
                           'store': 'yes',
                           'type': u'string',
                           "indexAnalyzer":"ik",
                           "searchAnalyzer":"ik",
                           },
               u'content': {'boost': 1.0,
                           'index': 'analyzed',
                           'store': 'yes',
                           'type': u'string',
                           "indexAnalyzer":"ik",
                           "searchAnalyzer":"ik",
                           "term_vector" : "with_positions_offsets"}
               }
               
        #索引映射
        self.__conn.indices.put_mapping(self.__index_type, {'properties':mapping}, self.__index_name)


2. 插入数据

        self.__conn.index(data, self.__index_name, self.__index_type)
        self.__conn.indices.refresh(self.__index_name)

3. 查询

        #q = StringQuery(qstr) #会查询所有字段，并自动对关键字分词
        
        #q = WildcardQuery("content", "%s*" % qstr) #通配符搜索
        #q = q.search()
        #q1 = TermQuery("title", qstr)  # 词条搜索，关键字不会分词
        #q.add("content", qstr)
        
        qtitle = TextQuery("title", qstr, boost=2) # 文本搜索，关键字会分词
        qcontent = TextQuery("content", qstr, boost=1)
        h = HighLighter(['<span class="kw">'], ['</span>'], fragment_size=500) # 高亮
        #q = FilteredQuery(MatchAllQuery(), q) 
        #sort={'date_added': {'order': 'desc'}}
        # BooleanQuery，会根据must(AND)或should(OR)来对Query进行组合
        # start起始，size获取大小
        q = Search(BoolQuery(BoolQuery(should=[qtitle, qcontent])),highlight=h, start=0, size=50)
        q.add_highlight("title")
        q.add_highlight("content")
    
        resultset = self.__conn.search(query=q, indices=self.__index_name,highlight=h, doc_types=[self.__index_type])
        list=[]
        for r in resultset:
            if r._meta.highlight.has_key("title"):
                r['title'] = r._meta.highlight[u"title"][0]
            if r._meta.highlight.has_key("content"):
                r['content'] = r._meta.highlight[u"content"][0]
            list.append(r)
        
        return (list, resultset)

简单的爬虫，用BeautifulSoup和正则表达式简单实现。数据直接存储在elasticsearch，只用sqlite保存URL的hash数据，以防重复抓取。

    if furl != self.__purl:
        hashfurl = self.md5(furl)
        if self.is_exist(hashfurl) :
            return
        else:
            self.__add_url(hashfurl)
        
    time.sleep(0.5)
    self.__logger.debug( "========================= fetch and parse %s ========================\n" % furl)
    
    req = urllib2.Request(furl)
    try:
        response = urllib2.urlopen(req)
        restext  = response.read()
    
        restext  = restext.decode("cp936").encode("UTF-8")
    except:
        return
    soup = BeautifulSoup(restext)
    ## 先拿文章
    title = soup.find_all(id="h1title")
    if title is not None and title <> []:
        title = title[0].get_text()
    
    date_added = self.get_dateadded(soup)
    print date_added
                    
    content = soup.find(id="endText")
    if content is not None:
        content =  content.get_text()
        
    if content is not None and date_added is not None and title is not None:
        self.save_new(title=title, content=content, date_added=date_added) 
    else:
        self.__logger.warn( 'same attr is empty!!!!\n')        
                
    
    links = soup.find_all("a")
    
    for link in links:
        href = link.get("href")
        #print href
        if href is not None:
            if self.__ptn.match(href):
                self.parse(str(href))


> 记性不好，简单的记录。