title:在iTerm2中的vim使用solarized配色

tag:vim

date:2015-03-26

>一直很心水solarized主题，可是在iTerm2中vim无法正常的使用，会有一层朦朦的背景色，在macvim到是可以，但是主要还是使用iTerm2的vim。

折腾了很久，按照网上的方案一直不行，最后在[https://github.com/altercation/solarized/tree/master/iterm2-colors-solarized](https://github.com/altercation/solarized/tree/master/iterm2-colors-solarized)找到了方法：


这个目录下有两个iTerm2的solarized配色方案，我是用的dark的。
然后如下：

Open iTerm 2, open Preferences, click on the "Profiles" (formerly Addresses, formerly Bookmarks) icon in the preferences toolbar, then select the "colors" tab. Click on the "load presets" and select "import...". Select the Solarized Light or Dark theme file.

You have now loaded the Solarized color presets into iTerm 2, but haven't yet applied them. To apply them, simply select an existing profile from the profile list window on the left, or create a new profile. Then select the Solarized Dark or Solarized Light preset from the "Load Presets" drop down.

简单来说就是在iTerm2的Profiles edit中，选择colors tab，然后点击"load presets"，就可以加载你下载的配置方案了。

然后在当前的profile中在"load presets"下拉列表中选择刚刚load的配色方案，你会发现你的整个iterm2界面都成了solarized了。

最后可以再profile列表中的，"Other Actions"下拉列表中选择"Bulk Copy from Selected Profile"，将当前的colors方案拷贝到其它profile中，这样你所有的profile的iTerm2界面都是solarized了。

最后回到vim，修改~/.vimrc，加入：

    set background=dark
    colo solarized

ok，发现vim的solarized也正常使用了。

