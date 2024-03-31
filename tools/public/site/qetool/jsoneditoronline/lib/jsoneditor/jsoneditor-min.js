/*
 @file jsoneditor.js

 @brief
 JSONEditor is a web-based tool to view, edit, and format JSON.
 It shows data a clear, editable treeview.

 Supported browsers: Chrome, Firefox, Safari, Opera, Internet Explorer 8+

 @license
 This json editor is open sourced with the intention to use the editor as
 a component in your own application. Not to just copy and monetize the editor
 as it is.

 Licensed under the Apache License, Version 2.0 (the "License"); you may not
 use this file except in compliance with the License. You may obtain a copy
 of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 License for the specific language governing permissions and limitations under
 the License.

 Copyright (c) 2011-2013 Jos de Jong, http://www.jsoneditoronline.cn

 @author  Jos de Jong, <wjosdejong@gmail.com>
 @date    2013-02-21
*/
(function () {
    var d = d || {};
    d.JSONEditor = function (a, b, c) {
        if (!(this instanceof d.JSONEditor)) throw Error('JSONEditor constructor called without "new".');
        if ("undefined" == typeof JSON) throw Error("Your browser does not support JSON. \n\nPlease install the newest version of your browser.\n(all modern browsers support JSON).");
        if (!a) throw Error("No container element provided.");
        this.container = a;
        this.dom = {};
        this.highlighter = new d.Highlighter;
        this.selection = void 0;
        this._setOptions(b);
        this.options.history && !this.mode.viewer &&
        (this.history = new d.History(this));
        this._createFrame();
        this._createTable();
        this.set(c || {})
    };
    d.JSONEditor.prototype._setOptions = function (a) {
        this.options = {search: !0, history: !0, mode: "editor", name: void 0};
        if (a) {
            for (var b in a) a.hasOwnProperty(b) && (this.options[b] = a[b]);
            a.enableSearch && (this.options.search = a.enableSearch, console.log('WARNING: Option "enableSearch" is deprecated. Use "search" instead.'));
            a.enableHistory && (this.options.history = a.enableHistory, console.log('WARNING: Option "enableHistory" is deprecated. Use "history" instead.'))
        }
        this.mode =
            {editor: "viewer" != this.options.mode && "form" != this.options.mode, viewer: "viewer" == this.options.mode, form: "form" == this.options.mode}
    };
    d.JSONEditor.focusNode = void 0;
    d.JSONEditor.prototype.set = function (a, b) {
        b && (this.options.name = b);
        a instanceof Function || void 0 === a ? this.clear() : (this.content.removeChild(this.table), a = new d.Node(this, {
            field: this.options.name,
            value: a
        }), this._setRoot(a), this.node.expand(!1), this.content.appendChild(this.table));
        this.history && this.history.clear()
    };
    d.JSONEditor.prototype.get =
        function () {
            d.JSONEditor.focusNode && d.JSONEditor.focusNode.blur();
            if (this.node) return this.node.getValue()
        };
    d.JSONEditor.prototype.setName = function (a) {
        this.options.name = a;
        this.node && this.node.updateField(this.options.name)
    };
    d.JSONEditor.prototype.getName = function () {
        return this.options.name
    };
    d.JSONEditor.prototype.clear = function () {
        this.node && (this.node.collapse(), this.tbody.removeChild(this.node.getDom()), delete this.node)
    };
    d.JSONEditor.prototype._setRoot = function (a) {
        this.clear();
        this.node = a;
        this.tbody.appendChild(a.getDom())
    };
    d.JSONEditor.prototype.search = function (a) {
        this.node ? (this.content.removeChild(this.table), a = this.node.search(a), this.content.appendChild(this.table)) : a = [];
        return a
    };
    d.JSONEditor.prototype.expandAll = function () {
        this.node && (this.content.removeChild(this.table), this.node.expand(), this.content.appendChild(this.table))
    };
    d.JSONEditor.prototype.collapseAll = function () {
        this.node && (this.content.removeChild(this.table), this.node.collapse(), this.content.appendChild(this.table))
    };
    d.JSONEditor.prototype._onAction =
        function (a, b) {
            this.history && this.history.add(a, b);
            if (this.options.change) try {
                this.options.change()
            } catch (c) {
                console.log("Error in change callback: ", c)
            }
        };
    d.JSONEditor.prototype.startAutoScroll = function (a) {
        var b = this, c = this.content, e = d.util.getAbsoluteTop(c), f = c.clientHeight, g = e + f;
        (this.autoScrollStep = a < e + 24 && 0 < c.scrollTop ? (e + 24 - a) / 3 : a > g - 24 && f + c.scrollTop < c.scrollHeight ? (g - 24 - a) / 3 : void 0) ? this.autoScrollTimer || (this.autoScrollTimer = setInterval(function () {
            b.autoScrollStep ? c.scrollTop -= b.autoScrollStep :
                b.stopAutoScroll()
        }, 50)) : this.stopAutoScroll()
    };
    d.JSONEditor.prototype.stopAutoScroll = function () {
        this.autoScrollTimer && (clearTimeout(this.autoScrollTimer), delete this.autoScrollTimer);
        this.autoScrollStep && delete this.autoScrollStep
    };
    d.JSONEditor.prototype.setSelection = function (a) {
        a && ("scrollTop" in a && this.content && (this.content.scrollTop = a.scrollTop), a.range && d.util.setSelectionOffset(a.range), a.dom && a.dom.focus())
    };
    d.JSONEditor.prototype.getSelection = function () {
        return {
            dom: d.JSONEditor.domFocus, scrollTop: this.content ?
                this.content.scrollTop : 0, range: d.util.getSelectionOffset()
        }
    };
    d.JSONEditor.prototype.scrollTo = function (a, b) {
        var c = this.content;
        if (c) {
            var e = this;
            e.animateTimeout && (clearTimeout(e.animateTimeout), delete e.animateTimeout);
            e.animateCallback && (e.animateCallback(!1), delete e.animateCallback);
            var f = c.clientHeight, g = Math.min(Math.max(a - f / 4, 0), c.scrollHeight - f), h = function () {
                var k = g - c.scrollTop;
                3 < Math.abs(k) ? (c.scrollTop += k / 3, e.animateCallback = b, e.animateTimeout = setTimeout(h, 50)) : (b && b(!0), c.scrollTop = g, delete e.animateTimeout,
                    delete e.animateCallback)
            };
            h()
        } else b && b(!1)
    };
    d.JSONEditor.prototype._createFrame = function () {
        this.container.innerHTML = "";
        this.frame = document.createElement("div");
        this.frame.className = "jsoneditor";
        this.container.appendChild(this.frame);
        var a = this, b = function (g) {
            a._onEvent(g)
        };
        this.frame.onclick = function (g) {
            b(g);
            d.util.preventDefault(g)
        };
        this.frame.oninput = b;
        this.frame.onchange = b;
        this.frame.onkeydown = b;
        this.frame.onkeyup = b;
        this.frame.oncut = b;
        this.frame.onpaste = b;
        this.frame.onmousedown = b;
        this.frame.onmouseup =
            b;
        this.frame.onmouseover = b;
        this.frame.onmouseout = b;
        d.util.addEventListener(this.frame, "focus", b, !0);
        d.util.addEventListener(this.frame, "blur", b, !0);
        this.frame.onfocusin = b;
        this.frame.onfocusout = b;
        this.menu = document.createElement("div");
        this.menu.className = "menu";
        this.frame.appendChild(this.menu);
        var c = document.createElement("button");
        c.className = "expand-all";
        c.title = "Expand all fields";
        c.onclick = function () {
            a.expandAll()
        };
        this.menu.appendChild(c);
        c = document.createElement("button");
        c.title = "Collapse all fields";
        c.className = "collapse-all";
        c.onclick = function () {
            a.collapseAll()
        };
        this.menu.appendChild(c);
        if (this.history) {
            c = document.createElement("span");
            c.innerHTML = "&nbsp;";
            this.menu.appendChild(c);
            var e = document.createElement("button");
            e.className = "undo";
            e.title = "Undo last action (Ctrl+Z)";
            e.onclick = function () {
                a._onUndo()
            };
            this.menu.appendChild(e);
            this.dom.undo = e;
            var f = document.createElement("button");
            f.className = "redo";
            f.title = "Redo (Ctrl+Shift+Z)";
            f.onclick = function () {
                a._onRedo()
            };
            this.menu.appendChild(f);
            this.dom.redo = f;
            this.history.onChange = function () {
                e.disabled = !a.history.canUndo();
                f.disabled = !a.history.canRedo()
            };
            this.history.onChange()
        }
        this.options.search && (this.searchBox = new d.SearchBox(this, this.menu))
    };
    d.JSONEditor.prototype._onUndo = function () {
        this.history && (this.history.undo(), this.options.change && this.options.change())
    };
    d.JSONEditor.prototype._onRedo = function () {
        this.history && (this.history.redo(), this.options.change && this.options.change())
    };
    d.JSONEditor.prototype._onEvent = function (a) {
        a = a ||
            window.event;
        var b = a.target || a.srcElement;
        "keydown" == a.type && this._onKeyDown(a);
        "focus" == a.type && (d.JSONEditor.domFocus = b);
        if (b = d.Node.getNodeFromTarget(b)) b.onEvent(a)
    };
    d.JSONEditor.prototype._onKeyDown = function (a) {
        var b = a.which || a.keyCode, c = a.ctrlKey, e = a.shiftKey, f = !1;
        9 == b && setTimeout(function () {
            d.util.selectContentEditable(d.JSONEditor.domFocus)
        }, 0);
        if (this.searchBox) if (c && 70 == b) this.searchBox.dom.search.focus(), this.searchBox.dom.search.select(), f = !0; else if (114 == b || c && 71 == b) e ? this.searchBox.previous(!0) :
            this.searchBox.next(!0), f = !0;
        this.history && (c && !e && 90 == b ? (this._onUndo(), f = !0) : c && e && 90 == b && (this._onRedo(), f = !0));
        f && (d.util.preventDefault(a), d.util.stopPropagation(a))
    };
    d.JSONEditor.prototype._createTable = function () {
        var a = document.createElement("div");
        a.className = "outer";
        this.contentOuter = a;
        this.content = document.createElement("div");
        this.content.className = "content";
        a.appendChild(this.content);
        this.table = document.createElement("table");
        this.table.className = "content";
        this.content.appendChild(this.table);
        8 == d.util.getInternetExplorerVersion() && (this.content.style.overflow = "scroll");
        this.colgroupContent = document.createElement("colgroup");
        var b = document.createElement("col");
        b.width = "24px";
        this.colgroupContent.appendChild(b);
        b = document.createElement("col");
        b.width = "24px";
        this.colgroupContent.appendChild(b);
        b = document.createElement("col");
        this.colgroupContent.appendChild(b);
        this.table.appendChild(this.colgroupContent);
        this.tbody = document.createElement("tbody");
        this.table.appendChild(this.tbody);
        this.frame.appendChild(a)
    };
    d = d || {};
    d.JSONFormatter = function (a, b, c) {
        if (!(this instanceof d.JSONFormatter)) throw Error('JSONFormatter constructor called without "new".');
        if ("undefined" == typeof JSON) throw Error("Your browser does not support JSON. \n\nPlease install the newest version of your browser.\n(all modern browsers support JSON).");
        b = b || {};
        b.indentation && (this.indentation = Number(b.indentation));
        this.mode = "code" == b.mode ? "code" : "text";
        "code" == this.mode && ("undefined" === typeof ace && (this.mode = "text", console.log("WARNING: Cannot load code editor, Ace library not loaded. Falling back to plain text editor")),
        8 == d.util.getInternetExplorerVersion() && (this.mode = "text", console.log("WARNING: Cannot load code editor, Ace is not supported on IE8. Falling back to plain text editor")));
        var e = this;
        this.container = a;
        this.textarea = this.editor = void 0;
        this.indentation = 4;
        this.width = a.clientWidth;
        this.height = a.clientHeight;
        this.frame = document.createElement("div");
        this.frame.className = "jsoneditor";
        this.frame.onclick = function (f) {
            d.util.preventDefault(f)
        };
        this.menu = document.createElement("div");
        this.menu.className = "menu";
        this.frame.appendChild(this.menu);
        a = document.createElement("button");
        a.className = "format";
        a.title = "以合适的缩进和换行来格式化JSON数据";
        this.menu.appendChild(a);
        var la = document.createElement("span")
        la.className="lmenu-label"
        la.innerText = "格式化"
        this.menu.appendChild(la)
        a.onclick = function () {
            e.format()
        };
        a = document.createElement("button");
        a.className = "compact";
        a.title = "压缩JSON数据，去掉所有的空白字符";
        this.menu.appendChild(a);
        la = document.createElement("span")
        la.className="lmenu-label"
        la.innerText = "压缩"
        this.menu.appendChild(la)
        a.onclick = function () {
            e.compact()
        };
        this.content = document.createElement("div");
        this.content.className = "outer";
        this.frame.appendChild(this.content);
        this.container.appendChild(this.frame);
        if ("code" == this.mode) {
            if (this.editorDom = document.createElement("div"), this.editorDom.style.height = "100%", this.editorDom.style.width = "100%", this.content.appendChild(this.editorDom), a = ace.edit(this.editorDom), a.$blockScrolling=Infinity, a.setTheme("ace/theme/xcode"), a.setShowPrintMargin(!1), a.setFontSize(13), a.getSession().setMode("ace/mode/json"), a.getSession().setUseSoftTabs(!0), a.getSession().setUseWrapMode(!0), this.editor = a, b.change) a.on("change", function () {
                b.change()
            })
        } else a = document.createElement("textarea"), a.className =
            "content", a.spellcheck = !1, this.content.appendChild(a), this.textarea = a, b.change && (null === this.textarea.oninput ? this.textarea.oninput = function () {
            b.change()
        } : this.textarea.onchange = function () {
            b.change()
        });
        "undefined" != typeof c && ("string" == typeof c ? this.setText(c) : this.set(c))
    };
    d.JSONFormatter.prototype.onError = function (a) {
    };
    d.JSONFormatter.prototype.compact = function () {
        try {
            var a = d.util.parse(this.getText());
            this.setText(JSON.stringify(a))
        } catch (b) {
            this.onError(b)
        }
    };
    d.JSONFormatter.prototype.format = function () {
        try {
            var a =
                d.util.parse(this.getText());
            this.setText(JSON.stringify(a, null, this.indentation))
        } catch (b) {
            this.onError(b)
        }
    };
    d.JSONFormatter.prototype.focus = function () {
        this.textarea && this.textarea.focus();
        this.editor && this.editor.focus()
    };
    d.JSONFormatter.prototype.resize = function () {
        this.editor && this.editor.resize(!1)
    };
    d.JSONFormatter.prototype.set = function (a) {
        this.setText(JSON.stringify(a, null, this.indentation))
    };
    d.JSONFormatter.prototype.get = function () {
        return d.util.parse(this.getText())
    };
    d.JSONFormatter.prototype.getText =
        function () {
            return this.textarea ? this.textarea.value : this.editor ? this.editor.getValue() : ""
        };
    d.JSONFormatter.prototype.setText = function (a) {
        this.textarea && (this.textarea.value = a);
        if (this.editor) return this.editor.setValue(a, -1)
    };
    d = d || {};
    d.Node = function (a, b) {
        this.editor = a;
        this.dom = {};
        this.expanded = !1;
        b && b instanceof Object ? (this.setField(b.field, b.fieldEditable), this.setValue(b.value, b.type)) : (this.setField(""), this.setValue(null))
    };
    d.Node.prototype.setParent = function (a) {
        this.parent = a
    };
    d.Node.prototype.setField =
        function (a, b) {
            this.field = a;
            this.fieldEditable = 1 == b
        };
    d.Node.prototype.getField = function () {
        void 0 === this.field && this._getDomField();
        return this.field
    };
    d.Node.prototype.setValue = function (a, b) {
        var c = this.childs;
        if (c) for (; c.length;) this.removeChild(c[0]);
        this.type = this._getType(a);
        if (b && b != this.type) if ("string" == b && "auto" == this.type) this.type = b; else throw Error('Type mismatch: cannot cast value of type "' + this.type + ' to the specified type "' + b + '"');
        if ("array" == this.type) {
            this.childs = [];
            var e = 0;
            for (c = a.length; e <
            c; e++) b = a[e], void 0 === b || b instanceof Function || (b = new d.Node(this.editor, {value: b}), this.appendChild(b));
            this.value = ""
        } else if ("object" == this.type) {
            this.childs = [];
            for (e in a) a.hasOwnProperty(e) && (b = a[e], void 0 === b || b instanceof Function || (b = new d.Node(this.editor, {field: e, value: b}), this.appendChild(b)));
            this.value = ""
        } else this.childs = void 0, this.value = a
    };
    d.Node.prototype.getValue = function () {
        if ("array" == this.type) {
            var a = [];
            this.childs.forEach(function (c) {
                a.push(c.getValue())
            });
            return a
        }
        if ("object" ==
            this.type) {
            var b = {};
            this.childs.forEach(function (c) {
                b[c.getField()] = c.getValue()
            });
            return b
        }
        void 0 === this.value && this._getDomValue();
        return this.value
    };
    d.Node.prototype.getLevel = function () {
        return this.parent ? this.parent.getLevel() + 1 : 0
    };
    d.Node.prototype.clone = function () {
        var a = new d.Node(this.editor);
        a.type = this.type;
        a.field = this.field;
        a.fieldInnerText = this.fieldInnerText;
        a.fieldEditable = this.fieldEditable;
        a.value = this.value;
        a.valueInnerText = this.valueInnerText;
        a.expanded = this.expanded;
        if (this.childs) {
            var b =
                [];
            this.childs.forEach(function (c) {
                c = c.clone();
                c.setParent(a);
                b.push(c)
            });
            a.childs = b
        } else a.childs = void 0;
        return a
    };
    d.Node.prototype.expand = function (a) {
        this.childs && (this.expanded = !0, this.dom.expand && (this.dom.expand.className = "expanded"), this.showChilds(), 0 != a && this.childs.forEach(function (b) {
            b.expand(a)
        }))
    };
    d.Node.prototype.collapse = function (a) {
        this.childs && (this.hideChilds(), 0 != a && this.childs.forEach(function (b) {
            b.collapse(a)
        }), this.dom.expand && (this.dom.expand.className = "collapsed"), this.expanded =
            !1)
    };
    d.Node.prototype.showChilds = function () {
        if (this.childs && this.expanded) {
            var a = this.dom.tr, b = a ? a.parentNode : void 0;
            if (b) {
                var c = this.getAppend();
                (a = a.nextSibling) ? b.insertBefore(c, a) : b.appendChild(c);
                this.childs.forEach(function (e) {
                    b.insertBefore(e.getDom(), c);
                    e.showChilds()
                })
            }
        }
    };
    d.Node.prototype.hide = function () {
        var a = this.dom.tr, b = a ? a.parentNode : void 0;
        b && b.removeChild(a);
        this.hideChilds()
    };
    d.Node.prototype.hideChilds = function () {
        if (this.childs && this.expanded) {
            var a = this.getAppend();
            a.parentNode &&
            a.parentNode.removeChild(a);
            this.childs.forEach(function (b) {
                b.hide()
            })
        }
    };
    d.Node.prototype.appendChild = function (a) {
        if (this._hasChilds()) {
            a.setParent(this);
            a.fieldEditable = "object" == this.type;
            "array" == this.type && (a.index = this.childs.length);
            this.childs.push(a);
            if (this.expanded) {
                var b = a.getDom(), c = this.getAppend(), e = c ? c.parentNode : void 0;
                c && e && e.insertBefore(b, c);
                a.showChilds()
            }
            this.updateDom({updateIndexes: !0});
            a.updateDom({recurse: !0})
        }
    };
    d.Node.prototype.moveBefore = function (a, b) {
        if (this._hasChilds()) {
            var c =
                this.dom.tr ? this.dom.tr.parentNode : void 0;
            if (c) {
                var e = document.createElement("tr");
                e.style.height = c.clientHeight + "px";
                c.appendChild(e)
            }
            a.parent && a.parent.removeChild(a);
            b instanceof d.AppendNode ? this.appendChild(a) : this.insertBefore(a, b);
            c && c.removeChild(e)
        }
    };
    d.Node.prototype.moveTo = function (a, b) {
        a.parent == this && this.childs.indexOf(a) < b && b++;
        this.moveBefore(a, this.childs[b] || this.append)
    };
    d.Node.prototype.insertBefore = function (a, b) {
        if (this._hasChilds()) {
            if (b == this.append) a.setParent(this), a.fieldEditable =
                "object" == this.type, this.childs.push(a); else {
                var c = this.childs.indexOf(b);
                if (-1 == c) throw Error("Node not found");
                a.setParent(this);
                a.fieldEditable = "object" == this.type;
                this.childs.splice(c, 0, a)
            }
            if (this.expanded) {
                c = a.getDom();
                var e = (b = b.getDom()) ? b.parentNode : void 0;
                b && e && e.insertBefore(c, b);
                a.showChilds()
            }
            this.updateDom({updateIndexes: !0});
            a.updateDom({recurse: !0})
        }
    };
    d.Node.prototype.insertAfter = function (a, b) {
        this._hasChilds() && (b = this.childs.indexOf(b), (b = this.childs[b + 1]) ? this.insertBefore(a, b) :
            this.appendChild(a))
    };
    d.Node.prototype.search = function (a) {
        var b = [], c = a ? a.toLowerCase() : void 0;
        delete this.searchField;
        delete this.searchValue;
        if (void 0 != this.field) {
            var e = String(this.field).toLowerCase().indexOf(c);
            -1 != e && (this.searchField = !0, b.push({node: this, elem: "field"}));
            this._updateDomField()
        }
        if (this._hasChilds()) {
            if (this.childs) {
                var f = [];
                this.childs.forEach(function (g) {
                    f = f.concat(g.search(a))
                });
                b = b.concat(f)
            }
            void 0 != c && (0 == f.length ? this.collapse(!1) : this.expand(!1))
        } else void 0 != this.value &&
        (e = String(this.value).toLowerCase().indexOf(c), -1 != e && (this.searchValue = !0, b.push({node: this, elem: "value"}))), this._updateDomValue();
        return b
    };
    d.Node.prototype.scrollTo = function (a) {
        if (!this.dom.tr || !this.dom.tr.parentNode) for (var b = this.parent; b;) b.expand(!1), b = b.parent;
        this.dom.tr && this.dom.tr.parentNode && this.editor.scrollTo(this.dom.tr.offsetTop, a)
    };
    d.Node.focusElement = void 0;
    d.Node.prototype.focus = function (a) {
        d.Node.focusElement = a;
        if (this.dom.tr && this.dom.tr.parentNode) {
            var b = this.dom;
            switch (a) {
                case "drag":
                    b.drag ?
                        b.drag.focus() : b.menu.focus();
                    break;
                case "menu":
                    b.menu.focus();
                    break;
                case "expand":
                    this._hasChilds() ? b.expand.focus() : b.field && this.fieldEditable ? (b.field.focus(), d.util.selectContentEditable(b.field)) : b.value && !this._hasChilds() ? (b.value.focus(), d.util.selectContentEditable(b.value)) : b.menu.focus();
                    break;
                case "field":
                    b.field && this.fieldEditable ? (b.field.focus(), d.util.selectContentEditable(b.field)) : b.value && !this._hasChilds() ? (b.value.focus(), d.util.selectContentEditable(b.value)) : this._hasChilds() ?
                        b.expand.focus() : b.menu.focus();
                    break;
                default:
                    b.value && !this._hasChilds() ? (b.value.focus(), d.util.selectContentEditable(b.value)) : b.field && this.fieldEditable ? (b.field.focus(), d.util.selectContentEditable(b.field)) : this._hasChilds() ? b.expand.focus() : b.menu.focus()
            }
        }
    };
    d.Node.select = function (a) {
        setTimeout(function () {
            d.util.selectContentEditable(a)
        }, 0)
    };
    d.Node.prototype.blur = function () {
        this._getDomValue(!1);
        this._getDomField(!1)
    };
    d.Node.prototype._duplicate = function (a) {
        var b = a.clone();
        this.insertAfter(b,
            a);
        return b
    };
    d.Node.prototype.containsNode = function (a) {
        if (this == a) return !0;
        var b = this.childs;
        if (b) for (var c = 0, e = b.length; c < e; c++) if (b[c].containsNode(a)) return !0;
        return !1
    };
    d.Node.prototype._move = function (a, b) {
        if (a != b) {
            if (a.containsNode(this)) throw Error("Cannot move a field into a child of itself");
            a.parent && a.parent.removeChild(a);
            var c = a.clone();
            a.clearDom();
            b ? this.insertBefore(c, b) : this.appendChild(c)
        }
    };
    d.Node.prototype.removeChild = function (a) {
        if (this.childs) {
            var b = this.childs.indexOf(a);
            if (-1 !=
                b) return a.hide(), delete a.searchField, delete a.searchValue, a = this.childs.splice(b, 1)[0], this.updateDom({updateIndexes: !0}), a
        }
    };
    d.Node.prototype._remove = function (a) {
        this.removeChild(a)
    };
    d.Node.prototype.changeType = function (a) {
        var b = this.type;
        if (b != a) {
            if ("string" != a && "auto" != a || "string" != b && "auto" != b) {
                var c = this.dom.tr ? this.dom.tr.parentNode : void 0;
                var e = (e = this.expanded ? this.getAppend() : this.getDom()) && e.parentNode ? e.nextSibling : void 0;
                this.hide();
                this.clearDom();
                this.type = a;
                if ("object" == a) {
                    if (this.childs ||
                    (this.childs = []), this.childs.forEach(function (f, g) {
                        f.clearDom();
                        delete f.index;
                        f.fieldEditable = !0;
                        void 0 == f.field && (f.field = "")
                    }), "string" == b || "auto" == b) this.expanded = !0
                } else if ("array" == a) {
                    if (this.childs || (this.childs = []), this.childs.forEach(function (f, g) {
                        f.clearDom();
                        f.fieldEditable = !1;
                        f.index = g
                    }), "string" == b || "auto" == b) this.expanded = !0
                } else this.expanded = !1;
                c && (e ? c.insertBefore(this.getDom(), e) : c.appendChild(this.getDom()));
                this.showChilds()
            } else this.type = a;
            if ("auto" == a || "string" == a) this.value =
                "string" == a ? String(this.value) : this._stringCast(String(this.value)), this.focus();
            this.updateDom({updateIndexes: !0})
        }
    };
    d.Node.prototype._getDomValue = function (a) {
        this.dom.value && "array" != this.type && "object" != this.type && (this.valueInnerText = d.util.getInnerText(this.dom.value));
        if (void 0 != this.valueInnerText) try {
            if ("string" == this.type) var b = this._unescapeHTML(this.valueInnerText); else {
                var c = this._unescapeHTML(this.valueInnerText);
                b = this._stringCast(c)
            }
            if (b !== this.value) {
                var e = this.value;
                this.value = b;
                this.editor._onAction("editValue", {node: this, oldValue: e, newValue: b, oldSelection: this.editor.selection, newSelection: this.editor.getSelection()})
            }
        } catch (f) {
            if (this.value = void 0, 1 != a) throw f;
        }
    };
    d.Node.prototype._updateDomValue = function () {
        var a = this.dom.value;
        if (a) {
            var b = this.value, c = "auto" == this.type ? typeof b : this.type;
            b = "string" == c ? "green" : "number" == c ? "red" : "boolean" == c ? "orange" : this._hasChilds() ? "" : null === b ? "blue" : "black";
            a.style.color = b;
            "" == String(this.value) && "array" != this.type && "object" != this.type ?
                d.util.addClassName(a, "empty") : d.util.removeClassName(a, "empty");
            this.searchValueActive ? d.util.addClassName(a, "highlight-active") : d.util.removeClassName(a, "highlight-active");
            this.searchValue ? d.util.addClassName(a, "highlight") : d.util.removeClassName(a, "highlight");
            d.util.stripFormatting(a)
        }
    };
    d.Node.prototype._updateDomField = function () {
        var a = this.dom.field;
        a && ("" == String(this.field) && "array" != this.parent.type ? d.util.addClassName(a, "empty") : d.util.removeClassName(a, "empty"), this.searchFieldActive ? d.util.addClassName(a,
            "highlight-active") : d.util.removeClassName(a, "highlight-active"), this.searchField ? d.util.addClassName(a, "highlight") : d.util.removeClassName(a, "highlight"), d.util.stripFormatting(a))
    };
    d.Node.prototype._getDomField = function (a) {
        this.dom.field && this.fieldEditable && (this.fieldInnerText = d.util.getInnerText(this.dom.field));
        if (void 0 != this.fieldInnerText) try {
            var b = this._unescapeHTML(this.fieldInnerText);
            if (b !== this.field) {
                var c = this.field;
                this.field = b;
                this.editor._onAction("editField", {
                    node: this, oldValue: c,
                    newValue: b, oldSelection: this.editor.selection, newSelection: this.editor.getSelection()
                })
            }
        } catch (e) {
            if (this.field = void 0, 1 != a) throw e;
        }
    };
    d.Node.prototype.clearDom = function () {
        this.dom = {}
    };
    d.Node.prototype.getDom = function () {
        var a = this.dom;
        if (a.tr) return a.tr;
        a.tr = document.createElement("tr");
        a.tr.node = this;
        if (this.editor.mode.editor) {
            var b = document.createElement("td");
            if (this.parent) {
                var c = document.createElement("button");
                a.drag = c;
                c.className = "dragarea";
                c.title = "Drag to move this field (Alt+Shift+Arrows)";
                b.appendChild(c)
            }
            a.tr.appendChild(b);
            b = document.createElement("td");
            c = document.createElement("button");
            a.menu = c;
            c.className = "contextmenu";
            c.title = "Click to open the actions menu (Ctrl+M)";
            b.appendChild(a.menu);
            a.tr.appendChild(b)
        }
        b = document.createElement("td");
        a.tr.appendChild(b);
        a.tree = this._createDomTree();
        b.appendChild(a.tree);
        this.updateDom({updateIndexes: !0});
        return a.tr
    };
    d.Node.prototype._onDragStart = function (a) {
        a = a || window.event;
        var b = this;
        this.mousemove || (this.mousemove = d.util.addEventListener(document,
            "mousemove", function (c) {
                b._onDrag(c)
            }));
        this.mouseup || (this.mouseup = d.util.addEventListener(document, "mouseup", function (c) {
            b._onDragEnd(c)
        }));
        this.editor.highlighter.lock();
        this.drag = {
            oldCursor: document.body.style.cursor,
            startParent: this.parent,
            startIndex: this.parent.childs.indexOf(this),
            mouseX: d.util.getMouseX(a),
            level: this.getLevel()
        };
        document.body.style.cursor = "move";
        d.util.preventDefault(a)
    };
    d.Node.prototype._onDrag = function (a) {
        a = a || window.event;
        var b = d.util.getMouseY(a), c = d.util.getMouseX(a),
            e = !1;
        var f = this.dom.tr;
        var g = d.util.getAbsoluteTop(f);
        var h = f.offsetHeight;
        if (b < g) {
            g = f;
            do {
                g = g.previousSibling;
                var k = d.Node.getNodeFromTarget(g);
                var m = g ? d.util.getAbsoluteTop(g) : 0
            } while (g && b < m);
            k && !k.parent && (k = void 0);
            k || (g = (f = f.parentNode.firstChild) ? f.nextSibling : void 0, k = d.Node.getNodeFromTarget(g), k == this && (k = void 0));
            k && (m = (g = k.dom.tr) ? d.util.getAbsoluteTop(g) : 0, b > m + h && (k = void 0));
            k && (k.parent.moveBefore(this, k), e = !0)
        } else if (f = (h = this.expanded && this.append ? this.append.getDom() : this.dom.tr) ?
            h.nextSibling : void 0) {
            m = d.util.getAbsoluteTop(f);
            var l = f;
            do f = d.Node.getNodeFromTarget(l), l && (k = l.nextSibling ? d.util.getAbsoluteTop(l.nextSibling) : 0, k = l ? k - m : 0, 1 == f.parent.childs.length && f.parent.childs[0] == this && (g += 23)), l = l.nextSibling; while (l && b > g + k);
            if (f && f.parent) {
                m = this.drag.level + Math.round((c - this.drag.mouseX) / 24 / 2);
                l = f.getLevel();
                for (g = f.dom.tr.previousSibling; l < m && g;) {
                    k = d.Node.getNodeFromTarget(g);
                    if (k != this && !k._isChildOf(this)) if (k instanceof d.AppendNode) if (k = k.parent.childs, 1 < k.length ||
                    1 == k.length && k[0] != this) f = d.Node.getNodeFromTarget(g), l = f.getLevel(); else break; else break;
                    g = g.previousSibling
                }
                h.nextSibling != f.dom.tr && (f.parent.moveBefore(this, f), e = !0)
            }
        }
        e && (this.drag.mouseX = c, this.drag.level = this.getLevel());
        this.editor.startAutoScroll(b);
        d.util.preventDefault(a)
    };
    d.Node.prototype._onDragEnd = function (a) {
        a = a || window.event;
        var b = {node: this, startParent: this.drag.startParent, startIndex: this.drag.startIndex, endParent: this.parent, endIndex: this.parent.childs.indexOf(this)};
        b.startParent ==
        b.endParent && b.startIndex == b.endIndex || this.editor._onAction("moveNode", b);
        document.body.style.cursor = this.drag.oldCursor;
        this.editor.highlighter.unlock();
        delete this.drag;
        this.mousemove && (d.util.removeEventListener(document, "mousemove", this.mousemove), delete this.mousemove);
        this.mouseup && (d.util.removeEventListener(document, "mouseup", this.mouseup), delete this.mouseup);
        this.editor.stopAutoScroll();
        d.util.preventDefault(a)
    };
    d.Node.prototype._isChildOf = function (a) {
        for (var b = this.parent; b;) {
            if (b == a) return !0;
            b = b.parent
        }
        return !1
    };
    d.Node.prototype._createDomField = function () {
        return document.createElement("div")
    };
    d.Node.prototype.setHighlight = function (a) {
        this.dom.tr && (this.dom.tr.className = a ? "highlight" : "", this.append && this.append.setHighlight(a), this.childs && this.childs.forEach(function (b) {
            b.setHighlight(a)
        }))
    };
    d.Node.prototype.updateValue = function (a) {
        this.value = a;
        this.updateDom()
    };
    d.Node.prototype.updateField = function (a) {
        this.field = a;
        this.updateDom()
    };
    d.Node.prototype.updateDom = function (a) {
        var b = this.dom.tree;
        b && (b.style.marginLeft = 24 * this.getLevel() + "px");
        if (b = this.dom.field) {
            1 == this.fieldEditable ? (b.contentEditable = this.editor.mode.editor, b.spellcheck = !1, b.className = "field") : b.className = "readonly";
            var c = void 0 != this.index ? this.index : void 0 != this.field ? this.field : this._hasChilds() ? this.type : "";
            b.innerHTML = this._escapeHTML(c)
        }
        if (b = this.dom.value) c = this.childs ? this.childs.length : 0, "array" == this.type ? (b.innerHTML = "[" + c + "]", b.title = this.type + " containing " + c + " items") : "object" == this.type ? (b.innerHTML = "{" +
            c + "}", b.title = this.type + " containing " + c + " items") : (b.innerHTML = this._escapeHTML(this.value), delete b.title);
        this._updateDomField();
        this._updateDomValue();
        a && 1 == a.updateIndexes && this._updateDomIndexes();
        a && 1 == a.recurse && this.childs && this.childs.forEach(function (e) {
            e.updateDom(a)
        });
        this.append && this.append.updateDom()
    };
    d.Node.prototype._updateDomIndexes = function () {
        var a = this.childs;
        this.dom.value && a && ("array" == this.type ? a.forEach(function (b, c) {
            b.index = c;
            if (b = b.dom.field) b.innerHTML = c
        }) : "object" == this.type &&
            a.forEach(function (b) {
                void 0 != b.index && (delete b.index, void 0 == b.field && (b.field = ""))
            }))
    };
    d.Node.prototype._createDomValue = function () {
        if ("array" == this.type) {
            var a = document.createElement("div");
            a.className = "readonly";
            a.innerHTML = "[...]"
        } else "object" == this.type ? (a = document.createElement("div"), a.className = "readonly", a.innerHTML = "{...}") : (a = document.createElement("div"), a.contentEditable = !this.editor.mode.viewer, a.spellcheck = !1, a.className = "value", a.innerHTML = this._escapeHTML(this.value));
        return a
    };
    d.Node.prototype._createDomExpandButton = function () {
        var a = document.createElement("button");
        this._hasChilds() ? (a.className = this.expanded ? "expanded" : "collapsed", a.title = "Click to expand/collapse this field (Ctrl+E). \nCtrl+Click to expand/collapse including all childs.") : (a.className = "invisible", a.title = "");
        return a
    };
    d.Node.prototype._createDomTree = function () {
        var a = this.dom, b = document.createElement("table"), c = document.createElement("tbody");
        b.style.borderCollapse = "collapse";
        b.appendChild(c);
        var e = document.createElement("tr");
        c.appendChild(e);
        c = document.createElement("td");
        c.className = "tree";
        e.appendChild(c);
        a.expand = this._createDomExpandButton();
        c.appendChild(a.expand);
        a.tdExpand = c;
        c = document.createElement("td");
        c.className = "tree";
        e.appendChild(c);
        a.field = this._createDomField();
        c.appendChild(a.field);
        a.tdField = c;
        c = document.createElement("td");
        c.className = "tree";
        e.appendChild(c);
        "object" != this.type && "array" != this.type && (c.appendChild(document.createTextNode(":")), c.className = "separator");
        a.tdSeparator = c;
        c = document.createElement("td");
        c.className = "tree";
        e.appendChild(c);
        a.value = this._createDomValue();
        c.appendChild(a.value);
        a.tdValue = c;
        return b
    };
    d.Node.prototype.onEvent = function (a) {
        var b = a.type, c = a.target || a.srcElement, e = this.dom, f = this, g = this._hasChilds();
        if (c == e.drag || c == e.menu) "mouseover" == b ? this.editor.highlighter.highlight(this) : "mouseout" == b && this.editor.highlighter.unhighlight();
        "mousedown" == b && c == e.drag && this._onDragStart(a);
        if ("click" == b && c == e.menu) {
            var h = f.editor.highlighter;
            h.highlight(f);
            h.lock();
            d.util.addClassName(e.menu,
                "selected");
            this.showContextMenu(e.menu, function () {
                d.util.removeClassName(e.menu, "selected");
                h.unlock();
                h.unhighlight()
            })
        }
        "click" == b && c == e.expand && g && this._onExpand(a.ctrlKey);
        var k = e.value;
        if (c == k) switch (b) {
            case "focus":
                d.JSONEditor.focusNode = this;
                break;
            case "blur":
            case "change":
                this._getDomValue(!0);
                this._updateDomValue();
                this.value && (k.innerHTML = this._escapeHTML(this.value));
                break;
            case "input":
                this._getDomValue(!0);
                this._updateDomValue();
                break;
            case "keydown":
            case "mousedown":
                this.editor.selection =
                    this.editor.getSelection();
                break;
            case "keyup":
                this._getDomValue(!0);
                this._updateDomValue();
                break;
            case "cut":
            case "paste":
                setTimeout(function () {
                    f._getDomValue(!0);
                    f._updateDomValue()
                }, 1)
        }
        var m = e.field;
        if (c == m) switch (b) {
            case "focus":
                d.JSONEditor.focusNode = this;
                break;
            case "blur":
            case "change":
                this._getDomField(!0);
                this._updateDomField();
                this.field && (m.innerHTML = this._escapeHTML(this.field));
                break;
            case "input":
                this._getDomField(!0);
                this._updateDomField();
                break;
            case "keydown":
            case "mousedown":
                this.editor.selection =
                    this.editor.getSelection();
                break;
            case "keyup":
                this._getDomField(!0);
                this._updateDomField();
                break;
            case "cut":
            case "paste":
                setTimeout(function () {
                    f._getDomField(!0);
                    f._updateDomField()
                }, 1)
        }
        if (c == e.tree.parentNode) switch (b) {
            case "click":
                (void 0 != a.offsetX ? a.offsetX < 24 * (this.getLevel() + 1) : d.util.getMouseX(a) < d.util.getAbsoluteLeft(e.tdSeparator)) || g ? m && (d.util.setEndOfContentEditable(m), m.focus()) : k && (d.util.setEndOfContentEditable(k), k.focus())
        }
        if (c == e.tdExpand && !g || c == e.tdField || c == e.tdSeparator) switch (b) {
            case "click":
                m &&
                (d.util.setEndOfContentEditable(m), m.focus())
        }
        if ("keydown" == b) this.onKeyDown(a)
    };
    d.Node.prototype.onKeyDown = function (a) {
        var b = a.which || a.keyCode, c = a.target || a.srcElement, e = a.ctrlKey, f = a.shiftKey, g = a.altKey, h = !1;
        68 == b ? e && (this._onDuplicate(), h = !0) : 69 == b ? e && (this._onExpand(f), c.focus(), h = !0) : 77 == b ? e && (this.showContextMenu(c), h = !0) : 46 == b ? e && (this._onRemove(), h = !0) : 45 == b ? e && !f ? (this._onInsertBefore(), h = !0) : e && f && (this._onInsertAfter(), h = !0) : 35 == b ? g && ((h = this._lastNode()) && h.focus(d.Node.focusElement ||
            this._getElementName(c)), h = !0) : 36 == b ? g && ((h = this._firstNode()) && h.focus(d.Node.focusElement || this._getElementName(c)), h = !0) : 37 == b ? g && !f ? ((c = this._previousElement(c)) && this.focus(this._getElementName(c)), h = !0) : g && f && (this.expanded ? e = (b = this.getAppend()) ? b.nextSibling : void 0 : (b = this.getDom(), e = b.nextSibling), e && (b = d.Node.getNodeFromTarget(e), e = e.nextSibling, e = d.Node.getNodeFromTarget(e), b && b instanceof d.AppendNode && 1 != this.parent.childs.length && e && e.parent && (e.parent.moveBefore(this, e), this.focus(d.Node.focusElement ||
            this._getElementName(c))))) : 38 == b ? g && !f ? ((b = this._previousNode()) && b.focus(d.Node.focusElement || this._getElementName(c)), h = !0) : g && f && ((b = this._previousNode()) && b.parent && (b.parent.moveBefore(this, b), this.focus(d.Node.focusElement || this._getElementName(c))), h = !0) : 39 == b ? g && !f ? ((c = this._nextElement(c)) && this.focus(this._getElementName(c)), h = !0) : g && f && (b = this.getDom(), (b = b.previousSibling) && (b = d.Node.getNodeFromTarget(b)) && b.parent && b instanceof d.AppendNode && !b.isVisible() && (b.parent.moveBefore(this,
            b), this.focus(d.Node.focusElement || this._getElementName(c)))) : 40 == b && (g && !f ? ((b = this._nextNode()) && b.focus(d.Node.focusElement || this._getElementName(c)), h = !0) : g && f && (e = (b = this.expanded ? this.append ? this.append._nextNode() : void 0 : this._nextNode()) ? b.getDom() : void 0, e = 1 == this.parent.childs.length ? e : e ? e.nextSibling : void 0, (e = d.Node.getNodeFromTarget(e)) && e.parent && (e.parent.moveBefore(this, e), this.focus(d.Node.focusElement || this._getElementName(c))), h = !0));
        h && (d.util.preventDefault(a), d.util.stopPropagation(a))
    };
    d.Node.prototype._onExpand = function (a) {
        if (a) {
            var b = this.dom.tr.parentNode, c = b.parentNode, e = c.scrollTop;
            c.removeChild(b)
        }
        this.expanded ? this.collapse(a) : this.expand(a);
        a && (c.appendChild(b), c.scrollTop = e)
    };
    d.Node.prototype._onRemove = function () {
        this.editor.highlighter.unhighlight();
        var a = this.parent.childs, b = a.indexOf(this), c = this.editor.getSelection();
        a[b + 1] ? a[b + 1].focus() : a[b - 1] ? a[b - 1].focus() : this.parent.focus();
        a = this.editor.getSelection();
        this.parent._remove(this);
        this.editor._onAction("removeNode",
            {node: this, parent: this.parent, index: b, oldSelection: c, newSelection: a})
    };
    d.Node.prototype._onDuplicate = function () {
        var a = this.editor.getSelection(), b = this.parent._duplicate(this);
        b.focus();
        var c = this.editor.getSelection();
        this.editor._onAction("duplicateNode", {node: this, clone: b, parent: this.parent, oldSelection: a, newSelection: c})
    };
    d.Node.prototype._onInsertBefore = function (a, b, c) {
        var e = this.editor.getSelection();
        a = new d.Node(this.editor, {field: void 0 != a ? a : "", value: void 0 != b ? b : "", type: c});
        a.expand(!0);
        this.parent.insertBefore(a,
            this);
        this.editor.highlighter.unhighlight();
        a.focus("field");
        b = this.editor.getSelection();
        this.editor._onAction("insertBeforeNode", {node: a, beforeNode: this, parent: this.parent, oldSelection: e, newSelection: b})
    };
    d.Node.prototype._onInsertAfter = function (a, b, c) {
        var e = this.editor.getSelection();
        a = new d.Node(this.editor, {field: void 0 != a ? a : "", value: void 0 != b ? b : "", type: c});
        a.expand(!0);
        this.parent.insertAfter(a, this);
        this.editor.highlighter.unhighlight();
        a.focus("field");
        b = this.editor.getSelection();
        this.editor._onAction("insertAfterNode",
            {node: a, afterNode: this, parent: this.parent, oldSelection: e, newSelection: b})
    };
    d.Node.prototype._onAppend = function (a, b, c) {
        var e = this.editor.getSelection();
        a = new d.Node(this.editor, {field: void 0 != a ? a : "", value: void 0 != b ? b : "", type: c});
        a.expand(!0);
        this.parent.appendChild(a);
        this.editor.highlighter.unhighlight();
        a.focus("field");
        b = this.editor.getSelection();
        this.editor._onAction("appendNode", {node: a, parent: this.parent, oldSelection: e, newSelection: b})
    };
    d.Node.prototype._onChangeType = function (a) {
        var b = this.type;
        if (a != b) {
            var c = this.editor.getSelection();
            this.changeType(a);
            var e = this.editor.getSelection();
            this.editor._onAction("changeType", {node: this, oldType: b, newType: a, oldSelection: c, newSelection: e})
        }
    };
    d.Node.prototype._onSort = function (a) {
        if (this._hasChilds()) {
            var b = "desc" == a ? -1 : 1, c = "array" == this.type ? "value" : "field";
            this.hideChilds();
            a = this.childs;
            var e = this.sort;
            this.childs = this.childs.concat();
            this.childs.sort(function (f, g) {
                return f[c] > g[c] ? b : f[c] < g[c] ? -b : 0
            });
            this.sort = 1 == b ? "asc" : "desc";
            this.editor._onAction("sort",
                {node: this, oldChilds: a, oldSort: e, newChilds: this.childs, newSort: this.sort});
            this.showChilds()
        }
    };
    d.Node.prototype.getAppend = function () {
        this.append || (this.append = new d.AppendNode(this.editor), this.append.setParent(this));
        return this.append.getDom()
    };
    d.Node.getNodeFromTarget = function (a) {
        for (; a;) {
            if (a.node) return a.node;
            a = a.parentNode
        }
    };
    d.Node.prototype._previousNode = function () {
        var a = null, b = this.getDom();
        if (b && b.parentNode) {
            do b = b.previousSibling, a = d.Node.getNodeFromTarget(b); while (b && a instanceof d.AppendNode &&
            !a.isVisible())
        }
        return a
    };
    d.Node.prototype._nextNode = function () {
        var a = null, b = this.getDom();
        if (b && b.parentNode) {
            do b = b.nextSibling, a = d.Node.getNodeFromTarget(b); while (b && a instanceof d.AppendNode && !a.isVisible())
        }
        return a
    };
    d.Node.prototype._firstNode = function () {
        var a = null, b = this.getDom();
        b && b.parentNode && (a = d.Node.getNodeFromTarget(b.parentNode.firstChild));
        return a
    };
    d.Node.prototype._lastNode = function () {
        var a = null, b = this.getDom();
        if (b && b.parentNode) for (b = b.parentNode.lastChild, a = d.Node.getNodeFromTarget(b); b &&
        a instanceof d.AppendNode && !a.isVisible();) b = b.previousSibling, a = d.Node.getNodeFromTarget(b);
        return a
    };
    d.Node.prototype._previousElement = function (a) {
        var b = this.dom;
        switch (a) {
            case b.value:
                if (this.fieldEditable) return b.field;
            case b.field:
                if (this._hasChilds()) return b.expand;
            case b.expand:
                return b.menu;
            case b.menu:
                if (b.drag) return b.drag;
            default:
                return null
        }
    };
    d.Node.prototype._nextElement = function (a) {
        var b = this.dom;
        switch (a) {
            case b.drag:
                return b.menu;
            case b.menu:
                if (this._hasChilds()) return b.expand;
            case b.expand:
                if (this.fieldEditable) return b.field;
            case b.field:
                if (!this._hasChilds()) return b.value;
            default:
                return null
        }
    };
    d.Node.prototype._getElementName = function (a) {
        var b = this.dom, c;
        for (c in b) if (b.hasOwnProperty(c) && b[c] == a) return c;
        return null
    };
    d.Node.prototype._hasChilds = function () {
        return "array" == this.type || "object" == this.type
    };
    d.Node.TYPE_TITLES = {
        auto: 'Field type "auto". The field type is automatically determined from the value and can be a string, number, boolean, or null.',
        object: 'Field type "object". An object contains an unordered set of key/value pairs.',
        array: 'Field type "array". An array contains an ordered collection of values.',
        string: 'Field type "string". Field type is not determined from the value, but always returned as string.'
    };
    d.Node.prototype.showContextMenu = function (a, b) {
        var c = this, e = d.Node.TYPE_TITLES, f = [];
        f.push({
            text: "Type",
            title: "Change the type of this field",
            className: "type-" + this.type,
            submenu: [{
                text: "Auto", className: "type-auto" + ("auto" == this.type ? " selected" : ""), title: e.auto, click: function () {
                    c._onChangeType("auto")
                }
            }, {
                text: "Array",
                className: "type-array" + ("array" == this.type ? " selected" : ""), title: e.array, click: function () {
                    c._onChangeType("array")
                }
            }, {
                text: "Object", className: "type-object" + ("object" == this.type ? " selected" : ""), title: e.object, click: function () {
                    c._onChangeType("object")
                }
            }, {
                text: "String", className: "type-string" + ("string" == this.type ? " selected" : ""), title: e.string, click: function () {
                    c._onChangeType("string")
                }
            }]
        });
        if (this._hasChilds()) {
            var g = "asc" == this.sort ? "desc" : "asc";
            f.push({
                text: "Sort", title: "Sort the childs of this " +
                    this.type, className: "sort-" + g, click: function () {
                    c._onSort(g)
                }, submenu: [{
                    text: "Ascending", className: "sort-asc", title: "Sort the childs of this " + this.type + " in ascending order", click: function () {
                        c._onSort("asc")
                    }
                }, {
                    text: "Descending", className: "sort-desc", title: "Sort the childs of this " + this.type + " in descending order", click: function () {
                        c._onSort("desc")
                    }
                }]
            })
        }
        if (this.parent && this.parent._hasChilds()) {
            f.push({type: "separator"});
            var h = c.parent.childs;
            c == h[h.length - 1] && f.push({
                text: "Append", title: "Append a new field with type 'auto' after this field (Ctrl+Shift+Ins)",
                submenuTitle: "Select the type of the field to be appended", className: "append", click: function () {
                    c._onAppend("", "", "auto")
                }, submenu: [{
                    text: "Auto", className: "type-auto", title: e.auto, click: function () {
                        c._onAppend("", "", "auto")
                    }
                }, {
                    text: "Array", className: "type-array", title: e.array, click: function () {
                        c._onAppend("", [])
                    }
                }, {
                    text: "Object", className: "type-object", title: e.object, click: function () {
                        c._onAppend("", {})
                    }
                }, {
                    text: "String", className: "type-string", title: e.string, click: function () {
                        c._onAppend("", "", "string")
                    }
                }]
            });
            f.push({
                text: "Insert",
                title: "Insert a new field with type 'auto' before this field (Ctrl+Ins)",
                submenuTitle: "Select the type of the field to be inserted",
                className: "insert",
                click: function () {
                    c._onInsertBefore("", "", "auto")
                },
                submenu: [{
                    text: "Auto", className: "type-auto", title: e.auto, click: function () {
                        c._onInsertBefore("", "", "auto")
                    }
                }, {
                    text: "Array", className: "type-array", title: e.array, click: function () {
                        c._onInsertBefore("", [])
                    }
                }, {
                    text: "Object", className: "type-object", title: e.object, click: function () {
                        c._onInsertBefore("",
                            {})
                    }
                }, {
                    text: "String", className: "type-string", title: e.string, click: function () {
                        c._onInsertBefore("", "", "string")
                    }
                }]
            });
            f.push({
                text: "Duplicate", title: "Duplicate this field (Ctrl+D)", className: "duplicate", click: function () {
                    c._onDuplicate()
                }
            });
            f.push({
                text: "Remove", title: "Remove this field (Ctrl+Del)", className: "remove", click: function () {
                    c._onRemove()
                }
            })
        }
        (new d.ContextMenu(f, {close: b})).show(a)
    };
    d.Node.prototype._getType = function (a) {
        return a instanceof Array ? "array" : a instanceof Object ? "object" : "string" ==
        typeof a && "string" != typeof this._stringCast(a) ? "string" : "auto"
    };
    d.Node.prototype._stringCast = function (a) {
        var b = a.toLowerCase(), c = Number(a), e = parseFloat(a);
        return "" == a ? "" : "null" == b ? null : "true" == b ? !0 : "false" == b ? !1 : isNaN(c) || isNaN(e) ? a : c
    };
    d.Node.prototype._escapeHTML = function (a) {
        a = String(a).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/  /g, " &nbsp;").replace(/^ /, "&nbsp;").replace(/ $/, "&nbsp;");
        a = JSON.stringify(a);
        return a.substring(1, a.length - 1)
    };
    d.Node.prototype._unescapeHTML = function (a) {
        a =
            '"' + this._escapeJSON(a) + '"';
        return d.util.parse(a).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    };
    d.Node.prototype._escapeJSON = function (a) {
        for (var b = "", c = 0, e = a.length; c < e;) {
            var f = a.charAt(c);
            "\n" == f ? b += "\\n" : "\\" == f ? (b += f, c++, f = a.charAt(c), -1 == '"\\/bfnrtu'.indexOf(f) && (b += "\\"), b += f) : b = '"' == f ? b + '\\"' : b + f;
            c++
        }
        return b
    };
    d = d || {};
    d.AppendNode = function (a) {
        this.editor = a;
        this.dom = {}
    };
    d.AppendNode.prototype = new d.Node;
    d.AppendNode.prototype.getDom = function () {
        var a = this.dom;
        if (a.tr) return a.tr;
        var b = document.createElement("tr");
        b.node = this;
        a.tr = b;
        if (!this.editor.mode.editor) return b;
        var c = document.createElement("td");
        a.tdDrag = c;
        c = document.createElement("td");
        var e = document.createElement("button");
        e.className = "contextmenu";
        e.title = "Click to open the actions menu (Ctrl+M)";
        a.menu = e;
        a.tdMenu = c;
        c.appendChild(a.menu);
        c = document.createElement("td");
        e = document.createElement("div");
        e.innerHTML = "(empty)";
        e.className = "readonly";
        c.appendChild(e);
        a.td = c;
        a.text = e;
        this.updateDom();
        return b
    };
    d.AppendNode.prototype.updateDom =
        function () {
            var a = this.dom, b = a.td;
            b && (b.style.paddingLeft = 24 * this.getLevel() + 26 + "px");
            var c = a.text;
            c && (c.innerHTML = "(empty " + this.parent.type + ")");
            c = a.tr;
            this.isVisible() ? a.tr.firstChild || (c.appendChild(a.tdDrag), c.appendChild(a.tdMenu), c.appendChild(b)) : a.tr.firstChild && (c.removeChild(a.tdDrag), c.removeChild(a.tdMenu), c.removeChild(b))
        };
    d.AppendNode.prototype.isVisible = function () {
        return 0 == this.parent.childs.length
    };
    d.AppendNode.prototype.showContextMenu = function (a, b) {
        var c = this, e = d.Node.TYPE_TITLES;
        (new d.ContextMenu([{
            text: "Append",
            title: "Append a new field with type 'auto' (Ctrl+Shift+Ins)",
            submenuTitle: "Select the type of the field to be appended",
            className: "insert",
            click: function () {
                c._onAppend("", "", "auto")
            },
            submenu: [{
                text: "Auto", className: "type-auto", title: e.auto, click: function () {
                    c._onAppend("", "", "auto")
                }
            }, {
                text: "Array", className: "type-array", title: e.array, click: function () {
                    c._onAppend("", [])
                }
            }, {
                text: "Object", className: "type-object", title: e.object, click: function () {
                    c._onAppend("", {})
                }
            },
                {
                    text: "String", className: "type-string", title: e.string, click: function () {
                        c._onAppend("", "", "string")
                    }
                }]
        }], {close: b})).show(a)
    };
    d.AppendNode.prototype.onEvent = function (a) {
        var b = a.type, c = a.target || a.srcElement, e = this.dom;
        c == e.menu && ("mouseover" == b ? this.editor.highlighter.highlight(this.parent) : "mouseout" == b && this.editor.highlighter.unhighlight());
        if ("click" == b && c == e.menu) {
            var f = this.editor.highlighter;
            f.highlight(this.parent);
            f.lock();
            d.util.addClassName(e.menu, "selected");
            this.showContextMenu(e.menu,
                function () {
                    d.util.removeClassName(e.menu, "selected");
                    f.unlock();
                    f.unhighlight()
                })
        }
        if ("keydown" == b) this.onKeyDown(a)
    };
    d = d || {};
    d.ContextMenu = function (a, b) {
        function c(h, k, m) {
            m.forEach(function (l) {
                if ("separator" == l.type) {
                    var n = document.createElement("div");
                    n.className = "separator";
                    q = document.createElement("li");
                    q.appendChild(n);
                    h.appendChild(q)
                } else {
                    var r = {}, q = document.createElement("li");
                    h.appendChild(q);
                    n = document.createElement("button");
                    n.className = l.className;
                    r.button = n;
                    l.title && (n.title = l.title);
                    l.click && (n.onclick = function () {
                        e.hide();
                        l.click()
                    });
                    q.appendChild(n);
                    if (l.submenu) {
                        var p = document.createElement("div");
                        p.className = "icon";
                        n.appendChild(p);
                        n.appendChild(document.createTextNode(l.text));
                        if (l.click) {
                            n.className += " default";
                            n = document.createElement("button");
                            r.buttonExpand = n;
                            n.className = "expand";
                            n.innerHTML = '<div class="expand"></div>';
                            q.appendChild(n);
                            l.submenuTitle && (n.title = l.submenuTitle);
                            var t = n
                        } else p = document.createElement("div"), p.className = "expand", n.appendChild(p), t = n;
                        t.onclick =
                            function () {
                                e._onExpandItem(r);
                                t.focus()
                            };
                        n = [];
                        r.subItems = n;
                        p = document.createElement("ul");
                        r.ul = p;
                        p.className = "menu";
                        p.style.height = "0";
                        q.appendChild(p);
                        c(p, n, l.submenu)
                    } else n.innerHTML = '<div class="icon"></div>' + l.text;
                    k.push(r)
                }
            })
        }

        this.dom = {};
        var e = this, f = this.dom;
        this.anchor = void 0;
        this.items = a;
        this.eventListeners = {};
        this.visibleSubmenu = this.selection = void 0;
        this.onClose = b ? b.close : void 0;
        var g = document.createElement("div");
        g.className = "jsoneditor-contextmenu";
        f.menu = g;
        b = document.createElement("ul");
        b.className = "menu";
        g.appendChild(b);
        f.list = b;
        f.items = [];
        g = document.createElement("button");
        f.focusButton = g;
        f = document.createElement("li");
        f.style.overflow = "hidden";
        f.style.height = "0";
        f.appendChild(g);
        b.appendChild(f);
        c(b, this.dom.items, a);
        this.maxHeight = 0;
        a.forEach(function (h) {
            e.maxHeight = Math.max(e.maxHeight, 24 * (a.length + (h.submenu ? h.submenu.length : 0)))
        })
    };
    d.ContextMenu.prototype._getVisibleButtons = function () {
        var a = [], b = this;
        this.dom.items.forEach(function (c) {
            a.push(c.button);
            c.buttonExpand && a.push(c.buttonExpand);
            c.subItems && c == b.expandedItem && c.subItems.forEach(function (e) {
                a.push(e.button);
                e.buttonExpand && a.push(e.buttonExpand)
            })
        });
        return a
    };
    d.ContextMenu.visibleMenu = void 0;
    d.ContextMenu.prototype.show = function (a) {
        this.hide();
        var b = d.util.getWindowHeight(), c = a.offsetHeight, e = this.maxHeight, f = d.util.getAbsoluteLeft(a), g = d.util.getAbsoluteTop(a);
        g + c + e < b ? (this.dom.menu.style.left = f + "px", this.dom.menu.style.top = g + c + "px", this.dom.menu.style.bottom = "") : (this.dom.menu.style.left = f + "px", this.dom.menu.style.top = "",
            this.dom.menu.style.bottom = b - g + "px");
        document.body.appendChild(this.dom.menu);
        var h = this, k = this.dom.list;
        this.eventListeners.mousedown = d.util.addEventListener(document, "mousedown", function (m) {
            m = m || window.event;
            var l = m.target || m.srcElement;
            l == k || h._isChildOf(l, k) || (h.hide(), d.util.stopPropagation(m), d.util.preventDefault(m))
        });
        this.eventListeners.mousewheel = d.util.addEventListener(document, "mousewheel", function () {
            d.util.stopPropagation(event);
            d.util.preventDefault(event)
        });
        this.eventListeners.keydown =
            d.util.addEventListener(document, "keydown", function (m) {
                h._onKeyDown(m)
            });
        this.selection = d.util.getSelection();
        this.anchor = a;
        setTimeout(function () {
            h.dom.focusButton.focus()
        }, 0);
        d.ContextMenu.visibleMenu && d.ContextMenu.visibleMenu.hide();
        d.ContextMenu.visibleMenu = this
    };
    d.ContextMenu.prototype.hide = function () {
        if (this.dom.menu.parentNode && (this.dom.menu.parentNode.removeChild(this.dom.menu), this.onClose)) this.onClose();
        for (var a in this.eventListeners) if (this.eventListeners.hasOwnProperty(a)) {
            var b = this.eventListeners[a];
            b && d.util.removeEventListener(document, a, b);
            delete this.eventListeners[a]
        }
        d.ContextMenu.visibleMenu == this && (d.ContextMenu.visibleMenu = void 0)
    };
    d.ContextMenu.prototype._onExpandItem = function (a) {
        var b = this, c = a == this.expandedItem, e = this.expandedItem;
        e && (e.ul.style.height = "0", e.ul.style.padding = "", setTimeout(function () {
            b.expandedItem != e && (e.ul.style.display = "", d.util.removeClassName(e.ul.parentNode, "selected"))
        }, 300), this.expandedItem = void 0);
        if (!c) {
            var f = a.ul;
            f.style.display = "block";
            setTimeout(function () {
                b.expandedItem ==
                a && (f.style.height = 24 * f.childNodes.length + "px", f.style.padding = "5px 10px")
            }, 0);
            d.util.addClassName(f.parentNode, "selected");
            this.expandedItem = a
        }
    };
    d.ContextMenu.prototype._onKeyDown = function (a) {
        a = a || window.event;
        var b = a.target || a.srcElement, c = a.which || a.keyCode, e = !1;
        27 == c ? (this.selection && d.util.setSelection(this.selection), this.anchor && this.anchor.focus(), this.hide(), e = !0) : 9 == c ? a.shiftKey ? (c = this._getVisibleButtons(), b = c.indexOf(b), 0 == b && (c[c.length - 1].focus(), e = !0)) : (c = this._getVisibleButtons(),
            b = c.indexOf(b), b == c.length - 1 && (c[0].focus(), e = !0)) : 37 == c ? ("expand" == b.className && (c = this._getVisibleButtons(), b = c.indexOf(b), (e = c[b - 1]) && e.focus()), e = !0) : 38 == c ? (c = this._getVisibleButtons(), b = c.indexOf(b), (e = c[b - 1]) && "expand" == e.className && (e = c[b - 2]), e || (e = c[c.length - 1]), e && e.focus(), e = !0) : 39 == c ? (c = this._getVisibleButtons(), b = c.indexOf(b), (e = c[b + 1]) && "expand" == e.className && e.focus(), e = !0) : 40 == c && (c = this._getVisibleButtons(), b = c.indexOf(b), (e = c[b + 1]) && "expand" == e.className && (e = c[b + 2]), e || (e = c[0]), e &&
        e.focus(), e = !0);
        e && (d.util.stopPropagation(a), d.util.preventDefault(a))
    };
    d.ContextMenu.prototype._isChildOf = function (a, b) {
        for (a = a.parentNode; a;) {
            if (a == b) return !0;
            a = a.parentNode
        }
        return !1
    };
    d = d || {};
    d.History = function (a) {
        this.editor = a;
        this.clear();
        this.actions = {
            editField: {
                undo: function (b) {
                    b.node.updateField(b.oldValue)
                }, redo: function (b) {
                    b.node.updateField(b.newValue)
                }
            }, editValue: {
                undo: function (b) {
                    b.node.updateValue(b.oldValue)
                }, redo: function (b) {
                    b.node.updateValue(b.newValue)
                }
            }, appendNode: {
                undo: function (b) {
                    b.parent.removeChild(b.node)
                },
                redo: function (b) {
                    b.parent.appendChild(b.node)
                }
            }, insertBeforeNode: {
                undo: function (b) {
                    b.parent.removeChild(b.node)
                }, redo: function (b) {
                    b.parent.insertBefore(b.node, b.beforeNode)
                }
            }, insertAfterNode: {
                undo: function (b) {
                    b.parent.removeChild(b.node)
                }, redo: function (b) {
                    b.parent.insertAfter(b.node, b.afterNode)
                }
            }, removeNode: {
                undo: function (b) {
                    var c = b.parent;
                    c.insertBefore(b.node, c.childs[b.index] || c.append)
                }, redo: function (b) {
                    b.parent.removeChild(b.node)
                }
            }, duplicateNode: {
                undo: function (b) {
                    b.parent.removeChild(b.clone)
                },
                redo: function (b) {
                    b.parent.insertAfter(b.clone, b.node)
                }
            }, changeType: {
                undo: function (b) {
                    b.node.changeType(b.oldType)
                }, redo: function (b) {
                    b.node.changeType(b.newType)
                }
            }, moveNode: {
                undo: function (b) {
                    b.startParent.moveTo(b.node, b.startIndex)
                }, redo: function (b) {
                    b.endParent.moveTo(b.node, b.endIndex)
                }
            }, sort: {
                undo: function (b) {
                    var c = b.node;
                    c.hideChilds();
                    c.sort = b.oldSort;
                    c.childs = b.oldChilds;
                    c.showChilds()
                }, redo: function (b) {
                    var c = b.node;
                    c.hideChilds();
                    c.sort = b.newSort;
                    c.childs = b.newChilds;
                    c.showChilds()
                }
            }
        }
    };
    d.History.prototype.onChange =
        function () {
        };
    d.History.prototype.add = function (a, b) {
        this.index++;
        this.history[this.index] = {action: a, params: b, timestamp: new Date};
        this.index < this.history.length - 1 && this.history.splice(this.index + 1, this.history.length - this.index - 1);
        this.onChange()
    };
    d.History.prototype.clear = function () {
        this.history = [];
        this.index = -1;
        this.onChange()
    };
    d.History.prototype.canUndo = function () {
        return 0 <= this.index
    };
    d.History.prototype.canRedo = function () {
        return this.index < this.history.length - 1
    };
    d.History.prototype.undo = function () {
        if (this.canUndo()) {
            var a =
                this.history[this.index];
            if (a) {
                var b = this.actions[a.action];
                b && b.undo ? (b.undo(a.params), a.params.oldSelection && this.editor.setSelection(a.params.oldSelection)) : console.log('Error: unknown action "' + a.action + '"')
            }
            this.index--;
            this.onChange()
        }
    };
    d.History.prototype.redo = function () {
        if (this.canRedo()) {
            this.index++;
            var a = this.history[this.index];
            if (a) {
                var b = this.actions[a.action];
                b && b.redo ? (b.redo(a.params), a.params.newSelection && this.editor.setSelection(a.params.newSelection)) : console.log('Error: unknown action "' +
                    a.action + '"')
            }
            this.onChange()
        }
    };
    d = d || {};
    d.SearchBox = function (a, b) {
        var c = this;
        this.editor = a;
        this.timeout = void 0;
        this.delay = 200;
        this.lastText = void 0;
        this.dom = {};
        this.dom.container = b;
        a = document.createElement("table");
        this.dom.table = a;
        a.className = "search";
        b.appendChild(a);
        var e = document.createElement("tbody");
        this.dom.tbody = e;
        a.appendChild(e);
        b = document.createElement("tr");
        e.appendChild(b);
        a = document.createElement("td");
        b.appendChild(a);
        e = document.createElement("div");
        this.dom.results = e;
        e.className = "results";
        a.appendChild(e);
        a = document.createElement("td");
        b.appendChild(a);
        b = document.createElement("div");
        this.dom.input = b;
        b.className = "frame";
        b.title = "Search fields and values";
        a.appendChild(b);
        a = document.createElement("table");
        b.appendChild(a);
        e = document.createElement("tbody");
        a.appendChild(e);
        b = document.createElement("tr");
        e.appendChild(b);
        e = document.createElement("button");
        e.className = "refresh";
        a = document.createElement("td");
        a.appendChild(e);
        b.appendChild(a);
        var f = document.createElement("input");
        this.dom.search =
            f;
        f.oninput = function (g) {
            c._onDelayedSearch(g)
        };
        f.onchange = function (g) {
            c._onSearch(g)
        };
        f.onkeydown = function (g) {
            c._onKeyDown(g)
        };
        f.onkeyup = function (g) {
            c._onKeyUp(g)
        };
        e.onclick = function (g) {
            f.select()
        };
        a = document.createElement("td");
        a.appendChild(f);
        b.appendChild(a);
        e = document.createElement("button");
        e.title = "Next result (Enter)";
        e.className = "next";
        e.onclick = function () {
            c.next()
        };
        a = document.createElement("td");
        a.appendChild(e);
        b.appendChild(a);
        e = document.createElement("button");
        e.title = "Previous result (Shift+Enter)";
        e.className = "previous";
        e.onclick = function () {
            c.previous()
        };
        a = document.createElement("td");
        a.appendChild(e);
        b.appendChild(a)
    };
    d.SearchBox.prototype.next = function (a) {
        if (void 0 != this.results) {
            var b = void 0 != this.resultIndex ? this.resultIndex + 1 : 0;
            b > this.results.length - 1 && (b = 0);
            this._setActiveResult(b, a)
        }
    };
    d.SearchBox.prototype.previous = function (a) {
        if (void 0 != this.results) {
            var b = this.results.length - 1, c = void 0 != this.resultIndex ? this.resultIndex - 1 : b;
            0 > c && (c = b);
            this._setActiveResult(c, a)
        }
    };
    d.SearchBox.prototype._setActiveResult =
        function (a, b) {
            if (this.activeResult) {
                var c = this.activeResult.node;
                "field" == this.activeResult.elem ? delete c.searchFieldActive : delete c.searchValueActive;
                c.updateDom()
            }
            if (this.results && this.results[a]) {
                this.resultIndex = a;
                var e = this.results[this.resultIndex].node, f = this.results[this.resultIndex].elem;
                "field" == f ? e.searchFieldActive = !0 : e.searchValueActive = !0;
                this.activeResult = this.results[this.resultIndex];
                e.updateDom();
                e.scrollTo(function () {
                    b && e.focus(f)
                })
            } else this.activeResult = this.resultIndex = void 0
        };
    d.SearchBox.prototype._clearDelay = function () {
        void 0 != this.timeout && (clearTimeout(this.timeout), delete this.timeout)
    };
    d.SearchBox.prototype._onDelayedSearch = function (a) {
        this._clearDelay();
        var b = this;
        this.timeout = setTimeout(function (c) {
            b._onSearch(c)
        }, this.delay)
    };
    d.SearchBox.prototype._onSearch = function (a, b) {
        this._clearDelay();
        a = this.dom.search.value;
        a = 0 < a.length ? a : void 0;
        if (a != this.lastText || b) if (this.lastText = a, this.results = this.editor.search(a), this._setActiveResult(void 0), void 0 != a) switch (b = this.results.length,
            b) {
            case 0:
                this.dom.results.innerHTML = "no&nbsp;results";
                break;
            case 1:
                this.dom.results.innerHTML = "1&nbsp;result";
                break;
            default:
                this.dom.results.innerHTML = b + "&nbsp;results"
        } else this.dom.results.innerHTML = ""
    };
    d.SearchBox.prototype._onKeyDown = function (a) {
        a = a || window.event;
        var b = a.which || a.keyCode;
        27 == b ? (this.dom.search.value = "", this._onSearch(a), d.util.preventDefault(a), d.util.stopPropagation(a)) : 13 == b && (a.ctrlKey ? this._onSearch(a, !0) : a.shiftKey ? this.previous() : this.next(), d.util.preventDefault(a), d.util.stopPropagation(a))
    };
    d.SearchBox.prototype._onKeyUp = function (a) {
        a = a || window.event;
        var b = a.which || a.keyCode;
        27 != b && 13 != b && this._onDelayedSearch(a)
    };
    d = d || {};
    d.Highlighter = function () {
        this.locked = !1
    };
    d.Highlighter.prototype.highlight = function (a) {
        this.locked || (this.node != a && (this.node && this.node.setHighlight(!1), this.node = a, this.node.setHighlight(!0)), this._cancelUnhighlight())
    };
    d.Highlighter.prototype.unhighlight = function () {
        if (!this.locked) {
            var a = this;
            this.node && (this._cancelUnhighlight(), this.unhighlightTimer = setTimeout(function () {
                a.node.setHighlight(!1);
                a.node = void 0;
                a.unhighlightTimer = void 0
            }, 0))
        }
    };
    d.Highlighter.prototype._cancelUnhighlight = function () {
        this.unhighlightTimer && (clearTimeout(this.unhighlightTimer), this.unhighlightTimer = void 0)
    };
    d.Highlighter.prototype.lock = function () {
        this.locked = !0
    };
    d.Highlighter.prototype.unlock = function () {
        this.locked = !1
    };
    d = d || {};
    d.util = {};
    Array.prototype.indexOf || (Array.prototype.indexOf = function (a) {
        for (var b = 0; b < this.length; b++) if (this[b] == a) return b;
        return -1
    });
    Array.prototype.forEach || (Array.prototype.forEach = function (a,
                                                                    b) {
        for (var c = 0, e = this.length; c < e; ++c) a.call(b || this, this[c], c, this)
    });
    "undefined" === typeof console && (console = {
        log: function () {
        }
    });
    d.util.parse = function (a) {
        try {
            return JSON.parse(a)
        } catch (b) {
            throw a = d.util.validate(a) || b, Error(a);
        }
    };
    d.util.validate = function (a) {
        var b = void 0;
        try {
            "undefined" != typeof jsonlint ? jsonlint.parse(a) : JSON.parse(a)
        } catch (c) {
            b = '<pre class="error">' + c.toString() + "</pre>", "undefined" != typeof jsonlint && (b += '<a class="error" href="http://zaach.github.com/jsonlint/" target="_blank">validated by jsonlint</a>')
        }
        return b
    };
    d.util.getAbsoluteLeft = function (a) {
        for (var b = a.offsetLeft, c = document.body, e = a.offsetParent; null != e && a != c;) b += e.offsetLeft, b -= e.scrollLeft, e = e.offsetParent;
        return b
    };
    d.util.getAbsoluteTop = function (a) {
        var b = a.offsetTop, c = document.body;
        for (a = a.offsetParent; null != a && a != c;) b += a.offsetTop, b -= a.scrollTop, a = a.offsetParent;
        return b
    };
    d.util.getMouseY = function (a) {
        return "pageY" in a ? a.pageY : a.clientY + document.documentElement.scrollTop
    };
    d.util.getMouseX = function (a) {
        return "pageX" in a ? a.pageX : a.clientX + document.documentElement.scrollLeft
    };
    d.util.getWindowHeight = function () {
        return "innerHeight" in window ? window.innerHeight : Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    };
    d.util.addClassName = function (a, b) {
        var c = a.className.split(" ");
        -1 == c.indexOf(b) && (c.push(b), a.className = c.join(" "))
    };
    d.util.removeClassName = function (a, b) {
        var c = a.className.split(" ");
        b = c.indexOf(b);
        -1 != b && (c.splice(b, 1), a.className = c.join(" "))
    };
    d.util.stripFormatting = function (a) {
        a = a.childNodes;
        for (var b = 0, c = a.length; b < c; b++) {
            var e = a[b];
            e.style &&
            e.removeAttribute("style");
            var f = e.attributes;
            if (f) for (var g = f.length - 1; 0 <= g; g--) {
                var h = f[g];
                1 == h.specified && e.removeAttribute(h.name)
            }
            d.util.stripFormatting(e)
        }
    };
    d.util.setEndOfContentEditable = function (a) {
        if (document.createRange) {
            var b = document.createRange();
            b.selectNodeContents(a);
            b.collapse(!1);
            a = window.getSelection();
            a.removeAllRanges();
            a.addRange(b)
        } else document.selection && (b = document.body.createTextRange(), b.moveToElementText(a), b.collapse(!1), b.select())
    };
    d.util.selectContentEditable = function (a) {
        if (a &&
            "DIV" == a.nodeName) if (window.getSelection && document.createRange) {
            var b = document.createRange();
            b.selectNodeContents(a);
            a = window.getSelection();
            a.removeAllRanges();
            a.addRange(b)
        } else document.body.createTextRange && (b = document.body.createTextRange(), b.moveToElementText(a), b.select())
    };
    d.util.getSelection = function () {
        if (window.getSelection) {
            var a = window.getSelection();
            if (a.getRangeAt && a.rangeCount) return a.getRangeAt(0)
        } else if (document.selection && document.selection.createRange) return document.selection.createRange();
        return null
    };
    d.util.setSelection = function (a) {
        if (a) if (window.getSelection) {
            var b = window.getSelection();
            b.removeAllRanges();
            b.addRange(a)
        } else document.selection && a.select && a.select()
    };
    d.util.getSelectionOffset = function () {
        var a = d.util.getSelection();
        return a && "startOffset" in a && "endOffset" in a && a.startContainer && a.startContainer == a.endContainer ? {
            startOffset: a.startOffset,
            endOffset: a.endOffset,
            container: a.startContainer.parentNode
        } : null
    };
    d.util.setSelectionOffset = function (a) {
        if (document.createRange &&
            window.getSelection && window.getSelection()) {
            var b = document.createRange();
            b.setStart(a.container.firstChild, a.startOffset);
            b.setEnd(a.container.firstChild, a.endOffset);
            d.util.setSelection(b)
        }
    };
    d.util.getInnerText = function (a, b) {
        void 0 == b && (b = {
            text: "", flush: function () {
                var k = this.text;
                this.text = "";
                return k
            }, set: function (k) {
                this.text = k
            }
        });
        if (a.nodeValue) return b.flush() + a.nodeValue;
        if (a.hasChildNodes()) {
            a = a.childNodes;
            for (var c = "", e = 0, f = a.length; e < f; e++) {
                var g = a[e];
                if ("DIV" == g.nodeName || "P" == g.nodeName) {
                    var h =
                        a[e - 1];
                    (h = h ? h.nodeName : void 0) && "DIV" != h && "P" != h && "BR" != h && (c += "\n", b.flush());
                    c += d.util.getInnerText(g, b);
                    b.set("\n")
                } else "BR" == g.nodeName ? (c += b.flush(), b.set("\n")) : c += d.util.getInnerText(g, b)
            }
            return c
        }
        return "P" == a.nodeName && -1 != d.util.getInternetExplorerVersion() ? b.flush() : ""
    };
    d.util.getInternetExplorerVersion = function () {
        if (-1 == u) {
            var a = -1;
            "Microsoft Internet Explorer" == navigator.appName && null != /MSIE ([0-9]{1,}[.0-9]{0,})/.exec(navigator.userAgent) && (a = parseFloat(RegExp.$1));
            u = a
        }
        return u
    };
    var u =
        -1;
    d.util.addEventListener = function (a, b, c, e) {
        if (a.addEventListener) return void 0 === e && (e = !1), "mousewheel" === b && 0 <= navigator.userAgent.indexOf("Firefox") && (b = "DOMMouseScroll"), a.addEventListener(b, c, e), c;
        e = function () {
            return c.call(a, window.event)
        };
        a.attachEvent("on" + b, e);
        return e
    };
    d.util.removeEventListener = function (a, b, c, e) {
        a.removeEventListener ? (void 0 === e && (e = !1), "mousewheel" === b && 0 <= navigator.userAgent.indexOf("Firefox") && (b = "DOMMouseScroll"), a.removeEventListener(b, c, e)) : a.detachEvent("on" + b,
            c)
    };
    d.util.stopPropagation = function (a) {
        a || (a = window.event);
        a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0
    };
    d.util.preventDefault = function (a) {
        a || (a = window.event);
        a.preventDefault ? a.preventDefault() : a.returnValue = !1
    };
    var v = {JSONEditor: d.JSONEditor, JSONFormatter: d.JSONFormatter, util: d.util}, w = function () {
        var a = document.getElementsByTagName("script");
        a = a[a.length - 1].src.split("?")[0];
        a = a.substring(0, a.length - 2) + "css";
        var b = document.createElement("link");
        b.type = "text/css";
        b.rel = "stylesheet";
        b.href =
            a;
        document.getElementsByTagName("head")[0].appendChild(b)
    };
    "undefined" != typeof module && "undefined" != typeof exports && (w(), module.exports = exports = v);
    "undefined" != typeof require && "undefined" != typeof define ? define(function () {
        w();
        return v
    }) : window.jsoneditor = v
})();