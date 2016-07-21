//
//              >>>  jQuery+  <<<
//
//
//    [Version]    v7.6  (2016-07-21)
//
//    [Require]    jQuery  v1.9+
//
//
//        (C)2014-2016  shiy2008@gmail.com
//


define([
    'jquery',
    'extension/iBrowser', 'extension/iObject',
    'extension/iTimer', 'extension/iUtility',
    'extension/IE-8',
    'extension/Insert', 'extension/iDOM', 'extension/iCSS',
    'extension/iSelection', 'extension/iEvent',
    'extension/HTML-5', 'extension/HTML-5_Form', 'extension/iRESTful', 'extension/iObserver', 'extension/iAJAX'
],  function ($) {

    var BOM = self;

    return  BOM.jQuery.extend(true, $);

});