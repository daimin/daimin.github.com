function goto_page(url) {
    location.href = url
}

function addCookie(objName, objValue, objHours) {
    var str = objName + "=" + escape(objValue); //编码
    if (objHours > 0) {//为0时不设定过期时间，浏览器关闭时cookie自动消失
        var date = new Date();
        var ms = objHours * 3600 * 1000;
        date.setTime(date.getTime() + ms);
        str += "; expires=" + date.toGMTString();
    }
    document.cookie = str;
}

//读Cookie
function getCookie(objName) {//获取指定名称的cookie的值
    var arrStr = document.cookie.split("; ");
    for (var i = 0; i < arrStr.length; i++) {
        var temp = arrStr[i].split("=");
        if (temp[0] == objName) return unescape(temp[1]);  //解码
    }
    return "";
}

function guid() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

var userKey = "___www_qetool_com_user_key_v003"
$(function () {
    let userVal = localStorage.getItem(userKey)
    if(userVal == null){
        localStorage.removeItem("___www_qetool_com_user_key")
        localStorage.removeItem("___www_qetool_com_user_key_v001")
        localStorage.removeItem("___www_qetool_com_user_key_v002")
        userVal = guid()
        $.ajax({
            url: "/gapi/reg_uid",
            type: 'post',
            data: JSON.stringify({"uid":userVal}),
            contentType: "application/json;charset=utf-8",
            dataType:'json',
            success: function (resultJo) {
                if(resultJo['code'] != 0){
                    window.alert(resultJo['errMsg'])
                } else {
                    localStorage.setItem(userKey, userVal)
                }
            }
        });
    }
})

function get_uid() {
    return localStorage.getItem(userKey)
}