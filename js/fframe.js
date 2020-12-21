
function print() {
    console.log.apply(console, arguments)
}

function delay(ms) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(true);
        }, ms);
    });
}

var ff = new function() {
    var self = this;
    self.PathInfo = {};
    ////////////////////////////////////////
    // router
    ////////////////////////////////////////
    self.ApplyRouter = function routerApply(rootPath, $target, opt) {
        print("ff#applyRouter");
        var me = this;
        if(opt && "ajax-cache" in opt) {
            $.ajaxSetup({"cache": opt["ajax-cache"]});
        }
        $(window).on("hashchange", function() {
            print("applyRouter#hashchange");
            ////////////////////////////////////////
            // parse
            ////////////////////////////////////////
            var parser = document.createElement("a");
            parser.href = location.href;
            var splitPath = parser.pathname.split("/", 2);
            var relativePath = undefined;
            var pageKey = undefined;
            if(splitPath.length > 1) {
                relativePath = splitPath[1];
            }
            if(parser.hash.length > 1 && parser.hash.slice(0, 2) == "#!") {
                pageKey = parser.hash.substr(2);
            }
            me.PathInfo = {
                "protocol": parser.protocol,
                "hostname": parser.hostname,
                "port": parser.port,
                "pathname": parser.pathname,
                "search": parser.search,
                "hash": parser.hash,
                "host": parser.host,
                "relativePath": relativePath,
                "pageKey": pageKey
            };
            parser.remove();
            ////////////////////////////////////////
            // load html file and javascript file
            ////////////////////////////////////////
            var identifier = pageKey;
            var htmlfile = [rootPath, identifier + ".html"].join("/");
            var jsfile = [rootPath, identifier + ".js"].join("/");
            delay(1) // body の読み込みを待つ
            .then(function() {
                return new Promise(function(resolve, reject) {
                    //var $contents = $("body");
                    var $contents = $target;
                    $contents.hide();
                    $contents.load(htmlfile, function() {
                        $contents.show();
                        resolve(true);
                    });
                })
            })
            .then(function() {
                return new Promise(function(resolve, reject) {
                    $.getScript(jsfile, function() {
                        resolve(true);
                    });
                });
            })
            .then(function() {
                if("OnHashChange" in opt) {
                    opt["OnHashChange"]();
                }
                return true;
            });
        });
        $(window).trigger("hashchange");
    }
    ////////////////////////////////////////
    // ChangeContents
    ////////////////////////////////////////
    self.ChangeContents = function(allId, activeId) {
        for(var i = 0; i < allId.length; i+= 1) {
            $(allId[i]).hide();
        }
        $(activeId).show();
    }
    
    ////////////////////////////////////////
    // messagebox
    ////////////////////////////////////////
    self.messageBox = function(backColor, foreColor, text, timeout) {
        var $div = $("<div>", {"css": {
                "height": "48px",
                "text-align": "center",
                "position": "fixed",
                "top": (screen.availHeight / 3) - 24,
                "left": 0,
                "width": "100%",
                "background-color": backColor,
                "color": foreColor,
                "font-size": "14px",
                "font-weight": "800",
                "z-index": 100,
            },
            "text": text
        });
        var $left = $("<div>", {"css": {
                "width": "48px",
                "line-height": "48px",
                "text-align": "center",
                "float": "left",
                "background-color": backColor,
                "color": foreColor,
                "border-right": "solid 1px " + foreColor,
                "cursor": "pointer"
            },
            "text": "X"
        });
        var $right = $("<div>", {"css": {
                "width": "48px",
                "line-height": "48px",
                "text-align": "center",
                "float": "right",
                "background-color": backColor,
                "color": foreColor,
                "border-left": "solid 1px " + foreColor,
                "cursor": "pointer"
            },
            "text": "X"
        });
        $left.click(function() {$div.remove()});
        $right.click(function() {$div.remove()});
        $div.append($left);
        $div.append($right);
        $("body").before($div);
        
        if(timeout) {
            setTimeout(function() {
                $div.remove()
            }, timeout);
        }
    }
    self.MessageBox_Danger = function(text, timeout) {
        var me = this;
        me.messageBox("#ff6347", "#000000", text, timeout);
    }
    self.MessageBox_Warn = function(text, timeout) {
        var me = this;
        me.messageBox("#ffa500", "#000000", text, timeout);
    }
    self.MessageBox_Info = function(text, timeout) {
        var me = this;
        me.messageBox("#00bfff", "#000000", text, timeout);
    }
    
    ////////////////////////////////////////
    // input's syncro and validation
    ////////////////////////////////////////
    self.warningDivCSS = {
        "display": "none",
        "position": "absolute",
        "border-style": "solid",
        "border-width": "2px",
        "border-radius": "5px",
        "border-color:": "#000000",
        "background-color": "#ffffff",
        "color": "#ff0000",
        "font-weight": 800,
    };
    self.setError = function(obj, id, isError, errorMessage) {
        if(!("FormError" in obj)) {
            obj["FormError"] = {};
        }
        obj["FormError"][id] = {
            "IsError": isError,
            "ErrorMessage": errorMessage,
        }
    }
    self.AddSyncroAndValid_Text = function (obj, id, opt) {// id = string or JQuery Object
        var me = this;
        var $elm = (typeof id == "string") ? $(id): id;
        var minLength = "min" in opt ? opt["min"]: false;
        var maxLength = "max" in opt ? opt["max"]: false;
        var $warn = $("<div>", {"css": me.warningDivCSS});
        var saveKey = (typeof id == "string") ? id: opt["key"];
        obj[saveKey] = "value" in opt ? opt["value"]: "";
        $elm.after($warn);
        $elm.on("change", function() {
            print("AddSyncroAndValid_Text#change");
            $warn.hide();
            var val = $elm.val();
            obj[saveKey] = val;
            var warnText = false;
            if(minLength && val.length < minLength) {
                warnText = String(minLength) + "文字以上必要です";
            }
            if(maxLength && val.length > maxLength) {
                warnText = String(maxLength) + "文字以下です";
            }

            if(warnText !== false) {
                var pos = $elm.position();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
                me.setError(obj, id, 1, warnText);
            } else {
                me.setError(obj, id, 0, "OK");
            }

            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, val]);
            }
        });
        $elm.val(obj[saveKey]);
        //$elm.trigger("change");
    }
    
    self.AddSyncroAndValid_Number = function (obj, id, opt) {
        var me = this;
        var $elm = (typeof id == "string") ? $(id): id;
        var minNumber = "min" in opt ? opt["min"]: false;
        var maxNumber = "max" in opt ? opt["max"]: false;
        var $warn = $("<div>", {"css": me.warningDivCSS});
        var saveKey = (typeof id == "string") ? id: opt["key"];
        obj[saveKey] = "value" in opt ? opt["value"]: "";
        $elm.after($warn);
        $elm.on("change", function() {
            $warn.hide();
            var val = $elm.val();
            obj[saveKey] = val;
            var warnText = false;
            if(minNumber && val < minNumber) {
                warnText = String(minNumber) + "以上の値を入力して下さい";
            }
            if(maxNumber && val > maxNumber) {
                warnText = String(maxNumber) + "以下の値を入力して下さい";
            }

            if(warnText !== false) {
                var pos = $elm.position();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
                me.setError(obj, id, 1, warnText);
            } else {
                me.setError(obj, id, 0, "OK");
            }

            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, val]);
            }
        });
        $elm.val(obj[saveKey]);
        //$elm.trigger("change");
    }
    
    self.AddSyncroAndValid_SplitNumber = function (obj, id, opt) {
        var me = this;
        var $elm = (typeof id == "string") ? $(id): id;
        var $warn = $("<div>", {"css": me.warningDivCSS});
        var saveKey = (typeof id == "string") ? id: opt["key"];
        var digits = opt["digits"]
        var total = digits.reduce(function(v1, v2) {return v1 + v2;}, 0);
        var require = "require" in opt ? opt["require"]: false;
        obj[saveKey] = "value" in opt ? opt["value"]: "";
        $elm.after($warn);
        $elm.on("keydown", function(e) {
            var $elm = $(e.target);
            var val = $elm.val();
            // backspace, delete
            if(val.length >= (total + digits.length - 1) && e.keyCode != 8 && e.keyCode != 46) {
                e.preventDefault();
                return;
            }
        });
        $elm.on("keyup", function(e) {
            var $elm = $(e.target);
            var val = $elm.val();
            print("e.keyCode", e.keyCode);
            
            // enter
            if(e.keyCode == 13) {
                $elm.trigger("change");
                return;
            }
            // back space
            if(e.keyCode == 8) {
                val = val.trim();
                val.slice(0, -1);
                $elm.val(val);
                return;
            }
            val = val.split("").filter(function(c) {
                var code = c.charCodeAt();
                if(code >= 48 && code <= 57) {
                    return true;
                } else {
                    return false;
                }
            });
            val = val.concat(new Array(total).fill(""));
            var vidx = 0;
            var newVal = [];
            for(var i = 0; i < digits.length; i++) {
                for(var j = 0; j < digits[i]; j++) {
                    newVal.push(val[vidx]);
                    vidx += 1;
                }
                if(i < (digits.length - 1)) {
                    newVal.push(" ");
                }
            }
            $elm.val(newVal.join("").trim());
        });
        $elm.on("change", function() {
            $warn.hide();
            var val = $elm.val();
            obj[saveKey] = val;
            var warnText = false;
            var totalLength = total + (digits.length - 1);
            if(require && val.length != totalLength) {
                warnText = "入力必須です";
            }

            if(warnText !== false) {
                var pos = $elm.position();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
                me.setError(obj, id, 1, warnText);
            } else {
                me.setError(obj, id, 0, "OK");
            }

            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, val]);
            }
        });
        $elm.val(obj[saveKey]);
        //$elm.trigger("keyup");
    }
    self.AddSyncroAndValid_DatePicker = function(obj, id, opt) {
        var me = this;
        var $elm = (typeof id == "string") ? $(id): id;
        if(!("error" in obj)) {obj["error"] = {};}
        var $warn = $("<div>", {"css": me.warningDivCSS});
        var saveKey = (typeof id == "string") ? id: opt["key"];
        obj[saveKey] = "value" in opt ? opt["value"]: "";
        obj[saveKey + ":unixtime"] = 0;
        $elm.val(obj[saveKey]);
        $elm.after($warn);
        
        $elm.on("change", function() {
            var ut = 0;
            if($(id).datepicker("getDate") != null) {
                ut = parseInt($(id).datepicker("getDate").getTime() / 1000);
            }
            $warn.hide();
            var nowDateUt = parseInt((new Date()).getTime() / 1000);
            var tmpMm = moment.unix(nowDateUt)
            tmpMm = moment([tmpMm.year(), tmpMm.month(), tmpMm.date()]);
            nowDateUt = tmpMm.unix();
            
            var val = $elm.val();
            obj[saveKey] = val;
            obj[saveKey + ":unixtime"] = ut;
            var warnText = false;
            if("relativeMinDate" in opt && ut < (nowDateUt + (opt["relativeMinDate"] * 86400))) {
                var limitDate = nowDateUt + (opt["relativeMinDate"] * 86400);
                var mm = moment.unix(limitDate);
                warnText = mm.format("YYYY/MM/DD") + "以降の日付を選択して下さい";
            }
            if("relativeMaxDate" in opt && ut > (nowDateUt + (opt["relativeMaxDate"] * 86400))) {
                var limitDate = nowDateUt + (opt["relativeMaxDate"] * 86400);
                var mm = moment.unix(limitDate);
                warnText = mm.format("YYYY/MM/DD") + "以前の日付を選択して下さい";
            }
            if("require" in opt && ut == 0) {
                warnText = "日付を選択して下さい";
            }
            
            if(warnText !== false) {
                var pos = $elm.position();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
                me.setError(obj, id, 1, warnText);
            } else {
                me.setError(obj, id, 0, "OK");
            }
            
            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, ut]);
            }
        });
    }
}();
