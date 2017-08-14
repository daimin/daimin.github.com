title:django和celery简单结合使用

tag:django,celery

date:2015-03-20

>自行安装django,celery,flower,rabbitmq,mysql 

         
1. 创建django项目

        django-admin.py startproject djangoxs
        cd djangoxs
        python manage.py startapp xs

2. 修改settings.py        
    进入djangoxs目录`cd djangoxs`，这个是工程目录。
    settings.py是整个工程的配置文件，主要：
    
        # 设置静态文件根目录(js/css/images)，务必绝对路径
        import os
        STATIC_ROOT = os.path.realpath(os.path.join(conf.ROOT_DIR, '../static/'))
        # 静态文件的url前缀
        STATIC_URL = '/static/'
        # 静态文件url及相应的文件目录配置
        STATICFILES_DIRS = (
            ("css", os.path.join(STATIC_ROOT, 'css')),
            ("js", os.path.join(STATIC_ROOT, 'js')),
            ("images", os.path.join(STATIC_ROOT, 'images')),
            ("admin/css", os.path.join(STATIC_ROOT, 'admin/css')),
        )
        # 静态文件发现器，安装排序优先级
        STATICFILES_FINDERS = (
            'django.contrib.staticfiles.finders.FileSystemFinder', # 文件系统
            'django.contrib.staticfiles.finders.AppDirectoriesFinder', # app目录
        )
        # 模板的路径
        TEMPLATE_DIRS = (
            os.path.join(ROOT_DIR, 'templates/'),
        )
        # 模板加载器，按优先级排序
        TEMPLATE_LOADERS = (
            'django.template.loaders.filesystem.Loader',  # 从TEMPLATE_DIRS加载template
            'django.template.loaders.app_directories.Loader', # 从app目录下载
        )

        # celery的配置，需要安装django-celery
        import celeryconfig
        import djcelery
        djcelery.setup_loader()
        # broker的url，即rabbitmq的url
        BROKER_URL = celeryconfig.BROKER_URL

3. 使用supervisor来监控各个进程，这里是flower和celery，记住要配置环境变量DJANGO_SETTINGS_MODULE，这里暂时只监控了flower和celery，其实各个都可以加入监控的。另外要注意的django的celery不是普通的启动方式来启动的worker而是使用manaer.py，可参见下面的代码。

        [program:flower]
        environment=DJANGO_SETTINGS_MODULE='djangoxs.settings'
        user = root
        directory = /data/pywork/djangoxs/
        command = /usr/local/python27/bin/python manage.py celery flower --loglevel=info
        process_name = %(program_name)s
        numprocs=1
        stdout_logfile = /home/logs/flower.stdout.log
        stderr_logfile = /home/logs/flower.stderr.log
        redirect_stderr = true
        autostart = true
        autorestart = true

        [program:celery_worker]
        environment=DJANGO_SETTINGS_MODULE='djangoxs.settings'
        user = root
        directory = /data/pywork/djangoxs/
        command = /usr/local/python27/bin/python manage.py celery worker --loglevel=info
        process_name = %(program_name)s
        numprocs=1
        stdout_logfile = /home/logs/celery.xs.stdout.log
        stderr_logfile = /home/logs/celery.xs.stderr.log
        redirect_stderr = true
        autostart = true
        autorestart = true
        
4. app的模板直接放在app下面就行了，模板名和model名一样就可以自动加载。
   需要注意admin的模板，可以从系统源码中拷贝过来放在工程目录的templates下，在这里就是djangoxs/djangoxs/templates/admin/下面，如果需要自定义模板可以根据 admin/appname/modelname/来放置模板，change_list.html代表列表，change_form代表表单，如此类推...
   
5. model的定义
    * verbose_name代表field的表示名称
    * `__unicode__`函数返回值为model类的表示名称，比如print model时，返回这个值。
    * Meta定义了model类的元信息，verbose_name_plural为后台展示名称,app_label为app名称，model_name为模块名称，等等，需要注意如果要在model中访问meta，需要用self._meta。
    * ImageField的upload_to参数为图片上次目录,DateTimeField的auto_now为自动填充当前时间，BooleanField的choices参数为二维元组，代表可以选择值及其说明。
    * ForeigKey(xxx)xxx为外键所在类
    * 在model中定义的函数，也可以当做model的field，只是不会映射为数据项。allow_tags表示允许包含html标签。
    

6. 可以通过重写django的组件达到更多的功能，比如重写admin.widgets.AdminTextWidget来修改admin的默认的Textarea控件的行数和列数。然后在ModelAdmin中formfield_overrides中覆盖原有field。

        class HighTextarea(admin.widgets.AdminTextareaWidget):
            def __init__(self, attrs=None):
                default_attrs = {'cols': '80', 'rows': '30'}
                if attrs:
                    default_attrs.update(attrs)
                super(HighTextarea, self).__init__(default_attrs)
                
        class AdminChapter(admin.ModelAdmin):
            
            formfield_overrides = {
                models.TextField : {'widget': HighTextarea}
            }
    
    
7. admin中list_per_page表示每页多少行，list_max_show_all表示点击显示所有后最多显示的行数。用django.utils.html.format_html来在代码中输出html，否则都是转义后的。

8. admin的list_display中的元素可以是model的field，也可是model中的函数，也可以是ModelAdmin中的函数，这个函数的第一个参数为当前model对象。

9. admin中的raw_id_fields用于外键，用来生成一个弹窗选择外键所对应的model对象。  