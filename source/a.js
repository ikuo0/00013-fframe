// 日本語
(new function() {
    console.log("a#a");
    var self = this;
    self.start = function() {
        console.log("a#start");
        var me = this;
    }
    self.start();
}());
