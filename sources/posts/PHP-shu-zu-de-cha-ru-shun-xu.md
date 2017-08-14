title:PHP数组的插入顺序

tags:php,数组,错误

date:2013-08-07

>这个问题，纠结了我2个小时，一直的找bug。

* 其实就是以为php数组如果是整形键值的话，会自动的按数值的从大到小排序，其实呢，人家php才不管它的key是什么，它都一视同仁，不管是数值还是字符串都是按照插入顺序的。
* 是的，其实php的数组更像是map，但是它又维持着插入顺序，好吧，主要是自己想当然的，记在这里。

**罪魁祸首就是它：** 

    private function _fillEmptyPaytype($paytypes){
        foreach($this->PAY_TYPES as $pk=>$pv){
            if(!isset($paytypes[$pk])){
               $paytypes[$pk] = '0.00';
            }
        }
        ksort($paytypes);
        return $paytypes;
    }

如上，加上**ksort**就可以了。


