// 日本語
(new function() {
    print("input-form#a");
    var self = this;
    self.setupForms = function() {
        print("input-form#setupForms");
        var me = this;
        me.formCtrl = {
            "OnChange": function(id, val) {
                var obj = this;
                print("obj[" + id + "]=" + obj[id] + "");
            }
        };
        ff.AddSyncroAndValid_Text(me.formCtrl, "#input-text", {"value": "HOGE", "min": 3, "max": 15});
        ff.AddSyncroAndValid_Number(me.formCtrl, "#input-number", {"value": 100, "min": 20, "max": 200});
        ff.AddSyncroAndValid_SplitNumber(me.formCtrl, "#input-postal-code", {"value": "1234567", "digits": [3, 4], "require": true});
        ff.AddSyncroAndValid_SplitNumber(me.formCtrl, "#input-credit-number", {"value": "1234123412341234", "digits": [4, 4, 4, 4], "require": true});
        ff.AddSyncroAndValid_Text(me.formCtrl, "#input-text-area", {"value": "HOGE\nPIYO\nFUGA", "min": 10, "max": 200});
    }
    self.start = function() {
        print("input-form#start");
        var me = this;
        me.setupForms();
    }
    self.start();
}());
