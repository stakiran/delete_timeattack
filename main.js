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
        this.clear()

        const dirtyCount = this._targetCountPerLine
        const pureSize = this._xSize - dirtyCount

        // Delete一回で始めたいので空行にする。
        // コピペ用□は各自コピーしておけ、でいい。
        //const startLine = `${this.PURE}`
        const BLANKLINE = ''
        const startLine = BLANKLINE
        this._lines.push(startLine);

        const pureLine = this.PURE.repeat(pureSize)
        for(var i=0; i<this._ySize; i++){
            const line = getInsertedString_RandomlyNtimes(pureLine, dirtyCount, this.DIRTY)
            this._lines.push(line);
        }
    }

    judge(actualByString){
        const dirtyCount = this._targetCountPerLine
        const pureSize = this._xSize - dirtyCount
        const pureLine = this.PURE.repeat(pureSize)
        let pureLines = []
        for(var i=0; i<this._ySize; i++){
            pureLines.push(pureLine);
        }
        const expectByString = arraylineToString(pureLines)

        console.log('Expect')
        console.log(expectByString)
        console.log('Actual')
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

    addObservers(questioner, field, timerview, penaltyview, message){
        this._questioner = questioner
        this._fieldview = field
        this._timerview = timerview
        this._penaltyview = penaltyview
        this._messageview = message
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
        this._update()
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
        this._update()
        return true
    }

    ready(){
        // 問題シャッフルができるので常にreadyが発動するようにしてみる。
        //if(this.isNotStarted){
        //    return false
        //}
        this._state = GameMaster.NOT_STARTED
        this._update()
        return true
    }

    fail(){
        if(!this.isStarting){
            return false
        }
        this._state = GameMaster.STOPPED

        // 本当は状態 FAILED 作って _update() で統一すべきなんだろうがー……
        this._onCheat()
    }

    addPenalty(){
        this._penaltyview.plus()
        this._penaltyview.display()
    }

    _update(){
        if(this.isStarting){
            this._onStart()
            return
        }

        if(this.isStopped){
            this._onStop()
            return
        }

        if(this.isNotStarted){
            this._onReady()
            return
        }
    }

    _onReady(){
        const questioner = this._questioner
        const field = this._fieldview
        const message = this._messageview
        const timerview = this._timerview
        const penaltyview = this._penaltyview

        questioner.create()

        field.reload(questioner.linesByStr)
        field.moveCursorToTop()

        timerview.reset()
        message.clear()
        penaltyview.clear()
    }

    _onStart(){
        const timerview = this._timerview
        timerview.start()
    }

    _onStop(){
        const questioner = this._questioner
        const field = this._fieldview
        const timerview = this._timerview

        const fieldValue = field.value
        const isCorrect = questioner.judge(fieldValue)
        if(!isCorrect){
            this.addPenalty()
            // 状態変える場所をこうやって無闇に追加するの、不吉な臭い……
            this._state = GameMaster.STARTING
            return
        }
        timerview.stop()
    }

    _onCheat(){
        const timerview = this._timerview
        const message = this._messageview

        timerview.stop()
        message.display('失格！')
    }

}

class Field{
    constructor(selectorId, xSizeByCols, ySizeByRows){
        this._selector = selectorId

        // - textare がデフォで余剰を確保してくれるので不要
        // - 全角文字は1文字で2文字分
        this._xSizeByCols = xSizeByCols*2
        // 「スタート地点の空行」と last blank line を確保
        this._ySizeByRows = ySizeByRows + 2

        this._adjustSize()
    }

    clear(){
        const empty = ''
        this.reload(empty)
    }

    reload(s){
        $(this._selector).val(s);
    }

    _adjustSize(){
        $(this._selector)
            .attr('cols', this._xSizeByCols)
            .attr('rows', this._ySizeByRows);
    }

    focusMe(){
        $(this._selector).focus();
    }

    moveCursorToTop(){
        const jq = $(this._selector);
        const dom = jq[0];
        const topX = 0;
        const topY = 0;
        dom.setSelectionRange(topX, topY);
    }

    get value(){
        return $(this._selector).val();
    }
}

class MessageDisplay {
    constructor(selector) {
        this._selector = selector
    }

    clear(msg){
        $(this._selector).text('')
    }

    display(msg){
        $(this._selector).text(msg)
    }
}

class Counter {
    constructor() {
        this.clear()
    }

    plus(){
        this._count += 1
    }

    clear(){
        this._count = 0
    }

    get count(){
        return this._count
    }
}

class PenaltyView {
    constructor(selector) {
        this._selector = selector
        this._counter = new Counter()

        this.clear()
    }

    clear(){
        $(this._selector).text('')
        this._counter.clear()
    }

    plus(){
        this._counter.plus()
    }

    display(){
        const count = this._counter.count
        if(count==0){
            // カウンターは減算することがないので clear は不要。
            // ここに来る時は常に「まだ増えたことがない」とき。
            return
        }
        const penaltyMark = '❌'
        const display = penaltyMark.repeat(count)
        $(this._selector).text(display)
    }
}

class URLParameter{
    // @param queryString とりあえずlocation.searchを想定。
    constructor(queryString){
        this._dict = {}
        this._raw = queryString;
        if(this._raw==''){
            return
        }

        const withoutQuestion = queryString.substring(1);
        const parameters = withoutQuestion.split('&');
        for(var i=0;i<parameters.length;i++){
            const kvs = parameters[i].split('=');
            const key = kvs[0];
            const value = kvs[1];
            this._dict[key] = value;
        }
    }

    _getAsInterger(key, defaultValue){
        const isIn = key in this._dict
        const isNotIn = !isIn
        if(isNotIn){
            return defaultValue
        }
        const value = parseInt(this._dict[key])
        return value
    }

    get xSize(){
        const KEY = 'x'
        const DEFAULT = 10
        return this._getAsInterger(KEY, DEFAULT)
    }

    get ySize(){
        const KEY = 'y'
        const DEFAULT = 7
        return this._getAsInterger(KEY, DEFAULT)
    }

    get dirtyCount(){
        const KEY = 'd'
        const DEFAULT = 3
        return this._getAsInterger(KEY, DEFAULT)
    }

    printAll(){
        for(const [k, v] of Object.entries(this._dict)){
            console.log(`${k}=${v}`)
        }
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
    const rawQueryString = window.location.search;
    const options = new URLParameter(rawQueryString);
  
    const SELECTOR_FIELD = '#battleField'
    const SELECTOR_TIMER = '#timerArea'
    const SELECTOR_MESSAGE = '#messageArea'
    const SELECTOR_PENALTY = '#penaltyArea'

    const XSIZE = options.xSize
    const YSIZE = options.ySize
    const TARGET_COUNT_PER_LINE = options.dirtyCount
    const questioner = new Questioner(XSIZE, YSIZE, TARGET_COUNT_PER_LINE)

    const field = new Field(SELECTOR_FIELD, XSIZE, YSIZE)

    const message = new MessageDisplay(SELECTOR_MESSAGE)

    const penaltyView = new PenaltyView(SELECTOR_PENALTY)

    const DISPLAY_INTERVAL_MILLISECONDS = 20
    const timerview = new TimerView(SELECTOR_TIMER, DISPLAY_INTERVAL_MILLISECONDS)

    questioner.create()
    field.reload(questioner.linesByStr)
    field.focusMe()
    field.moveCursorToTop()
    timerview.reset()
    message.clear()

    const GM = new GameMaster()
    GM.addObservers(
        questioner,
        field,
        timerview,
        penaltyView,
        message
    )

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
            GM.start()
            return
        }

        if(kc == K.ESC){
            GM.ready()
            return
        }

        if(kc == K.SPACE){
            GM.stop()
            return
        }

        if(kc == K.CTRL){
            return
        }
        if(kc == K.V){
            GM.addPenalty()
            return
        }
        if(kc == K.SHIFT){
            return
        }
        if(kc == K.X){
            return
        }

        console.log(`keycode:${kc}`)
        GM.fail()
    });

});
