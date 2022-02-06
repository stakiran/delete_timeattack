'use strict';

const LINEBREAK = '\n';

function arraylineToString(a){
    return a.join(LINEBREAK)
}

function arraystrToString(a){
    // 何も指定しないと , になるので明示的に空文字指定が必要
    return a.join('')
}

function getRandomNumber0toX(x) {
    const min = 0
    const max = Math.floor(x)
    return Math.floor(Math.random() * (max - min)) + min
}

// pureCharで構成された文字列に、n個分のdirtyCharを挿入する。
// 実際は（string は immtable なので）挿入後の文字列を返す。
function getInsertedString_RandomlyNtimes(beforestr, n, dirtyChar) {
    const afterLength = beforestr.length + n
    const pureChar = beforestr.charAt(0)

    // 計9個、3個挿入したいとする
    // oooooo
    // xxx
    //
    // ooooooxxx まずは全連結時の長さを計算して、
    // [0, 1, 2, ..., 8] 各位置から成る配列をつくって、
    // この配列から一つランダムに取り除くことで、ランダムな挿入位置を計算する
    // why?
    //   このように「取り除く対象から "すでに採用した位置" を消す」処理をしないと
    //   同じ位置に再度挿入するみたいな重複が起こるから.

    let selectee = new Array(afterLength)
    for(var i=0; i<selectee.length; i++){
        selectee[i] = i
    }
    const inserteePositions = [];
    for(var i=0; i<n; i++){
        const indexOfInserteePos = getRandomNumber0toX(selectee.length)
        const inserteePos = selectee.splice(indexOfInserteePos, 1)
        inserteePositions.push(inserteePos);
    }

    let afterstrByList = []
    for(var i=0; i<afterLength; i++){
        afterstrByList[i] = pureChar
    }
    for(var i=0; i<n; i++){
        const inserteePos = inserteePositions[i]
        afterstrByList[inserteePos] = dirtyChar
    }
    const afterstr = arraystrToString(afterstrByList)
    return afterstr
}

class Datetime {
    constructor(){
        this._init()
    }

    _init(){
        // 以前の検証で now() は JST のはずだが、まだ自信ない……
        const msecJST = Date.now()
        const dateJST = new Date(msecJST)
        this._dateJST = dateJST
    }

    get _rawObject(){
        return this._dateJST
    }

    get day(){
        const day = this._dateJST.getDate()
        return day
    }

    get dowJP(){
        const downum = this._dateJST.getDay()
        const dowTable = ['日', '月', '火', '水', '木', '金', '土']
        const dow = dowTable[downum]
        return dow
    }

    getDiffByMilliSeconds(datetimeObj){
        const msec = datetimeObj._rawObject - this._dateJST
        return msec
    }
}

class Questioner {
    constructor(xSize, ySize, targetCountPerLine) {
        this._xSize = xSize;
        this._ySize = ySize;
        this._targetCountPerLine = targetCountPerLine;

        this.PURE = '□';
        this.DIRTY = '■'

        this.clear()
    }

    create(){
        const dirtyCount = this._targetCountPerLine
        const pureSize = this._xSize - dirtyCount

        const pureLine = this.PURE.repeat(pureSize)
        for(var i=0; i<pureSize; i++){
            const line = getInsertedString_RandomlyNtimes(pureLine, dirtyCount, this.DIRTY)
            this._lines.push(line);
        }
    }

    clear(){
        this._lines = [];
    }

    get lines(){
        return this._lines
    }

    get linesByStr(){
        return arraylineToString(this._lines)
    }

}

$(function() {
    $('#battleField').val(''); // reload 時でも確実にクリアしたい

    const XSIZE = 10
    const YSIZE = 5
    const TARGET_COUNT_PER_LINE = 3
    const questioner = new Questioner(XSIZE, YSIZE, TARGET_COUNT_PER_LINE)

    questioner.create()
    $('#battleField').val(questioner.linesByStr);

    const dt1 = new Datetime()

    $('#battleField').keyup(function(e){
        const event = e
        console.log(`keyup ${event.keyCode}`)
        const dt2 = new Datetime()
        console.log(dt1.getDiffByMilliSeconds(dt2))
    });

    $('#battleField').keydown(function(e){
        const event = e
        console.log(`keydown ${event.keyCode}`)
    });

});
