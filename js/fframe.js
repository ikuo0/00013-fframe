
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
    ////////////////////////////////////////
    // router
    ////////////////////////////////////////
    self.ApplyRouter = function routerApply(rootPath, opt) {
        print("ff#applyRouter");
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
                    var $contents = $("body");
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
            });
        });
        $(window).trigger("hashchange");
    }
    
    ////////////////////////////////////////
    // input's syncro and validation
    ////////////////////////////////////////
    var warningDivCSS = {
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
    self.AddSyncroAndValid_Text = function (obj, id, opt) {
        var $elm = $(id);
        var minLength = "min" in opt ? opt["min"]: false;
        var maxLength = "max" in opt ? opt["max"]: false;
        var $warn = $("<div>", {"css": warningDivCSS});
        obj[id] = "value" in opt ? opt["value"]: "";
        $("body").append($warn);
        $elm.on("change", function() {
            $warn.hide();
            var val = $elm.val();
            obj[id] = val;
            var warnText = false;
            if(minLength && val.length < minLength) {
                warnText = String(minLength) + "文字以上必要です";
            }
            if(maxLength && val.length > maxLength) {
                warnText = String(maxLength) + "文字以下です";
            }

            if(warnText !== false) {
                var pos = $elm.offset();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
            }

            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, val]);
            }
        });
        $elm.val(obj[id]);
        $elm.trigger("change");
    }
    
    self.AddSyncroAndValid_Number = function (obj, id, opt) {
        var $elm = $(id);
        var minNumber = "min" in opt ? opt["min"]: false;
        var maxNumber = "max" in opt ? opt["max"]: false;
        var $warn = $("<div>", {"css": warningDivCSS});
        obj[id] = "value" in opt ? opt["value"]: 0;
        $("body").append($warn);
        $elm.on("change", function() {
            $warn.hide();
            var val = $elm.val();
            obj[id] = val;
            var warnText = false;
            if(minNumber && val < minNumber) {
                warnText = String(minNumber) + "以上の値を入力して下さい";
            }
            if(maxNumber && val > maxNumber) {
                warnText = String(maxNumber) + "以下の値を入力して下さい";
            }

            if(warnText !== false) {
                var pos = $elm.offset();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
            }

            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, val]);
            }
        });
        $elm.val(obj[id]);
        $elm.trigger("change");
    }
    
    self.AddSyncroAndValid_SplitNumber = function (obj, id, opt) {
        var $elm = $(id);
        var $warn = $("<div>", {"css": warningDivCSS});
        var digits = opt["digits"]
        var total = digits.reduce(function(v1, v2) {return v1 + v2;}, 0);
        var require = "require" in opt ? opt["require"]: false;
        obj[id] = "value" in opt ? opt["value"]: "";
        $("body").append($warn);
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
            obj[id] = val;
            var warnText = false;
            var totalLength = total + (digits.length - 1);
            if(require && val.length != totalLength) {
                warnText = "入力必須です";
            }

            if(warnText !== false) {
                var pos = $elm.offset();
                var x = pos.left;
                var y = pos.top + $elm.outerHeight();
                $warn.text(warnText);
                $warn.css({"top": y, "left": x});
                $warn.show();
            }

            if("OnChange" in obj) {
                obj["OnChange"].apply(obj, [id, val]);
            }
        });
        $elm.val(obj[id]);
        $elm.trigger("keyup");
    }
}();
