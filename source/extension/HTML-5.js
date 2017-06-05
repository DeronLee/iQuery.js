define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- Document Current Script ---------- */

    var Stack_Prefix = {
            webkit:     'at ',
            mozilla:    '@',
            msie:       'at Global code \\('
        };

    function Script_URL() {
        try {
            throw  new Error('AMD_Loader');
        } catch (iError) {
            var iURL;

            for (var iCore in Stack_Prefix)
                if ( $.browser[iCore] ) {
                    iURL = iError.stack.match(RegExp(
                        "\\s+" + Stack_Prefix[iCore] + "(http(s)?:\\/\\/[^:]+)"
                    ));

                    return  iURL && iURL[1];
                }
        }
    }

    if (! ('currentScript' in DOM))
        Object.defineProperty(Object.getPrototypeOf(DOM), 'currentScript', {
            get:    function () {
                var iURL = ($.browser.msie < 10)  ||  Script_URL();

                for (var i = 0;  DOM.scripts[i];  i++)
                    if ((iURL === true)  ?
                        (DOM.scripts[i].readyState == 'interactive')  :
                        (DOM.scripts[i].src == iURL)
                    )
                        return DOM.scripts[i];
            }
        });

/* ---------- ParentNode Children ---------- */

    function HTMLCollection(DOM_Array) {

        for (var i = 0, j = 0;  DOM_Array[i];  i++)
            if (DOM_Array[i].nodeType == 1){
                this[j] = DOM_Array[i];

                if (this[j++].name)  this[this[j - 1].name] = this[j - 1];
            }

        this.length = j;
    }

    HTMLCollection.prototype.item = HTMLCollection.prototype.namedItem =
        function () {
            return  this[ arguments[0] ]  ||  null;
        };

    var Children_Define = {
            get:    function () {
                return  new HTMLCollection( this.childNodes );
            }
        };

    if (! DOM.createDocumentFragment().children)
        Object.defineProperty(
            ($.browser.modern ? DocumentFragment : DOM.constructor).prototype,
            'children',
            Children_Define
        );

    if (! DOM.head.children[0])
        Object.defineProperty(DOM_Proto, 'children', Children_Define);


/* ---------- Scrolling Element ---------- */

    var DocProto = DOM.constructor.prototype;

    if (! Object.getOwnPropertyDescriptor(DocProto, 'scrollingElement'))
        Object.defineProperty(DocProto, 'scrollingElement', {
            get:    function () {
                return  ($.browser.webkit || (DOM.compatMode == 'BackCompat'))  ?
                    DOM.body  :  DOM.documentElement;
            }
        });

/* ---------- URL Search Parameter ---------- */

    function URLSearchParams() {

        this.length = 0;

        var _This_ = this;

        arguments[0].replace(/([^&=]+)=([^&]+)/g,  function (_, key, value) {

            _This_.append(key, value);
        });
    }

    $.extend(URLSearchParams.prototype, {
        push:        Array.prototype.push,
        splice:      Array.prototype.splice,
        append:      function (key, value) {

            this.push([key,  value + '']);
        },
        get:         function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  return this[i][1];
        },
        getAll:      function (key) {

            return  $.map(this,  function (_This_) {

                if (_This_[0] === key)  return _This_[1];
            });
        },
        delete:      function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  this.splice(i, 1);
        },
        set:         function (key, value) {

            if (this.get( key )  != null)  this.delete( key );

            this.append(key, value);
        },
        toString:    function () {

            return  encodeURIComponent($.map(this,  function (_This_) {

                return  _This_[0] + '=' + _This_[1];

            }).join('&'));
        },
        entries:     function () {

            return  $.makeIterator( this );
        }
    });

    BOM.URLSearchParams = BOM.URLSearchParams || URLSearchParams;

    BOM.URLSearchParams.prototype.sort =
        BOM.URLSearchParams.prototype.sort  ||  function () {

            Array.prototype.sort.call(this,  function (A, B) {

                return  A[0].localeCompare( B[0] );
            });
        };

/* ---------- Selected Options ---------- */

    if ($.browser.msie < 12)
        Object.defineProperty(HTMLSelectElement.prototype, 'selectedOptions', {
            get:    function () {
                return  new HTMLCollection(
                    $.map(this.options,  function (iOption) {
                        return  iOption.selected ? iOption : null;
                    })
                );
            }
        });
/* ---------- Element CSS Selector Match ---------- */

    var DOM_Proto = Element.prototype;

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector ||
        function () {
            if (! this.parentNode)  $('<div />')[0].appendChild(this);

            return  ($.inArray(
                this,  this.parentNode.querySelectorAll( arguments[0] )
            ) > -1);
        };


    if (! ($.browser.msie < 11))  return;

/* ---------- Element Data Set ---------- */

    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[$.camelCase( iAttr.nodeName.slice(5) )] = iAttr.nodeValue;
        }
    }

    Object.defineProperty(DOM_Proto, 'dataset', {
        get:    function () {
            return  new DOMStringMap(this);
        }
    });

/* ---------- URL Origin ---------- */

    var Origin_Define = {
            get:    function () {
                return  $.urlDomain( this.href )  ||  '';
            }
        };
    Object.defineProperty(
        BOM.location.constructor.prototype,  'origin',  Origin_Define
    );
    Object.defineProperty(HTMLAnchorElement.prototype, 'origin', Origin_Define);


    if (! ($.browser.msie < 10))  return;

/* ---------- Error Useful Information ---------- */

    //  Thanks "Kevin Yang" ---
    //
    //      http://www.imkevinyang.com/2010/01/%E8%A7%A3%E6%9E%90ie%E4%B8%AD%E7%9A%84javascript-error%E5%AF%B9%E8%B1%A1.html

    Error.prototype.valueOf = function () {
        return  $.extend(this, {
            code:       this.number & 0x0FFFF,
            helpURL:    'https://msdn.microsoft.com/en-us/library/1dk3k160(VS.85).aspx'
        });
    };

/* ---------- DOM Class List ---------- */

    function DOMTokenList() {

        this.length = 0;

        $.merge(
            this,  (arguments[0].getAttribute('class') || '').trim().split(/\s+/)
        );
    }

    DOMTokenList.prototype.contains = function (iClass) {
        if (iClass.match(/\s+/))
            throw  new DOMException([
                "Failed to execute 'contains' on 'DOMTokenList': The token provided (",
                iClass,
                ") contains HTML space characters, which are not valid in tokens."
            ].join("'"));

        return  (Array.prototype.indexOf.call(this, iClass) > -1);
    };

    Object.defineProperty(DOM_Proto, 'classList', {
        get:    function () {
            return  new DOMTokenList(this);
        }
    });

/* ---------- DOM InnerHTML ---------- */

    var InnerHTML = Object.getOwnPropertyDescriptor(DOM_Proto, 'innerHTML');

    Object.defineProperty(DOM_Proto, 'innerHTML', {
        set:    function (iHTML) {
            if (! String(iHTML).match(
                /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
            ))
                return  InnerHTML.set.call(this, iHTML);

            InnerHTML.set.call(this,  'IE_Scope' + iHTML);

            var iChild = this.childNodes;
            iChild[0].nodeValue = iChild[0].nodeValue.slice(8);

            if (! iChild[0].nodeValue[0])  this.removeChild( iChild[0] );
        }
    });

});
