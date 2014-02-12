#-------------------------------------------------------------------------------
#-*- coding:utf-8 -*-
#-------------------------------------------------------------------------------
# Name:        sologd.py
# Purpose:
#
# Author:      daimin
#
# Created:     02-10-2014
# Copyright:   (c) daimin 2013
# Licence:     <your licence>
#-------------------------------------------------------------------------------
from mako.template import Template
from mako.lookup import TemplateLookup
import os
import markdown
import stat
import time

##网站配置
CONF = {
      "keywords"   : u"java,python,php,nodejs,golang,linux,bae,web.py,linux,nginx,android,游戏,编程",
      "description": u"本站内容为个人技术博客及其它软件编程信息。本站采用python开发，用markdown来进行编辑，生成静态文本放在github上。",
      "title"      : u"茶瓯葱丝",
      "en_title"   : u"Codecos", 
      "domain"     : u"blog.codecos.com",
      "motto"      : u"人生没有对错，只有选择后的坚持，不后悔，走下去，就是对的",
    }



app_root = os.path.dirname(__file__)
template_dir = os.path.join(app_root, 'templates/')

lookup = TemplateLookup(
                        directories     = [template_dir],
                        input_encoding  ='utf-8',
                        output_encoding ='utf-8',
                        )

sources_dir = os.path.join(app_root, 'sources/')


class Util:
    @staticmethod
    def read_file(f):
        with open ( f ) as fileHandle:
           return fileHandle.read()
        return ''
    @staticmethod
    def write_file(fname, data):
        fname = r'%s' % fname
        ### 需要解码，默认中文是编码的
        with open(fname.decode('utf-8'), 'w') as fhandler:
            fhandler.write(data)
            
    @staticmethod
    def change_ext(fname, cext):
        return fname[:fname.rindex('.')] + cext
            
class HTMLObj(object):
    dir = '/'
    
    def __init__(self, **kwargs):
        self.title = kwargs['title'] if 'title' in kwargs else ''
        self.url   = self.dir + kwargs['url'] if 'url' in kwargs else ''
        self.date  = kwargs['date'] if 'date' in kwargs else ''
        
class Post(HTMLObj):
    dir = '/posts/'
    def __init__(self, **kwargs):
        super(Post, self).__init__(**kwargs)
        self.cont  = kwargs['cont'] if 'cont' in kwargs else ''
        self.tags  = kwargs['tags'] if 'tags' in kwargs else []
    
class Tag(HTMLObj):
    dir = '/tags/'
    def __init__(self, **kwargs):
        super(Tag, self).__init__(**kwargs)
        self.count  = kwargs['count'] if 'count' in kwargs else 0
        
 ### 侧边栏显示的POST ###
side_posts = [
        Post(title="留言", url="liu-yan-ban.html")
              ]
    
class MdReader:
    """markdown文件读取器
    """
    def __init__(self):
        self.mdobjs     = []
        self.metas      = []
        self.toptags   = None
        self.postbydate = None
        
    def get_mdfiles(self):
        fls = os.listdir(sources_dir)
        for mfl in fls:
            mdcont = Util.read_file(os.path.join(sources_dir, mfl))
            self.mdobjs.append(self.__parse(mdcont, mfl))
        return self.mdobjs 
            
    def __process_cont(self, cont):
        cont = markdown.markdown(cont)
        return cont
            
    def __parse(self, mdcont, mfl):
        ## 先读前面6行
        mddict = {}
        lines = mdcont.split("\n")
        metaslines = filter(lambda x:x is not None and x.strip() !='', lines[0:6])
        mddict['title'], mddict['tags'], mddict['createdate'] = metaslines[0][metaslines[0].index(":") + 1:],\
                                metaslines[1][metaslines[1].index(":") + 1:],\
                                metaslines[2][metaslines[2].index(":") + 1:]
        mddict['tags']    = mddict['tags'].split(",")
        mddict['content'] =  self.__process_cont("".join(lines[6:]))
        mddict['fname']   = mfl
        self.metas.append(dict(filter(lambda x:x[0]!='content', mddict.items())))
        return mddict
    
    def get_top5tags(self):
        """拿到文章数排序前5的标签
        """
        if self.toptags is not None:
            return self.toptags[0:5]
        
        self.toptags = []
                    
        toptags = self.get_tag_count()        
        toptags = sorted(toptags.items(), key=lambda x:x[1], reverse=True)
        for t in toptags:
            self.toptags.append(Tag(title=t[0], url="%s.html" % t[0]))
        return self.toptags[0:5]
    
    def get_tag_count(self):
        tagscount = {}
        for m in self.metas:
            for t in m['tags']:
                if t is None or t.strip() == '': continue
                if t in tagscount:
                    tagscount[t] += 1
                else:
                    tagscount[t] = 1
        return tagscount
    
    
    def get_posts_order_date(self, o=False):
        """根据创建日期排序
        ###o=True则是顺序，False是倒序
        """
        if self.postbydate is not None:
            return self.postbydate
        self.postbydate = []
        sposts = sorted(self.mdobjs, key=lambda x:x['createdate'], reverse=(not o))
        for p in sposts:
            self.postbydate.append(Post(date=p['createdate'], title=p['title'], cont=p['content'], url=Util.change_ext(p['fname'], '.html')))
        return self.postbydate
    
    def get_tags_posts(self, o=False):
        """得到各标签的文章排序
        """
        tagsposts = {}
        self.get_top5tags()
        for tt in self.toptags:
            for m in self.metas:
                if tt.title in m['tags']:
                    if tt.title in tagsposts:
                        tagsposts[tt.title].append(dict(filter(lambda x:x[0] != 'tags', m.items())))
                    else:
                        tagsposts[tt.title] = [dict(filter(lambda x:x[0] != 'tags', m.items()))]
        ###排序
        return dict(map(lambda x:(x[0], sorted(x[1], key=lambda x:x['createdate'], reverse=(not o))), tagsposts.items()))
    
         
class StaticBase():
    
    _MDreader     = None
    
    
    def __init__(self):
        ## 循环将CONF中的值赋给当前对象
        map(lambda x:setattr(self, x[0], x[1]), CONF.items())
        self.fulltitle = '%s | %s' % (self.en_title, self.title)
        self._staticpath = None
        self._template   = None
        self._type       = None
        
        
    def run(self):
        if StaticBase._MDreader is None:
            StaticBase._MDreader = MdReader()
            StaticBase._MDreader.get_mdfiles()
        self._mdreader = StaticBase._MDreader
        self._parse_data()
        self._static();
        
    def get_template(self):
        if self._template is None:  return None
        return  lookup.get_template(self._template)
        
    def _parse_data(self):
        global side_posts
        self.sidetags  = self._mdreader.get_top5tags()
        self.sideposts = side_posts
    
    def _static(self):
        """静态化
        """
        tempobj = self.get_template()
        if tempobj is None: return None
        if isinstance(self._staticpath, list):
            if self._type == 'post':
                for (sp, cp) in self._staticpath:
                    self.post  = Post(title=cp['title'], cont=cp['content'], date=cp['createdate'], url=sp)
                    self.title = "%s | %s" % (self.post.title, CONF['title']) 
                    Util.write_file(sp, tempobj.render(**self.__dict__))
            elif self._type == 'tag':
                for (sf, (tagtitle, tagposts)) in self._staticpath:
                    self.posts = [Post(title=tp['title'], date=tp['createdate'], url=Util.change_ext(tp['fname'], '.html')) for tp in tagposts]
                    self.title = "%s | %s" % (tagtitle, CONF['title']) 
                    Util.write_file(sf, tempobj.render(**self.__dict__))
                
        else:
            Util.write_file(self._staticpath, tempobj.render(**self.__dict__)) 



class StaticIndex(StaticBase):

    def __init__(self):
        StaticBase.__init__(self)
        
        
    def _parse_data(self):
        StaticBase._parse_data(self)
        self._staticpath = os.path.join(app_root + HTMLObj.dir , 'index.html') 
        self._template   = 'index.html'
        self.posts = self._mdreader.get_posts_order_date(False)
        
        
class StaticPost(StaticBase):

    def __init__(self):
        StaticBase.__init__(self)
        self._template   = 'post.html'
        self._type       = 'post'
        
    def _parse_data(self):
        StaticBase._parse_data(self)
        self._staticpath = []
        for p in self._mdreader.mdobjs:
            self._staticpath.append((os.path.join(app_root + Post.dir, Util.change_ext(p['fname'], '.html')), p))

class StaticTagIndex(StaticBase):

    def __init__(self):
        StaticBase.__init__(self)
        self._template   = 'tagIndex.html'
        
    def _parse_data(self):
        StaticBase._parse_data(self)
        tagscount = self._mdreader.get_tag_count()
        self.tags = []
        for (title, count) in tagscount.items():
            self.tags.append(Tag(title=title, count=count, url="%s.html" % title))
        self._staticpath = os.path.join(app_root + Tag.dir, 'index.html')
            
class StaticTag(StaticBase):

    def __init__(self):
        StaticBase.__init__(self)
        self._template   = 'tag.html'
        self._type       = 'tag'
        
    def _parse_data(self):
        StaticBase._parse_data(self)
        self._staticpath = []
        for (title, posts) in self._mdreader.get_tags_posts(False).items():
            self._staticpath.append((os.path.join(app_root + Tag.dir, title + ".html"), (title, posts)))
            
class StaticSitemap(StaticBase):

    def __init__(self):
        StaticBase.__init__(self)
        self._template   = 'sitemap.xml'
        
    def _parse_data(self):
        StaticBase._parse_data(self)
        self._staticpath = os.path.join(app_root + HTMLObj.dir , 'sitemap.xml') 
        self.posts = self._mdreader.get_posts_order_date(False)
            
class StaticRss(StaticBase):

    def __init__(self):
        StaticBase.__init__(self)
        self._template   = 'rss.xml'
        
    def _parse_data(self):
        StaticBase._parse_data(self)
        self._staticpath = os.path.join(app_root + HTMLObj.dir , 'rss.xml') 
        self.posts = self._mdreader.get_posts_order_date(False)

def main():
    staticIdx = StaticIndex()
    staticIdx.run()
    
    staticPost = StaticPost()
    staticPost.run()
    
    staticTagIdx = StaticTagIndex()
    staticTagIdx.run()
    
    staticTag = StaticTag()
    staticTag.run()   
    
    staticSitemap = StaticSitemap()
    staticSitemap.run()     
    
    staticRss = StaticRss()
    staticRss.run() 

if __name__ == "__main__":
    start_time = time.clock()
    main()
    end_time = time.clock()
    print  '############## 解析完成，花费【%f】秒 #############' % (end_time - start_time)
    
    
    
    