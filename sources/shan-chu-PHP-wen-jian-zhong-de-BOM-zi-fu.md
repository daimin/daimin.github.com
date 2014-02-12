title:删除PHP文件中的BOM字符

tags:php,BOM,utf-8,清除BOM

date:2013-08-10

`BOM`是微软搞出来的，比如如果你用windows上面的记事本程序，另存一个文本文件为utf-8编码，那么在文件头就加上了**BOM(0xEF 0xBB 0xBF，即BOM)**，用来鉴别文件编码格式，但是这在html中就是一行啊，我们在Windows上面写php很容易就加上了BOM。下面是一个脚本，专门用来清除BOM的。

    <?php
    //remove the utf-8 boms
    //by magicbug at gmail dot com
    if (isset($_GET['dir'])){ //要去除的文件目录，无参数则为文件当前目录。
    $basedir=$_GET['dir'];
    }else{
    $basedir = '.';
    }
    $auto = 1;
    checkdir($basedir);
    function checkdir($basedir){
    if ($dh = opendir($basedir)) {
       while (($file = readdir($dh)) !== false) {
        if ($file != '.' && $file != '..'){
         if (!is_dir($basedir."/".$file)) {
          echo "filename: $basedir/
    $file ".checkBOM("$basedir/$file")." <br>";
         }else{
          $dirname = $basedir."/".
    $file;
          checkdir($dirname);
         }
        }
       }
    closedir($dh);
    }
    }
    function checkBOM ($filename) {
    global $auto;
    $contents = file_get_contents($filename);
    $charset[1] = substr($contents, 0, 1);
    $charset[2] = substr($contents, 1, 1);
    $charset[3] = substr($contents, 2, 1);
    if (ord($charset[1]) == 239 && ord($charset[2]) == 187 &&
    ord($charset[3]) == 191) {
       if ($auto == 1) {
        $rest = substr($contents, 3);
        rewrite ($filename, $rest);
        return ("<font color=red>BOM found,
    automatically removed.</font>");
       } else {
        return ("<font color=red>BOM found.
    </font>");
       }
    }
    else return ("BOM Not Found.");
    }
    function rewrite ($filename, $data) {
    $filenum = fopen($filename, "w");
    flock($filenum, LOCK_EX);
    fwrite($filenum, $data);
    fclose($filenum);
    }
    ?>