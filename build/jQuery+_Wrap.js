(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('jQuery+', ['jquery'], arguments[0]);

})(function () {



});