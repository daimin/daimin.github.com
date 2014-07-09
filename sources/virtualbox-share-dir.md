title:使用VirtualBox使centos和win7共享文件夹设置

tag:VirtualBox,win7,共享

date:2014-04-14


简单的记录一下。

VirtualBox非常好用比vmware好用多了。它的VirtualBox功能，可以让我们直接在windows上面开发代码，而在虚拟机下面运行，这为像我这样不是很熟悉linux开发工具的很受力。

首先共享文件夹，需要安装增强工具包。    

* 运行centos虚拟机，打开设备菜单中点击安装增强功能，悬浮鼠标在右下角的光盘图标上，可以看到当前光盘中是VBoxGuestAdditions.iso，这个是安装增强功能的镜像文件。


* 进入centos，在/media下面mkdir cdrom，然后执行`mount -t iso9660 /dev/cdrom /media/cdrom`，挂载光驱到文件系统，打开/media/cdrom，这里可以看到`VBoxLinuxAdditions.run`，这个是我们需要运行的文件，这里就可以安装增强工具了。  

* 不过首先要安装`yum install kernel-devel kernel-headers`以及`yum install gcc`和`yum install make`，这样安装了还是不行，需要链接一下安装的kernel库，`ln -s /usr/src/kernels/2.6.32-431.11.2.el6.x86_64/ /usr/src/linux`。

* 最后在挂载光驱中执行`./VBoxLinuxAdditions.run`，等待完成就OK，这里可能有几个错误，不过没有关系，它主要是因为UI系统的功能没有安装成功，如果你没有安装x11的话。

OK，安装增强工具完成，开始设置共享文件夹。

虚拟机的设备菜单中选择“共享文件夹”，添加固定分配的共享文件夹，选择需要共享到虚拟机的win7文件夹。设置完成后，进行centos，执行`mkdir /mnt/share`，然后执行`mount -t vboxsf pywork /mnt/share`，**需要注意挂载文件夹名不要和共享文件夹名相同**。

进行/mnt/share，执行`ls -l`，可以看到win7的文件夹内容完全可以在linux下面访问了，而且可以直接用centos下面的命令，运行之。

