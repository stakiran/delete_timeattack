'use strict';

const LINEBREAK = '\n';

function arrayToString(a){
    return a.join(LINEBREAK)
}

function getRandomNumber0toX(x) {
    min = 0
    max = Math.floor(x)
    return Math.floor(Math.random() * (max - min)) + min
}

class Questioner {
    constructor(xSize, ySize, targetCountPerLine) {
        this._xSize = xSize;
        this._ySize = ySize;
        this._targetCountPerLine = targetCountPerLine;

        this.NT = '□';
        this.T = '■'

        this.clear()
    }

    create(){
        const pureSize = this._xSize - this._targetCountPerLine

        const pureLine = this.NT.repeat(pureSize)
        for(var i=0; i<pureSize; i++){
            this._lines.push(pureLine);
        }
    }

    clear(){
        this._lines = [];
    }

    get lines(){
        return this._lines
    }

    get linesByStr(){
        return arrayToString(this._lines)
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

    $('#battleField').keyup(function(e){
        const event = e
        console.log(`keyup ${event.keyCode}`)
    });

    $('#battleField').keydown(function(e){
        const event = e
        console.log(`keydown ${event.keyCode}`)
    });

});
