title:豆瓣api的电影信息查询app

tags:豆瓣,电影,douban,api,app

date:2013-08-09

>其实很简单的的app，就是可以根据关键字查询电影，生成一个电影列表，然后点击列表项里面能显示详细介绍。
***
####一，原理
1. 使用[豆瓣](http://www.douban.com)的api，现在是v2版本了，可以从[这里](http://developers.douban.com/wiki/?title=api_v2)查看详细。需要注意的是必须设置`User-Agent`这个请求头，否则返回的就是500错误了。
          httpGet.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.22 (KHTML,     like Gecko) Chrome/25.0.1364.172 Safari/537.22");

2. 至于android那边我用的HttpClient，这个很简单的。

        String uString=	Douban.HOST + "search?q=" + ch + "&start=" + off + "&count=" +   Douban.PAGE_SIZE;
        HttpGet httpGet = new HttpGet(uString);
        HttpParams httpParams = new BasicHttpParams();  
        HttpConnectionParams.setConnectionTimeout(httpParams,  
                 Douban.NET_TIME_OUT);  
        HttpConnectionParams.setSoTimeout(httpParams,  
        	 Douban.NET_TIME_OUT); 
        httpGet.setParams(httpParams);
        //X，竟然要模仿浏览器
        httpGet.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.22 (KHTML, like         Gecko) Chrome/25.0.1364.172 Safari/537.22");
        HttpClient httpclient = new DefaultHttpClient();
        HttpResponse response = httpclient.execute(httpGet);

3. android3.0以后就不能从主线程中访问网络了，否则就会抛出一个异常`NetworkOnMainThreadException`，而且是`RuntimeException`，需要注意，可以用Handler或者是AsyncTask来处理。

4. 图片的下载也是，因为图片的下载肯定也是异步的，所以不能在当前网络线程中访问，更不能在主线程里面处理，最好再起一个线程，这里推荐`AsyncTask`。

         public class ImageLoader extends AsyncTask<Integer, Integer, String> {

            private ImageView imgView;
            private String url = null;
            private Bitmap bm = null;

            public ImageLoader(ImageView imgView, String url) {  
                super();  
                this.imgView = imgView;
                this.url = url;
            }

            @Override
            protected String doInBackground(Integer... arg0) {
        
                InputStream is = null;
                URL aryURI = null;
                try {
                    aryURI = new URL(url);
                    is = aryURI.openStream();
                    bm = BitmapFactory.decodeStream(is);
            
                } catch (MalformedURLException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }finally{
                    try {
                        is.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                return null;
            }
    
            @Override
            protected void onPostExecute(String result) {
                this.imgView.setImageBitmap(bm);
            }

        }

5. 还有很多的不完善之处，比如图片的缓存处理，甚至是JSON数据的缓存处理，还有推出后恢复现场的处理，而且还可以接入douban更多的接口，UI也不是很好看。

6. 可以从[这里](http://vagascanner.googlecode.com/files/FDouBan.zip)下载。