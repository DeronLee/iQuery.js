//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v2.0  (2016-07-12)  Beta
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//


define([
    'extension/iBrowser', 'iObject', 'iUtility', 'extension/iUtility',
    'iEvent', 'extension/iEvent', 'extension/IE-8', 'extension/HTML-5',
    'iAnimation', 'extension/iDOM', 'extension/iCSS', 'extension/iSelection',
    'extension/iObserver', 'iAJAX', 'extension/HTML-5_Form', 'extension/iAJAX'
],  function ($) {

    var BOM = self;

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    return $;

});