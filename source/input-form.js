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
    self.setupEvents = function() {
        print("input-form#setupEvents");
        var me = this;
        $("#button-send").click(function() {
            // apply validation
            $("#input-text,#input-number,#input-postal-code,#input-credit-number,#input-text-area").trigger("change");
            ff.SyncroAndValid_CheckBox(me.formCtrl, ["#checkbox-more1", "#checkbox-more2", "#checkbox-more3"], {"more": 2});
            ff.SyncroAndValid_CheckBox(me.formCtrl, ["#checkbox-only1", "#checkbox-only2", "#checkbox-only3"], {"only": 2});
            ff.SyncroAndValid_Radio(me.formCtrl, ["#radio1", "#radio2", "#radio3"], {"require": 1});
            
            // Error check
            var errorSum = ff.ErrorSum(me.formCtrl);
            if(errorSum > 0) {
                ff.MessageBox_Danger("入力エラーがあります", 5000);
            } else {
                ff.MessageBox_Info("入力エラーなし", 1500);
            }
            print(me.formCtrl);
            $("#show-variable").text(JSON.stringify(me.formCtrl, undefined, 4));
        });
    }
    self.start = function() {
        print("input-form#start");
        var me = this;
        me.setupForms();
        me.setupEvents()
    }
    self.start();
}());
