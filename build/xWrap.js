(function (iGlobal, iMain) {

    if (typeof iGlobal.define == 'function')
        iGlobal.define('iQuery', iMain);
    else
        iMain();

})((window !== undefined) ? window : this,  function () {


});