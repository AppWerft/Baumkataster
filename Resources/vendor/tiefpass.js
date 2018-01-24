var Module = function() {
    var opts = arguments[0] || {};
    this.steps = opts.steps || 5;
    this.stack = [];

};
Module.prototype.add = function(foo) {
    this.stack.push(foo);
    if (this.stack.length > this.steps)
        this.stack.shift();
    var bar = 0;
    var that = this;
    this.stack.forEach(function(e, i) {
        bar += e;
    });
    if (this.stack.length < this.steps)
        return bar / this.stack.length;
    else {
        var bar = 0,
            total = 0;
        for (var i = this.steps-1; i > 0; i--) {
            bar += this.stack[i] * i;
            total += i;
        }
        return bar / total;
    }

};
module.exports = Module;
