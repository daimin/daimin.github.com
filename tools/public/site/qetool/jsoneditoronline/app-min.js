function QueryParams() {
}

QueryParams.prototype.getQuery = function () {
    var e = window.location.search.substring(1);
    var h = e.split("&");
    var g = {};
    for (var d = 0, a = h.length; d < a; d++) {
        var b = h[d].split("=");
        if (b.length == 2) {
            var c = decodeURIComponent(b[0]);
            var f = decodeURIComponent(b[1]);
            g[c] = f
        }
    }
    return g
};
QueryParams.prototype.setQuery = function (d) {
    var b = "";
    for (var a in d) {
        if (d.hasOwnProperty(a)) {
            var c = d[a];
            if (c != undefined) {
                if (b.length) {
                    b += "&"
                }
                b += encodeURIComponent(a);
                b += "=";
                b += encodeURIComponent(d[a])
            }
        }
    }
    window.location.search = (b.length ? ("#" + b) : "")
};
QueryParams.prototype.getValue = function (a) {
    var b = this.getQuery();
    return b[a]
};
QueryParams.prototype.setValue = function (a, c) {
    var b = this.getQuery();
    b[a] = c;
    this.setQuery(b)
};
var ajax = (function () {
    function c(k, f, d, i, j) {
        try {
            var h = new XMLHttpRequest();
            h.onreadystatechange = function () {
                if (h.readyState == 4) {
                    j(h.responseText, h.status)
                }
            };
            h.open(k, f, true);
            if (i) {
                for (var e in i) {
                    if (i.hasOwnProperty(e)) {
                        h.setRequestHeader(e, i[e])
                    }
                }
            }
            h.send(d)
        } catch (g) {
            j(g, 0)
        }
    }

    function a(d, e, f) {
        c("GET", d, null, e, f)
    }

    function b(e, d, f, g) {
        c("POST", e, d, f, g)
    }

    return {fetch: c, get: a, post: b}
})();
var FileRetriever = function (a) {
    a = a || {};
    this.options = {maxSize: ((a.maxSize != undefined) ? a.maxSize : 1024 * 1024), html5: ((a.html5 != undefined) ? a.html5 : true)};
    this.timeout = Number(a.timeout) || 30000;
    this.headers = {Accept: "application/json"};
    this.scriptUrl = a.scriptUrl || "fileretriever.php";
    this.notify = a.notify || undefined;
    this.defaultFilename = "document.json";
    this.dom = {}
};
FileRetriever.prototype._hide = function (a) {
    a.style.visibility = "hidden";
    a.style.position = "absolute";
    a.style.left = "-1000px";
    a.style.top = "-1000px";
    a.style.width = "0";
    a.style.height = "0"
};
FileRetriever.prototype.remove = function () {
    var b = this.dom;
    for (var c in b) {
        if (b.hasOwnProperty(c)) {
            var a = b[c];
            if (a.parentNode) {
                a.parentNode.removeChild(a)
            }
        }
    }
    this.dom = {}
};
FileRetriever.prototype._getFilename = function (a) {
    return a ? a.replace(/^.*[\\\/]/, "") : ""
};
FileRetriever.prototype.setUrl = function (a) {
    this.url = a
};
FileRetriever.prototype.getFilename = function () {
    return this.defaultFilename
};
FileRetriever.prototype.getUrl = function () {
    return this.url
};
FileRetriever.prototype.loadUrl = function (a, f) {
    this.setUrl(a);
    var e = undefined;
    if (this.notify) {
        e = this.notify.showNotification("loading url...")
    }
    var b = this;
    var d = function (g, h) {
        if (f) {
            f(g, h);
            f = undefined
        }
        if (b.notify && e) {
            b.notify.removeMessage(e);
            e = undefined
        }
    };
    var c = this.scriptUrl;
    ajax.get(a, b.headers, function (j, g) {
        if (g == 200) {
            d(null, j)
        } else {
            var i = c + "?url=" + encodeURIComponent(a);
            var h;
            ajax.get(i, b.headers, function (l, k) {
                if (k == 200) {
                    d(null, l)
                } else {
                    if (k == 404) {
                        console.log('Error: url "' + a + '" not found', k, l);
                        h = new Error('Error: url "' + a + '" not found');
                        d(h, null)
                    } else {
                        console.log('Error: failed to load url "' + a + '"', k, l);
                        h = new Error('Error: failed to load url "' + a + '"');
                        d(h, null)
                    }
                }
            })
        }
    });
    setTimeout(function () {
        d(new Error("Error loading url (time out)"))
    }, this.timeout)
};
FileRetriever.prototype.loadFile = function (j) {
    var c = undefined;
    var g = this;
    var h = function () {
        if (g.notify && !c) {
            c = g.notify.showNotification("loading file...")
        }
        setTimeout(function () {
            i(new Error("Error loading url (time out)"))
        }, g.timeout)
    };
    var i = function (k, l) {
        if (j) {
            j(k, l);
            j = undefined
        }
        if (g.notify && c) {
            g.notify.removeMessage(c);
            c = undefined
        }
    };
    var f = "fileretriever-upload-" + Math.round(Math.random() * 1000000000000000);
    var e = document.createElement("iframe");
    e.name = f;
    g._hide(e);
    e.onload = function () {
        var l = e.contentWindow.document.body.innerHTML;
        if (l) {
            var k = g.scriptUrl + "?id=" + l + "&filename=" + g.getFilename();
            ajax.get(k, g.headers, function (o, m) {
                if (m == 200) {
                    i(null, o)
                } else {
                    var n = new Error("Error loading file " + g.getFilename());
                    i(n, null)
                }
            })
        }
    };
    document.body.appendChild(e);
    var b = (navigator.appName == "Microsoft Internet Explorer");
    if (!b) {
        var a = document.createElement("form");
        a.action = this.scriptUrl;
        a.method = "POST";
        a.enctype = "multipart/form-data";
        a.target = f;
        this._hide(a);
        var d = document.createElement("input");
        d.type = "file";
        d.name = "file";
        d.onchange = function () {
            h();
            setTimeout(function () {
                var l = d.value;
                if (l.length) {
                    if (g.options.html5 && window.File && window.FileReader) {
                        var m = d.files[0];
                        var k = new FileReader();
                        k.onload = function (n) {
                            var o = n.target.result;
                            i(null, o)
                        };
                        k.readAsText(m)
                    } else {
                        a.submit()
                    }
                } else {
                    i(null, null)
                }
            }, 0)
        };
        a.appendChild(d);
        document.body.appendChild(a);
        setTimeout(function () {
            d.click()
        }, 0)
    } else {
        this.prompt({
            title: "Open file",
            titleSubmit: "Open",
            inputType: "file",
            inputName: "file",
            formAction: this.scriptUrl,
            formMethod: "POST",
            formTarget: f,
            callback: function (k) {
                if (k) {
                    h()
                }
            }
        })
    }
};
FileRetriever.prototype.loadUrlDialog = function (b) {
    var a = this;
    this.prompt({
        title: "Open url", titleSubmit: "Open", inputType: "text", inputName: "url", inputDefault: this.getUrl(), callback: function (c) {
            if (c) {
                a.loadUrl(c, b)
            } else {
                b()
            }
        }
    })
};
FileRetriever.prototype.prompt = function (e) {
    var i = function () {
        if (a.parentNode) {
            a.parentNode.removeChild(a)
        }
        if (f.parentNode) {
            f.parentNode.removeChild(f)
        }
        jsoneditor.util.removeEventListener(document, "keydown", j)
    };
    var m = function () {
        i();
        if (e.callback) {
            e.callback(null)
        }
    };
    var j = jsoneditor.util.addEventListener(document, "keydown", function (o) {
        o = o || window.event;
        var p = o.which || o.keyCode;
        if (p == 27) {
            m();
            jsoneditor.util.preventDefault(o);
            jsoneditor.util.stopPropagation(o)
        }
    });
    var f = document.createElement("div");
    f.className = "fileretriever-overlay";
    document.body.appendChild(f);
    var b = document.createElement("form");
    b.className = "fileretriever-form";
    b.target = e.formTarget || "";
    b.action = e.formAction || "";
    b.method = e.formMethod || "POST";
    b.enctype = "multipart/form-data";
    b.encoding = "multipart/form-data";
    b.onsubmit = function () {
        if (l.value) {
            setTimeout(function () {
                i()
            }, 0);
            if (e.callback) {
                e.callback(l.value)
            }
            return (e.formAction != undefined && e.formMethod != undefined)
        } else {
            alert("Enter a " + e.inputName + " first...");
            return false
        }
    };
    var k = document.createElement("div");
    k.className = "fileretriever-title";
    k.appendChild(document.createTextNode(e.title || "Dialog"));
    b.appendChild(k);
    var l = document.createElement("input");
    l.className = "fileretriever-field";
    l.type = e.inputType || "text";
    l.name = e.inputName || "text";
    l.value = e.inputDefault || "";
    var c = document.createElement("div");
    c.className = "fileretriever-contents";
    c.appendChild(l);
    b.appendChild(c);
    var n = document.createElement("input");
    n.className = "fileretriever-cancel";
    n.type = "button";
    n.value = e.titleCancel || "Cancel";
    n.onclick = m;
    var g = document.createElement("input");
    g.className = "fileretriever-submit";
    g.type = "submit";
    g.value = e.titleSubmit || "Ok";
    var h = document.createElement("div");
    h.className = "fileretriever-buttons";
    h.appendChild(n);
    h.appendChild(g);
    b.appendChild(h);
    var d = document.createElement("div");
    d.className = "fileretriever-border";
    d.appendChild(b);
    var a = document.createElement("div");
    a.className = "fileretriever-background";
    a.appendChild(d);
    document.body.appendChild(a);
    l.focus();
    l.select()
};
FileRetriever.prototype.saveFile = function (d, g) {
    var e = undefined;
    if (this.notify) {
        e = this.notify.showNotification("saving file...")
    }
    var c = this;
    var f = function (a) {
        if (g) {
            g(a);
            g = undefined
        }
        if (c.notify && e) {
            c.notify.removeMessage(e);
            e = undefined
        }
    };
    var b = document.createElement("a");
    if (this.options.html5 && b.download != undefined) {
        b.href = "data:application/json;charset=utf-8," + encodeURIComponent(d);
        b.download = this.getFilename();
        b.click();
        f()
    } else {
        if (d.length < this.options.maxSize) {
            ajax.post(c.scriptUrl, d, c.headers, function (i, a) {
                if (a == 200) {
                    var h = document.createElement("iframe");
                    h.src = c.scriptUrl + "?id=" + i + "&filename=" + c.getFilename();
                    c._hide(h);
                    document.body.appendChild(h);
                    f()
                } else {
                    f(new Error("Error saving file"))
                }
            })
        } else {
            f(new Error("Maximum allowed file size exceeded (" + this.options.maxSize + " bytes)"))
        }
    }
    setTimeout(function () {
        f(new Error("Error saving file (time out)"))
    }, this.timeout)
};

function Notify() {
    this.dom = {};
    var a = this;
    jsoneditor.util.addEventListener(document, "keydown", function (b) {
        a.onKeyDown(b)
    })
}

Notify.prototype.showNotification = function (a) {
    return this.showMessage({type: "notification", message: a, closeButton: false})
};
Notify.prototype.showError = function (a) {
    return this.showMessage({type: "error", message: (a.message || a.toString()), closeButton: true})
};
Notify.prototype.showMessage = function (e) {
    var c = this.dom.frame;
    if (!c) {
        var b = 500;
        var l = 5;
        var d = document.body.offsetWidth || window.innerWidth;
        c = document.createElement("div");
        c.style.position = "absolute";
        c.style.left = (d - b) / 2 + "px";
        c.style.width = b + "px";
        c.style.top = l + "px";
        c.style.zIndex = "999";
        document.body.appendChild(c);
        this.dom.frame = c
    }
    var k = e.type || "notification";
    var a = (e.closeButton !== false);
    var o = document.createElement("div");
    o.className = k;
    o.type = k;
    o.closeable = a;
    o.style.position = "relative";
    c.appendChild(o);
    var n = document.createElement("table");
    n.style.width = "100%";
    o.appendChild(n);
    var g = document.createElement("tbody");
    n.appendChild(g);
    var j = document.createElement("tr");
    g.appendChild(j);
    var m = document.createElement("td");
    m.innerHTML = e.message || "";
    j.appendChild(m);
    if (a) {
        var f = document.createElement("td");
        f.style.textAlign = "right";
        f.style.verticalAlign = "top";
        j.appendChild(f);
        var h = document.createElement("button");
        h.innerHTML = "&times;";
        h.title = "Close message (ESC)";
        f.appendChild(h);
        var i = this;
        h.onclick = function () {
            i.removeMessage(o)
        }
    }
    return o
};
Notify.prototype.removeMessage = function (a) {
    var b = this.dom.frame;
    if (!a && b) {
        var c = b.firstChild;
        while (c && !c.closeable) {
            c = c.nextSibling
        }
        if (c && c.closeable) {
            a = c
        }
    }
    if (a && a.parentNode == b) {
        a.parentNode.removeChild(a)
    }
    if (b && b.childNodes.length == 0) {
        b.parentNode.removeChild(b);
        delete this.dom.frame
    }
};
Notify.prototype.onKeyDown = function (a) {
    a = a || window.event;
    var b = a.which || a.keyCode;
    if (b == 27) {
        this.removeMessage();
        jsoneditor.util.preventDefault(a);
        jsoneditor.util.stopPropagation(a)
    }
};

function Splitter(b) {
    if (!b || !b.container) {
        throw new Error("params.container undefined in Splitter constructor")
    }
    var a = this;
    jsoneditor.util.addEventListener(b.container, "mousedown", function (c) {
        a.onMouseDown(c)
    });
    this.container = b.container;
    this.snap = Number(b.snap) || 200;
    this.width = undefined;
    this.value = undefined;
    this.onChange = (b.change) ? b.change : function () {
    };
    this.params = {}
}

Splitter.prototype.onMouseDown = function (c) {
    var b = this;
    var a = c.which ? (c.which == 1) : (c.button == 1);
    if (!a) {
        return
    }
    jsoneditor.util.addClassName(this.container, "active");
    if (!this.params.mousedown) {
        this.params.mousedown = true;
        this.params.mousemove = jsoneditor.util.addEventListener(document, "mousemove", function (d) {
            b.onMouseMove(d)
        });
        this.params.mouseup = jsoneditor.util.addEventListener(document, "mouseup", function (d) {
            b.onMouseUp(d)
        });
        this.params.screenX = c.screenX;
        this.params.changed = false;
        this.params.value = this.getValue()
    }
    jsoneditor.util.preventDefault(c);
    jsoneditor.util.stopPropagation(c)
};
Splitter.prototype.onMouseMove = function (a) {
    if (this.width != undefined) {
        var c = a.screenX - this.params.screenX;
        var b = this.params.value + c / this.width;
        b = this.setValue(b);
        if (b != this.params.value) {
            this.params.changed = true
        }
        this.onChange(b)
    }
    jsoneditor.util.preventDefault(a);
    jsoneditor.util.stopPropagation(a)
};
Splitter.prototype.onMouseUp = function (a) {
    jsoneditor.util.removeClassName(this.container, "active");
    if (this.params.mousedown) {
        jsoneditor.util.removeEventListener(document, "mousemove", this.params.mousemove);
        jsoneditor.util.removeEventListener(document, "mouseup", this.params.mouseup);
        this.params.mousemove = undefined;
        this.params.mouseup = undefined;
        this.params.mousedown = false;
        var b = this.getValue();
        if (!this.params.changed) {
            if (b == 0) {
                b = this.setValue(0.2);
                this.onChange(b)
            }
            if (b == 1) {
                b = this.setValue(0.8);
                this.onChange(b)
            }
        }
    }
    jsoneditor.util.preventDefault(a);
    jsoneditor.util.stopPropagation(a)
};
Splitter.prototype.setWidth = function (a) {
    this.width = a
};
Splitter.prototype.setValue = function (a) {
    a = Number(a);
    if (this.width != undefined && this.width > this.snap) {
        if (a < this.snap / this.width) {
            a = 0
        }
        if (a > (this.width - this.snap) / this.width) {
            a = 1
        }
    }
    this.value = a;
    try {
        localStorage.splitterValue = a
    } catch (b) {
        console.log(b)
    }
    return a
};
Splitter.prototype.getValue = function () {
    var a = this.value;
    if (a == undefined) {
        try {
            if (localStorage.splitterValue != undefined) {
                a = Number(localStorage.splitterValue);
                a = this.setValue(a)
            }
        } catch (b) {
            console.log(b)
        }
    }
    if (a == undefined) {
        a = this.setValue(0.5)
    }
    return a
};
/*! http://mths.be/base64 v0.1.0 by @mathias | MIT license */
(function (k) {
    var j = typeof exports == "object" && exports;
    var d = typeof module == "object" && module && module.exports == j && module;
    var c = typeof global == "object" && global;
    if (c.global === c || c.window === c) {
        k = c
    }
    var b = function (m) {
        this.message = m
    };
    b.prototype = new Error;
    b.prototype.name = "InvalidCharacterError";
    var i = function (m) {
        throw new b(m)
    };
    var h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var e = /[\t\n\f\r ]/g;
    var a = function (p) {
        p = String(p).replace(e, "");
        var r = p.length;
        if (r % 4 == 0) {
            p = p.replace(/==?$/, "");
            r = p.length
        }
        if (r % 4 == 1 || /[^+a-zA-Z0-9/]/.test(p)) {
            i("Invalid character: the string to be decoded is not correctly encoded.")
        }
        var s = 0;
        var q;
        var n;
        var o = "";
        var m = -1;
        while (++m < r) {
            n = h.indexOf(p.charAt(m));
            q = s % 4 ? q * 64 + n : n;
            if (s++ % 4) {
                o += String.fromCharCode(255 & q >> (-2 * s & 6))
            }
        }
        return o
    };
    var g = function (u) {
        u = String(u);
        if (/[^\0-\xFF]/.test(u)) {
            i("The string to be encoded contains characters outside of the Latin1 range.")
        }
        var t = u.length % 3;
        var n = "";
        var p = -1;
        var v;
        var s;
        var r;
        var q;
        var o;
        var m = u.length - t;
        while (++p < m) {
            v = u.charCodeAt(p) << 16;
            s = u.charCodeAt(++p) << 8;
            r = u.charCodeAt(++p);
            o = v + s + r;
            n += (h.charAt(o >> 18 & 63) + h.charAt(o >> 12 & 63) + h.charAt(o >> 6 & 63) + h.charAt(o & 63))
        }
        if (t == 2) {
            v = u.charCodeAt(p) << 8;
            s = u.charCodeAt(++p);
            o = v + s;
            n += (h.charAt(o >> 10) + h.charAt((o >> 4) & 63) + h.charAt((o << 2) & 63) + "=")
        } else {
            if (t == 1) {
                o = u.charCodeAt(p);
                n += (h.charAt(o >> 2) + h.charAt((o << 4) & 63) + "==")
            }
        }
        return n
    };
    var f = {encode: g, decode: a, version: "0.1.0"};
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        define(function () {
            return f
        })
    } else {
        if (j && !j.nodeType) {
            if (d) {
                d.exports = f
            } else {
                for (var l in f) {
                    f.hasOwnProperty(l) && (j[l] = f[l])
                }
            }
        } else {
            k.base64 = f
        }
    }
}(this));
/*!
 * @file app.js
 *
 * @brief
 * JSONEditor is an editor to display and edit JSON data in a treeview.
 *
 * Supported browsers: Chrome, Firefox, Safari, Opera, Internet Explorer 8+
 *
 * @license
 * This json editor is open sourced with the intention to use the editor as
 * a component in your own application. Not to just copy and monetize the editor
 * as it is.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 * Copyright (C) 2011-2013 Jos de Jong, http://www.jsoneditoronline.cn
 *
 * @author  Jos de Jong, <wjosdejong@gmail.com>
 * @date    2013-03-08
 */
var editor = null;
var formatter = null;
var app = {};
var cacheSaveKey = "qetool_onlinejsoneditor_savekey";
app.CodeToEditor = function () {
    try {
        editor.set(formatter.get())
    } catch (a) {
        app.notify.showError(a)
    }
};
app.editorToCode = function () {
    try {
        formatter.set(editor.get())
    } catch (a) {
        app.notify.showError(a)
    }
};
app.load = function () {
    try {
        app.notify = new Notify();
        app.retriever = new FileRetriever({scriptUrl: "fileretriever.php", notify: app.notify});
        var m = {};
        let cacheVal = localStorage.getItem(cacheSaveKey);
        if(cacheVal){
            try{
                m = JSON.parse(cacheVal);
            }catch (e) {
               m = {}
            }
        }
        function d(o) {
            var n = null, p = [];
            location.search.substr(1).split("&").forEach(function (q) {
                p = q.split("=");
                if (p[0] === o) {
                    n = decodeURIComponent(p[1])
                }
            });
            return n
        }

        var e = d("data");
        if (e) {
            m = JSON.parse(base64.decode(e))
        }
        if (window.QueryParams) {
            var j = new QueryParams();
            var a = j.getValue("url");
            if (a) {
                m = {};
                app.openUrl(a)
            }
        }
        app.lastChanged = undefined;
        var b = document.getElementById("jsonformatter");
        formatter = new jsoneditor.JSONFormatter(b, {
            mode: "code", change: function () {
                app.lastChanged = formatter
            }
        });
        formatter.set(m);
        formatter.onError = function (n) {
            app.notify.showError(n)
        };
        b = document.getElementById("jsoneditor");
        editor = new jsoneditor.JSONEditor(b, {
            change: function () {
                app.lastChanged = editor
            }
        });
        editor.set(m);
        app.splitter = new Splitter({
            container: document.getElementById("drag"), change: function () {
                app.resize()
            }
        });
        var l = document.getElementById("toEditor");
        l.onclick = function () {
            try{
                localStorage.setItem(cacheSaveKey, JSON.stringify(formatter.get()));
            }catch (e) {
            }
            this.focus();
            app.CodeToEditor()
        };
        var g = document.getElementById("toCode");
        g.onclick = function () {
            this.focus();
            app.editorToCode()
            try{
                localStorage.setItem(cacheSaveKey, JSON.stringify(formatter.get()));
            }catch (e) {
            }
        };
        jsoneditor.util.addEventListener(window, "resize", app.resize);
        var k = document.getElementById("clear");
        k.onclick = app.clearFile;
        var c = document.getElementById("menuOpenFile");
        c.onclick = function (n) {
            app.openFile();
            jsoneditor.util.stopPropagation(n);
            jsoneditor.util.preventDefault(n)
        };
        // var h = document.getElementById("menuOpenUrl");
        // h.onclick = function (n) {
        //     app.openUrl();
        //     jsoneditor.util.stopPropagation(n);
        //     jsoneditor.util.preventDefault(n)
        // };
        var i = document.getElementById("save");
        i.onclick = app.saveFile;
        formatter.focus();
        document.body.spellcheck = false
    } catch (f) {
        app.notify.showError(f)
    }
};
app.openCallback = function (b, c) {
    if (!b) {
        if (c != undefined) {
            formatter.setText(c);
            try {
                var a = jsoneditor.util.parse(c);
                editor.set(a)
            } catch (b) {
                editor.set({});
                app.notify.showError(b)
            }
        }
    } else {
        app.notify.showError(b)
    }
};
app.openFile = function () {
    app.retriever.loadFile(app.openCallback)
};
app.openUrl = function (a) {
    if (!a) {
        app.retriever.loadUrlDialog(app.openCallback)
    } else {
        app.retriever.loadUrl(a, app.openCallback)
    }
};
app.saveFile = function () {
    if (app.lastChanged == editor) {
        app.editorToCode()
    }
    app.lastChanged = undefined;
    var a = formatter.getText();
    app.retriever.saveFile(a, function (b) {
        if (b) {
            app.notify.showError(b)
        }
    })
};
app.clearFile = function () {
    var a = {};
    formatter.set(a);
    editor.set(a)
};
app.resize = function () {
    var g = document.getElementById("menu");
    var a = document.getElementById("jsoneditor");
    var f = document.getElementById("jsonformatter");
    var i = document.getElementById("splitter");
    var l = document.getElementById("buttons");
    var q = document.getElementById("drag");
    var c = document.getElementById("ad");
    var j = 15;
    var d = (window.innerWidth || document.body.offsetWidth || document.documentElement.offsetWidth);
    var e = c ? c.clientWidth : 0;
    if (e) {
        d -= (e + j)
    }
    if (app.splitter) {
        app.splitter.setWidth(d);
        var n = app.splitter.getValue();
        var p = (n > 0);
        var m = (n < 1);
        var k = p && m;
        l.style.display = k ? "" : "none";
        var o = i.clientWidth;
        var b;
        if (!p) {
            b = 0;
            q.innerHTML = "&rsaquo;";
            q.title = "Drag right to show the code editor"
        } else {
            if (!m) {
                b = d * n - o;
                q.innerHTML = "&lsaquo;";
                q.title = "Drag left to show the tree editor"
            } else {
                b = d * n - o / 2;
                var h = (jsoneditor.util.getInternetExplorerVersion() == 8);
                q.innerHTML = (!h) ? "&#8942;" : "|";
                q.title = "Drag left or right to change the width of the panels"
            }
        }
        f.style.display = (n == 0) ? "none" : "";
        f.style.width = Math.max(Math.round(b), 0) + "px";
        formatter.resize();
        q.style.height = (i.clientHeight - l.clientHeight - 2 * j - (k ? j : 0)) + "px";
        q.style.lineHeight = q.style.height;
        a.style.display = (n == 1) ? "none" : "";
        a.style.left = Math.round(b + o) + "px";
        a.style.width = Math.max(Math.round(d - b - o - 2), 0) + "px"
    }
    if (g) {
        if (e) {
            g.style.right = (j + (e + j)) + "px"
        } else {
            g.style.right = j + "px"
        }
    }
};