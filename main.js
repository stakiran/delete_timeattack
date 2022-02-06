'use strict';

const LINEBREAK = '\n';

function arraylineToString(a){
    return a.join(LINEBREAK)
}

function arraystrToString(a){
    // 何も指定しないと , になるので明示的に空文字指定が必要
    return a.join('')
}

function stringToArray(s){
    return s.split("\n")
}

function equalArrayXandArrayY(x, y){
    const stringX = JSON.stringify(x)
    const stringY = JSON.stringify(y)
    return stringX===stringY
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

class Timer {
    constructor() {}

    _getNowObject(){
        const msecJST = Date.now()
        const dateJST = new Date(msecJST)
        return dateJST
    }

    start(){
        this._dateJST_at_starting = this._getNowObject()
    }

    see(){
        this._dateJST_at_current = this._getNowObject()
        const msec = this._dateJST_at_current- this._dateJST_at_starting
        return msec
    }
}

class TimerView {
    static DEFAUT_DISPLAY = '0:00:00'

    constructor(selectorId_TimerDisplay, displayIntervalMsec) {
        this._timer = new Timer()
        this._selector = selectorId_TimerDisplay
        this._intervalMsec = displayIntervalMsec

        const DUMMY = 0
        this._intervalId = DUMMY
    }

    updateDisplay(s){
        $(this._selector).text(s)
    }

    reset(){
        this.stop()

        this.updateDisplay(TimerView.DEFAUT_DISPLAY)
    }

    _convertToDisplayTime(mSec){
        const min = Math.trunc(mSec/60000)
        const sec = Math.trunc(mSec/1000)
        const milliSec = Math.trunc(mSec - sec*1000)

        const dm = min.toString()
        const ds = sec.toString().padStart(2, '0')
        const dms = milliSec.toString().padStart(3, '0')
        const displayText = `${dm}:${ds}:${dms}`
        return displayText
    }

    start(){
        this._timer.start()

        const id = setInterval(() => {
            const passingByMsec = this._timer.see()
            const passingByText = this._convertToDisplayTime(passingByMsec)
            this.updateDisplay(passingByText)
        }, this._intervalMsec)
        this._intervalId = id
    }

    stop(){
        clearInterval(this._intervalId)
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

        const startLine = `${this.PURE}`
        this._lines.push(startLine);

        const pureLine = this.PURE.repeat(pureSize)
        for(var i=0; i<pureSize; i++){
            const line = getInsertedString_RandomlyNtimes(pureLine, dirtyCount, this.DIRTY)
            this._lines.push(line);
        }
    }

    judge(actualByString){
        const dirtyCount = this._targetCountPerLine
        const pureSize = this._xSize - dirtyCount
        const pureLine = this.PURE.repeat(pureSize)
        let pureLines = []
        for(var i=0; i<pureSize; i++){
            pureLines.push(pureLine);
        }
        const expectByString = arraylineToString(pureLines)

        console.log(expectByString)
        console.log(actualByString)

        const result = equalArrayXandArrayY(expectByString, actualByString)
        return result
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

class GameMaster{
    static NOT_STARTED = 'ゲーム開始前の状態(READY状態ともいう)'
    static STARTING = 'ゲーム開始中'
    static STOPPED = 'ゲーム終了して結果出てる'

    constructor(){
        this._state = GameMaster.NOT_STARTED
    }

    get state(){
        return this._state
    }

    get isNotStarted(){
        return this._state == GameMaster.NOT_STARTED
    }
    get isStarting(){
        return this._state == GameMaster.STARTING
    }
    get isStopped(){
        return this._state == GameMaster.STOPPED
    }

    start(){
        if(this.isStarting){
            return false
        }
        if(this.isStopped){
            return false
        }
        this._state = GameMaster.STARTING
        return true
    }

    stop(){
        if(this.isNotStarted){
            return false
        }
        if(this.isStopped){
            return false
        }
        this._state = GameMaster.STOPPED
        return true
    }

    ready(){
        if(this.isNotStarted){
            return false
        }
        this._state = GameMaster.NOT_STARTED
        return true
    }

    onRaedy(){
        // フィールドの初期設定
        // タイマーのリセット
    }

    onStart(){
        // タイマーの開始
    }

    onStop(){
        // 判定
    }
}

class Field{
    constructor(selectorId){
        this._selector = selectorId
    }

    clear(){
        const empty = ''
        this.reload(empty)
    }

    reload(s){
        $(this._selector).val(s);
    }

    get value(){
        return $(this._selector).val();
    }
}

const K = {
    'BACKSPACE' : 8,
    'SHIFT'     : 16,
    'CTRL'      : 17,
    'ESC'       : 27,
    'SPACE'     : 32,
    "LEFT"      : 37,
    "UP"        : 38,
    "RIGHT"     : 39,
    "DOWN"      : 40,
    "CURSOR_"   : 37,
    "_CURSOR"   : 40,
    'DELETE'    : 46,
    'V'         : 86,
    'X'         : 88,
};

$(function() {
    const SELECTOR_FIELD = '#battleField'
    const SELECTOR_TIMER = '#timerArea'

    const field = new Field(SELECTOR_FIELD)

    const DISPLAY_INTERVAL_MILLISECONDS = 20
    const timerview = new TimerView(SELECTOR_TIMER, DISPLAY_INTERVAL_MILLISECONDS)

    const XSIZE = 10
    const YSIZE = 5
    const TARGET_COUNT_PER_LINE = 3
    const questioner = new Questioner(XSIZE, YSIZE, TARGET_COUNT_PER_LINE)
    questioner.create()
    field.reload(questioner.linesByStr)

    const GM = new GameMaster()

    $(SELECTOR_FIELD).keydown(function(e){
        const event = e
        const kc = event.keyCode

        // stop 操作で使いたいが、文字入力入ると判定乱れるのでロックする。
        if(kc == K.SPACE){
            event.preventDefault()
        }
    })

    $(SELECTOR_FIELD).keyup(function(e){
        const event = e
        const kc = event.keyCode
        
        if(K.CURSOR_ <= kc && kc <= K._CURSOR){
            return
        }

        if(kc == K.DELETE){
            const b = GM.start()
            if(!b){
                return
            }
            console.log('Deleteキーでゲーム開始')
            timerview.start()
            return
        }

        if(kc == K.ESC){
            const b = GM.ready()
            if(!b){
                return
            }
            console.log('Readyに戻りました')
            timerview.reset()
            return
        }

        if(kc == K.SPACE){
            console.log('stop判定入ります')

            const fieldValue = field.value
            const isCorrect = questioner.judge(fieldValue)
            if(!isCorrect){
                console.log('合ってないのでまだ続きます')
                return
            }

            console.log('合ってるのでstopします')
            timerview.stop()
            return
        }

        if(kc == K.CTRL){
            return
        }
        if(kc == K.V){
            return
        }
        if(kc == K.SHIFT){
            return
        }
        if(kc == K.X){
            return
        }

        console.log(`Booooo!: kc = ${kc}`)
    });

});
