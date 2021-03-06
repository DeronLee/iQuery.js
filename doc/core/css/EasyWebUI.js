(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('EasyWebUI', ['jQueryKit'], arguments[0]);

})(function () {


(function (BOM, DOM, $) {

/* ---------- Flex Box 补丁  v0.2 ---------- */

    var CSS_Attribute = {
            Float:        {
                absolute:    true,
                fixed:       true
            },
            Display:      {
                block:    true,
                table:    true
            },
            Prefix:       (function (iUA) {
                try {
                    return ({
                        webkit:     '-webkit-',
                        gecko:      '-moz-',
                        trident:    '-ms-'
                    })[
                        iUA.match(/Gecko|WebKit|Trident/i)[0].toLowerCase()
                    ];
                } catch (iError) {
                    return '';
                }
            })(navigator.userAgent),
            Flex_Size:    {
                horizontal:    {
                    length:    'width',
                    margin:    ['left', 'right']
                },
                vertical:      {
                    length:    'height',
                    margin:    ['top', 'bottom']
                }
            }
        };
    function FlexFix() {
        var $_Box = $(this);

        var Size_Name = CSS_Attribute.Flex_Size[
                $_Box.css(CSS_Attribute.Prefix + 'box-orient')
            ];

        var Flex_Child = $.extend([ ], {
                sum:       0,
                sum_PX:    (
                    $_Box[Size_Name.length]() -
                    parseFloat( $_Box.css('padding-' + Size_Name.margin[0]) ) -
                    parseFloat( $_Box.css('padding-' + Size_Name.margin[1]) )
                )
            });
        $_Box.children().each(function () {
            var $_This = $(this);
            if (
                ($_This.css('position') in CSS_Attribute.Float) ||
                ($_This.css('display') == 'none')
            )
                return;

            var iDisplay = $_This.css('display').match(
                    RegExp(['(', CSS_Attribute.Prefix, ')?', '(inline)?-?(.+)?$'].join(''),  'i')
                );
            if ( iDisplay[2] )
                $_This.css({
                    display:    iDisplay[3] ?
                        (
                            ((iDisplay[3] in CSS_Attribute.Display) ? '' : CSS_Attribute.Prefix) +
                            iDisplay[3]
                        ) :
                        'block'
                });

            var _Index_ = Flex_Child.push({$_DOM:  $_This}) - 1,
                _Length_ = $_This[Size_Name.length]();

            if (! _Length_) {
                Flex_Child.pop();
                return;
            }

            Flex_Child[_Index_].scale = parseInt(
                $_This.css(CSS_Attribute.Prefix + 'box-flex')
            );

            Flex_Child.sum += Flex_Child[_Index_].scale;
            Flex_Child.sum_PX -= (
                _Length_ +
                parseFloat(
                    $_This.css('margin-' + Size_Name.margin[0])
                ) +
                parseFloat(
                    $_This.css('margin-' + Size_Name.margin[1])
                )
            );
        });
        if (Flex_Child.sum_PX < 0)  Flex_Child.sum_PX = 0;

        var iUnit = Flex_Child.sum_PX / Flex_Child.sum;
        for (var i = 0; i < Flex_Child.length; i++)
            Flex_Child[i].$_DOM[Size_Name.length](
                Flex_Child[i].$_DOM[Size_Name.length]() + (Flex_Child[i].scale * iUnit)
            );
    }

    var _addClass_ = $.fn.addClass;

    if ('flex' in DOM.documentElement.style)  return;

    $.fn.addClass = function () {
        _addClass_.apply(this, arguments);

        if ($.inArray('Flex-Box', arguments[0].split(/\s+/))  >  -1)
            return this.each(FlexFix);

        return this;
    };

    $(DOM).ready(function () {
        $('.Flex-Box').each(FlexFix);
    });

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- Input Range 补丁  v0.1 ---------- */

    function Pseudo_Bind() {
        var iRule = BOM.getMatchedCSSRules(this, ':before');

        $(this).change(function () {
            var iPercent = ((this.value / this.max) * 100) + '%';

            for (var i = 0;  i < iRule.length;  i++)
                iRule[i].style.setProperty('width', iPercent, 'important');
        });
    }

    Pseudo_Bind.No_Bug = (Math.floor($.browser.webkit) > 533);

    $.fn.Range = function () {
        return  this.each(function () {
            var $_This = $(this);

            //  Fill-Lower for WebKit
            if (Pseudo_Bind.No_Bug && (! $_This.hasClass('Detail')))
                $_This.cssRule({
                    ':before': {
                        width:    (($_This[0].value / $_This[0].max) * 100) + '%  !important'
                    }
                }, Pseudo_Bind);

            //  Data-List for All Cores
            var $_List = $('<datalist />', {
                    id:    $.uuid('Range')
                });

            $_This.attr('list', $_List[0].id);

            if (this.min) {
                var iSum = (this.max - this.min) / this.step;

                for (var i = 0;  i < iSum;  i++)
                    $_List.append('<option />', {
                        value:    Number(this.min + (this.step * i))/*,
                        text:     */
                    });
            }

            $_This.before($_List);
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- Input Data-List 补丁  v0.3 ---------- */

    var List_Type = 'input[type="' + [
            'text', 'tel', 'email', 'url', 'search'
        ].join(
            '"][list], input[type="'
        ) + '"]';

    function Tips_Show($_List) {
        if (! this.value)  $_List.append( $_List.$_Option );

        if (! $_List.height())  $_List.slideDown(100);

        return this.value;
    }

    function Tips_Hide() {
        if ( this.height() )  this.slideUp(100);

        return this;
    }

    function Tips_Match($_List) {
        $_List.$_Option = $.unique($.merge(
            $_List.$_Option,  $_List.children()
        ));

        var iValue = Tips_Show.call(this, $_List);

        if (! iValue)  return;

        $.each($_List.$_Option,  function () {
            for (var i = 0, _Index_;  i < iValue.length;  i++) {
                if (iValue[i + 1]  ===  undefined)  break;

                _Index_ = this.value.indexOf( iValue[i] );

                if (
                    (_Index_ < 0)  ||
                    (_Index_  >=  this.value.indexOf( iValue[i + 1] ))
                ) {
                    if (this.parentElement)  $(this).detach();
                    return;
                }
            }
            if (! this.parentElement)  $_List[0].appendChild( this );
        });
    }

    function DL_Change(iCallback) {
        return  this.change(function () {
            var iOption = this.list.options;

            for (var i = 0;  i < iOption.length;  i++)
                if (this.value == iOption[i].value)
                    return  iCallback.call(this, arguments[0], iOption[i]);
        });
    }

    $.fn.smartInput = function (onChange) {
        return  this.filter(List_Type).each(function () {

            var $_Input = $(this),  iPosition = this.parentNode.style.position;

            if ( BOM.HTMLDataListElement )
                return  DL_Change.call($_Input, onChange);

        //  DOM Property Patch
            $_Input[0].list = $('#' + this.getAttribute('list'))[0];

            var $_List = $( $_Input[0].list.children.item(0) );

            $_List[0].multiple = $_List[0].multiple || true;

            $_Input[0].list.options = $_List[0].children;

            if ($_Input.attr('autocomplete') == 'off')  return;

        //  Get Position
            if ((! iPosition)  ||  (iPosition == 'static'))
                $(this.parentNode).css({
                    position:    'relative',
                    zoom:        1
                });
            iPosition = $_Input.attr('autocomplete', 'off').position();
            iPosition.top += $_Input.height();

        //  DropDown List
            $_List.css($.extend(iPosition, {
                position:     'absolute',
                'z-index':    10000,
                height:       0,
                width:        $_Input.width(),
                padding:      0,
                border:       0,
                overflow:     'hidden',
                opacity:      0
            })).change(function () {
                $_Input[0].value = Tips_Hide.call($_List)[0].value;

                return onChange.call(
                    $_Input[0],
                    arguments[0],
                    this.children[this.selectIndex]
                );
            });
            $_List.$_Option = [ ];

            var iFilter = $.proxy(Tips_Match, null, $_List);

            $_Input.after($_List)
                .dblclick($.proxy(Tips_Show, null, $_List))
                .blur($.proxy(Tips_Hide, $_List))
                .keyup(iFilter)
                .on('paste', iFilter)
                .on('cut', iFilter);
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 密码确认插件  v0.3 ---------- */

    //  By 魏如松

    var $_Hint = $('<div class="Hint" />').css({
            position:         'absolute',
            width:            '0.625em',
            'font-weight':    'bold'
        });

    function showHint() {
        var iPosition = this.position();

        $_Hint.clone().text( arguments[0] ).css({
            color:    arguments[1],
            left:     (iPosition.left + this.width() - $_Hint.width()) + 'px',
            top:      (iPosition.top + this.height() * 0.2) + 'px'
        }).appendTo(
            this.parent()
        );
    }

    $.fn.pwConfirm = function () {
        var pwGroup = { },
            $_passwordAll = this.find('input[type="password"][name]');

        //  密码明文查看
        var $_visible = $('<div class="visible" />').css({
                position:       'absolute',
                right:          '5%',
                top:            '8%',
                'z-index':      1000000,
                'font-size':    '26px',
                cursor:         'pointer'
            });
        $_passwordAll.parent().css('position', 'relative').append( $_visible.clone() )
            .find('.visible').html('&#10002;').click(function(){
                var $_this = $(this);

                if($_this.text() == '✒')
                    $_this.html('&#10001;').siblings('input').attr('type', 'text');
                else
                    $_this.html('&#10002;').siblings('input').attr('type', 'password');
            });

        //  密码输入验证
        $_passwordAll.each(function (){
            if (! pwGroup[this.name])
                pwGroup[this.name] = $_passwordAll.filter('[name="' + this.name + '"]');
            else
                return;

            var $_password = pwGroup[this.name],
                _Complete_ = 0;

            if ($_password.length < 2)  return;

            $_password.blur(function () {
                var $_this = $(this);

                $_this.parent().find('.Hint').remove();

                if (! this.value) return;

                if (! this.checkValidity())
                    showHint.call($_this, '×', 'red');
                else if (++_Complete_ == 2) {
                    var $_other = $_password.not(this);

                    showHint.apply(
                        $_this,
                        (this.value == $_other[0].value)  ?  ['√', 'green']  :  ['×', 'red']
                    );

                    _Complete_ = 0;
                } else
                    showHint.call($_this, '√', 'green');
            });
        });

        return this;
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

    $.fn.checkAll = function ($_forAll, onChange) {
        if (typeof $_forAll == 'function') {
            onChange = $_forAll;
            $_forAll = '';
        }

        return  this.each(function () {
            var $_This = $(this);

            var iAll = $_forAll ?
                    $_This.find( $_forAll )[0]  :
                    $('input[type="checkbox"]', this)[0];

            $_This.on('change',  'input[type="checkbox"]',  function () {
                var $_All = $_This.find('input[type="checkbox"]').not(iAll);

                if (this === iAll)
                    $_All.prop('checked', this.checked);
                else
                    iAll.checked = (! $_All.not(':checked')[0]);

                if (typeof onChange == 'function')
                    onChange.apply($_This[0], [
                        arguments[0],
                        $.map($_All.filter(':checked'),  function () {
                            return arguments[0].value;
                        })
                    ]);
            });
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 表单对话框  v0.1 ---------- */

    var $_BOM = $(self);

    function show() {
        return this.css({
            opacity:    1,
            left:
                ($_BOM.width()  -  parseFloat( this.css('width') ))  /  2,
            top:
                ($_BOM.height()  -  parseFloat( this.css('height') ))  /  2
        });
    }

    function close() {
        var $_This = this.css({
                opacity:    0,
                left:       0,
                top:        0
            });

        return  new Promise(function (iResolve) {

            $.wait(parseFloat( $_This.css('transition-duration') ),  function () {

                iResolve(! $_This.hide());
            });
        });
    }

    $.fn.formDialog = function () {

        var $_This = this.show();

        return  new Promise(function (iResolve) {

            show.call( $_This ).submit(function () {

                close.call( $_This ).then(function () {

                    iResolve($.paramJSON('?' + $_This.serialize()));
                });
            }).on('reset',  function () {

                close.call( $_This ).then( iResolve );

            }).on('keyup',  function (iEvent) {
                if (
                    (iEvent.type == 'keyup')  &&
                    (iEvent.which == 27)  &&
                    (! $.expr[':'].field( iEvent.target ))
                )
                    $(this).trigger('reset')[0].reset();
            });
        });
    };
})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 面板控件  v0.1 ---------- */

    $.fn.iPanel = function () {
        var $_This = this.is('.Panel') ? this : this.find('.Panel');

        return  $_This.each(function () {
            var $_Body = $(this).children('.Body');

            if (! ($_Body.length && $_Body.height()))
                $(this).addClass('closed');
        }).children('.Head').dblclick(function () {
            var $_Head = $(this);
            var $_Panel = $_Head.parent();

            var $_Head_Height = parseFloat( $_Head.css('height') )
                    + parseFloat( $_Head.css('margin-top') )
                    + parseFloat( $_Head.css('margin-bottom') )
                    + parseFloat( $_Panel.css('padding-top') ) * 2;

            if (! $_Panel.hasClass('closed')) {
                $_Panel.data('height', $_Panel.height());
                $_Panel.stop().animate({height:  $_Head_Height});
                $_Panel.addClass('closed');
            } else {
                $_Panel.stop().animate({height:  $_Panel.data('height')});
                $_Panel.removeClass('closed');
            }
        });
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 滚动悬停  v0.2 ---------- */

    var $_BOM = $(BOM),  $_DOM = $(DOM),  Fixed_List = [ ];

    function Scroll_Fixed() {
        this.$_View = $( arguments[0] );
        this.onChange = arguments[1];

        this.$_Shim = $( this.$_View[0].outerHTML ).css('opacity', 0);
        this.offset = this.$_View.offset();
    }

    Scroll_Fixed.limitMap = {
        width:     ['left', 'Left'],
        height:    ['top', 'Top']
    };

    $.extend(Scroll_Fixed.prototype, {
        getLimit:    function () {
            var LM = this.constructor.limitMap,  iLimit = { };

            for (var iKey in LM)
                iLimit['max-' + iKey] = $_BOM[iKey]()
                    - (
                        this.$_View.offset()[ LM[iKey][0] ]  -
                        $_DOM['scroll' + LM[iKey][1]]()
                    )
                    - ($_DOM[iKey]() - (
                        this.offset[ LM[iKey][0] ]  +
                        parseFloat( this.$_Shim.css( iKey ) )
                    ));

            return iLimit;
        },
        render:      function () {
            this.$_View.css({
                position:     'fixed',
                top:          0,
                'z-index':    100
            }).after( this.$_Shim ).css( this.getLimit() );

            if (this.onChange)  this.onChange.call(this.$_View[0], 'fixed');

            return this;
        },
        destroy:     function () {
            this.$_View.css({
                position:        'static',
                'max-width':     'auto',
                'max-height':    'auto'
            });

            if (this.onChange)  this.onChange.call(this.$_View[0], 'static');

            this.$_Shim.remove();

            return this;
        },
        toggleAt:    function (Scroll_Top) {
            var iPosition = this.$_View.css('position');

            if (Scroll_Top < this.offset.top) {

                if (iPosition != 'static')  this.destroy();

            } else if (iPosition != 'fixed')  this.render();

            return this;
        }
    });

    $_DOM.scroll(function () {
        var iOffset = $_DOM.scrollTop();

        for (var i = 0;  Fixed_List[i];  i++)
            Fixed_List[i].toggleAt( iOffset );
    });

    $.fn.scrollFixed = function (iCallback) {

        iCallback = (typeof iCallback == 'function')  &&  iCallback;

        $.merge(Fixed_List,  $.map(this,  function () {

            return  new Scroll_Fixed(arguments[0], iCallback);
        }));

        return this;
    };

})(self,  self.document,  self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

/* ---------- 元素禁止选中  v0.1 ---------- */

    $.fn.noSelect = function () {
        return  this.attr('unSelectable', 'on').addClass('No_Select')
                .bind('selectStart', false).bind('contextmenu', false);
    };

})(self,  self.document,  self.jQuery || self.Zepto);


//
//          >>>  EasyWebUI Component Library  <<<
//
//
//      [Version]     v1.6  (2017-06-06)  Stable
//
//      [Based on]    iQuery v2  or  jQuery (with jQueryKit)
//
//      [Usage]       A jQuery Plugin Library which almost
//                    isn't dependent on EasyWebUI.css
//
//
//            (C)2014-2017    shiy2008@gmail.com
//

/* ---------- 首屏渲染 自动启用组件集 ---------- */


(function (BOM, DOM, $) {

    var $_DOM = $(DOM);

    $_DOM.ready(function () {

        $('form').pwConfirm();

        $('form input[type="range"]').Range();

        $('.Panel').iPanel();

        $('*:button,  a.Button,  .No_Select,  .Panel > .Head,  .Tab > label')
            .noSelect();
    });

    if ($.browser.msie < 11)  return;

    $_DOM.on(
        [
            'mousedown', 'mousemove', 'mouseup',
            'click', 'dblclick', 'mousewheel',
            'touchstart', 'touchmove', 'touchend', 'touchcancel',
            'tap', 'press', 'swipe'
        ].join(' '),
        '.No_Pointer',
        function (iEvent) {
            if (iEvent.target !== this)  return;

            var $_This = $(this).hide(),
                $_Under = $(DOM.elementFromPoint(iEvent.pageX, iEvent.pageY));
            $_This.show();
            $_Under.trigger(iEvent);
        }
    );
})(self,  self.document,  self.jQuery || self.Zepto);


});
