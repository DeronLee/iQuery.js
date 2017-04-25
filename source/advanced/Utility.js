define(['jquery'],  function ($) {

    var BOM = self;

/* ---------- Bit Operation for Big Number  v0.1 ---------- */

    function Bit_Calculate(iType, iLeft, iRight) {
        iLeft = parseInt(iLeft, 2);
        iRight = parseInt(iRight, 2);

        switch (iType) {
            case '&':    return  iLeft & iRight;
            case '|':    return  iLeft | iRight;
            case '^':    return  iLeft ^ iRight;
            case '~':    return  ~iLeft;
        }
    }

    $.bitOperate = function (iType, iLeft, iRight) {

        iLeft = (typeof iLeft == 'string')  ?  iLeft  :  iLeft.toString(2);
        iRight = (typeof iRight == 'string')  ?  iRight  :  iRight.toString(2);

        var iLength = Math.max(iLeft.length, iRight.length);

        if (iLength < 32)
            return  Bit_Calculate(iType, iLeft, iRight).toString(2);

        iLeft = $.leftPad(iLeft, iLength, 0);
        iRight = $.leftPad(iRight, iLength, 0);

        var iResult = '';

        for (var i = 0;  i < iLength;  i += 31)
            iResult += $.leftPad(
                Bit_Calculate(
                    iType,  iLeft.slice(i, i + 31),  iRight.slice(i, i + 31)
                ).toString(2),
                Math.min(31,  iLength - i),
                0
            );

        return iResult;
    };

/* ---------- Local Storage Wrapper  v0.1 ---------- */

    var LS_Key = [ ];

    $.storage = function (iName, iData) {

        if (! (iData != null))  return  JSON.parse(BOM.localStorage[ iName ]);

        var iLast = 0,  iLength = Math.min(LS_Key.length, BOM.localStorage.length);

        do  try {
            BOM.localStorage[ iName ] = JSON.stringify( iData );

            if (LS_Key.indexOf( iName )  ==  -1)  LS_Key.push( iName );
            break;
        } catch (iError) {
            if (LS_Key[ iLast ]) {
                delete  BOM.localStorage[ LS_Key[iLast] ];

                LS_Key.splice(iLast, 1);
            } else
                iLast++ ;
        } while (iLast < iLength);

        return iData;
    };

/* ---------- URL Parameter Signature  v0.1 ---------- */

    function JSON_Sign(iData) {

        return  '{'  +  $.map(Object.keys( iData ).sort(),  function (iKey) {

            return  '"'  +  iKey  +  '":'  +  JSON.stringify( iData[iKey] );

        }).join()  +  '}';
    }

    $.paramSign = function (iData) {

        iData = (typeof iData == 'string')  ?  this.paramJSON( iData )  :  iData;

        return  $.map(Object.keys( iData ).sort(),  function (iKey) {

            var _Data_ = iData[iKey];

            switch ( true ) {
                case (_Data_ instanceof Function):
                    return;
                case $.likeArray(_Data_):
                    _Data_ = '['  +  $.map(_Data_, JSON_Sign).join()  +  ']';
                    break;
                case (typeof _Data_ == 'object'):
                    _Data_ = JSON_Sign(_Data_);
            }

            return  iKey + '=' + _Data_;

        }).join(arguments[1] || '&');
    };

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {
        if (arguments.length == 1) {
            iString = iType.match(/^data:([^;]+);base64,(.+)/);
            iType = iString[1];
            iString = iString[2];
        }
        iString = BOM.atob( iString );

        var iBuffer = new ArrayBuffer( iString.length );
        var uBuffer = new Uint8Array( iBuffer );

        for (var i = 0;  iString[i];  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();
        iBuilder.append( iBuffer );

        return  iBuilder.getBlob( iType );
    };

/* ---------- CRC-32  v0.1 ---------- */

//  Thanks "Bakasen" for http://blog.csdn.net/bakasen/article/details/6043797

    var CRC_32_Table = (function () {
            var iTable = new Array(256);

            for (var i = 0, iCell;  i < 256;  i++) {
                iCell = i;

                for (var j = 0;  j < 8;  j++)
                    if (iCell & 1)
                        iCell = ((iCell >> 1) & 0x7FFFFFFF)  ^  0xEDB88320;
                    else
                        iCell = (iCell >> 1)  &  0x7FFFFFFF;

                iTable[i] = iCell;
            }

            return iTable;
        })();

    function CRC_32(iRAW) {
        iRAW = '' + iRAW;

        var iValue = 0xFFFFFFFF;

        for (var i = 0;  iRAW[i];  i++)
            iValue = ((iValue >> 8) & 0x00FFFFFF)  ^  CRC_32_Table[
                (iValue & 0xFF)  ^  iRAW.charCodeAt(i)
            ];

        return  iValue ^ 0xFFFFFFFF;
    }

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),  iResult = '';

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);

            iResult += ((iTemp.length == 8) ? '' : 0)  +  iTemp;
        }

        return iResult;
    }

    $.dataHash = function (iAlgorithm, iData) {
        if (arguments.length < 2) {
            iData = iAlgorithm;
            iAlgorithm = 'CRC-32';
        }

        if (iAlgorithm == 'CRC-32')
            return  Promise.resolve(CRC_32( iData ));

        var iCrypto = BOM.crypto || BOM.msCrypto;

        try {
            var iPromise = (iCrypto.subtle || iCrypto.webkitSubtle).digest(
                    {name:  iAlgorithm},
                    new Uint8Array(
                        Array.prototype.map.call(String( iData ),  function () {

                            return arguments[0].charCodeAt(0);
                        })
                    )
                );
            return  ((typeof iPromise.then == 'function')  ?
                iPromise  :  new Promise(function (iResolve) {

                    iPromise.oncomplete = function () {
                        iResolve( arguments[0].target.result );
                    };
                })
            ).then( BufferToString );

        } catch (iError) {
            return  Promise.reject( iError );
        }
    };
});