'use strict';

class SlotManager {
    constructor() {
        const invalidIndex = -1;

        this._slots = [];
        this._currentIndex = invalidIndex;
    }

    addSlot(slotInstance) {
        this._slots.push(slotInstance)
    }

    select(idx) {
        if(idx < 0){
            throw new Error('[SlotManager] slot index invalid: too small.');
        }
        if(this._slots.length <= idx){
            throw new Error('[SlotManager] slot index invalid: too large.');
        }
        this._currentIndex = idx;
        this._changeSelectedStatus();
    }

    _getTargetSlot(){
        return this._slots[this._currentIndex];
    }

    _changeSelectedStatus(){
        for(let slot of this._slots){
            slot.youAreNotSelected();
        }
        let slot = this._getTargetSlot();
        slot.youAreSelected();
    }

    set(cardName) {
        let slot = this._getTargetSlot()
        slot.set(cardName);
    }

    toggleLockAndUnlock(idx){
        // idx を渡してもらう理由:
        // 追加対象スロットとロック対象スロットは分けた方が使いやすいから.
        let slot = this._slots[idx];
        slot.toggleLockAndUnlock();
    }

    toggleLockAndUnlockToSelected(){
        let slot = this._getTargetSlot();
        slot.toggleLockAndUnlock();
    }

    clear(){
        const emptyName = '';
        this.set(emptyName);
    }

    reset(){
        for(let slot of this._slots){
            slot.clear();
        }
    }
}

class Slot {
    constructor(selectorName) {
        this._selectorName = selectorName
        this._cardName = '';
        this._isLocked = false;
    }

    clear(){
        this._erase();
        this._unlock();
        this.youAreNotSelected();
        this._cardName = '';
    }

    set(cardName) {
        if(this._isLocked == true){
            return;
        }
        this._cardName = cardName;
        this._write();
    }

    toggleLockAndUnlock() {
        if(this._isLocked == true){
            this._unlock();
            return;
        }
        this._lock();
    }

    youAreSelected(){
        $(this._selectorName).addClass('selected-slot');
    }

    youAreNotSelected(){
        $(this._selectorName).removeClass('selected-slot');
    }

    _lock(){
        this._isLocked = true;
        $(this._selectorName).addClass('locked-slot');
    }

    _unlock(){
        this._isLocked = false;
        $(this._selectorName).removeClass('locked-slot');
    }

    _write(){
        const cardName = this._cardName;
        this._erase();
        $(this._selectorName).html(`<p class="card-description">${cardName}</p>`);
    }

    _erase(){
        $(this._selectorName).html('');
    }
}

class CardDisplay {
    constructor(selectorNameExpressedUL) {
        this._selectorName = selectorNameExpressedUL;
        this._cardNames = [];
    }

    clear() {
        $(`${this._selectorName} > li`).remove();
        this._cardNames = [];
    }

    add(cardName) {
        $(`${this._selectorName}`).append(`<li class="card">${cardName}</li>`)
        this._cardNames.push(cardName);
    }
}

const LINEBREAK = '\n';
const K = {
    'BACKSPACE' : 8,
    'ESC'       : 27,
    'SPACE'     : 32,
    'LEFT'      : 37,
    'UP'        : 38,
    'RIGHT'     : 39,
    'DOWN'      : 40,
    'DELETE'    : 8,
    'N1'        : 49,
    'N2'        : 50,
    'N3'        : 51,
    'E'         : 69,
    'L'         : 76,
    'Q'         : 81,
    'W'         : 87,
};
let stickflags = {};

function isInTextarea(){
    let focusedElem = $(':focus');
    const id = focusedElem.attr('id');
    return id == 'cardEditor';
}

function selectNextCard(slotManager){
    const selectedCardClassName = 'selected-card';
    let curElement = $(`.${selectedCardClassName}`);
    let nextElement = curElement.next();
    if(nextElement.length == 0){
        nextElement = $('.card').eq(0);
    }

    let cardName = nextElement.text();
    curElement.removeClass(selectedCardClassName);
    nextElement.addClass(selectedCardClassName);
    slotManager.set(cardName);
}

function selectPrevCard(slotManager){
    const selectedCardClassName = 'selected-card';
    let curElement = $(`.${selectedCardClassName}`);
    let prevElement = curElement.prev();
    if(prevElement.length == 0){
        prevElement = $('.card:last');
    }

    let cardName = prevElement.text();
    curElement.removeClass(selectedCardClassName);
    prevElement.addClass(selectedCardClassName);
    slotManager.set(cardName);
}

$(function() {
    let cardDisplay = new CardDisplay('#cardContainer');
    let slot1 = new Slot('#slot1');
    let slot2 = new Slot('#slot2');
    let slot3 = new Slot('#slot3');

    let slotManager = new SlotManager();
    const defaultSlotIndex = 0;
    slotManager.addSlot(slot1);
    slotManager.addSlot(slot2);
    slotManager.addSlot(slot3);
    slotManager.select(defaultSlotIndex);

    $('#cardEditor').val(''); // reload 時でも確実にクリアしたい

    $('#cardEditor').change(function(){
        let listByStr = $(this).val();
        let listByArray = listByStr.split(LINEBREAK);

        cardDisplay.clear();
        for(const cardName of listByArray) {
            if(cardName.trim() == ''){
                continue;
            }
            cardDisplay.add(cardName);
        }
    });

    $('#slotContainer').on('click', '.slot', function(){
        const idx = $('#slotContainer > .slot').index(this);
        slotManager.select(idx);
    });

    $('#slotContainer').on('contextmenu', '.slot', function(){
        const idx = $('#slotContainer > .slot').index(this);
        slotManager.toggleLockAndUnlock(idx);
        return false; // disable default context menu because noisy visibly.
    });

    // - click よりも hover が使いやすいので hover にする.
    // - on 時は hover() が使えないので mouseenter イベントで代用する.
    $('#cardContainer').on('mouseenter', '.card', function(){
        // キーボードによる選択が残っていることがあるので確実に消す.
        $('.card').removeClass('selected-card');

        let card = $(this);
        const idx = $('#cardContainer > .card').index(this);
        let cardName = card.text();

        slotManager.set(cardName);

        card.addClass('selected-card');
    }).on('mouseleave', '.card', function(){
        let card = $(this);
        card.removeClass('selected-card');
    });

    // キーボードイベント検出のポイント
    // - 押しっぱによる連続検出を防ぐため, down/up の両方のタイミング + フラグで頑張ってる
    // - テキストエリア内で発動するとノイジーなので発動させない.
    $('body').keydown(function(e){
        if(isInTextarea()){
            return;
        }
        var keycode = e.keyCode;
        if(keycode==K.N1){
            if(!('n1' in stickflags)){
                stickflags['n1'] = '';
                slotManager.select(0);
            }
            e.preventDefault();
        }
        if(keycode==K.N2){
            if(!('n2' in stickflags)){
                stickflags['n2'] = '';
                slotManager.select(1);
            }
            e.preventDefault();
        }
        if(keycode==K.N3){
            if(!('n3' in stickflags)){
                stickflags['n3'] = '';
                slotManager.select(2);
            }
            e.preventDefault();
        }
        if(keycode==K.L){
            if(!('l' in stickflags)){
                stickflags['l'] = '';
                slotManager.toggleLockAndUnlockToSelected();
            }
            e.preventDefault();
        }
        if(keycode==K.SPACE){
            if(!('space' in stickflags)){
                // Alias
                // 理由: L は 1,2,3 キーから離れてて押しづらいから
                stickflags['space'] = '';
                slotManager.toggleLockAndUnlockToSelected();
            }
            e.preventDefault();
        }
        if(keycode==K.ESC){
            if(!('esc' in stickflags)){
                stickflags['esc'] = '';
                slotManager.clear();
            }
            e.preventDefault();
        }
        if(keycode==K.RIGHT){
            if(!('right' in stickflags)){
                stickflags['right'] = '';
                selectNextCard(slotManager);
            }
            e.preventDefault();
        }
        if(keycode==K.LEFT){
            if(!('left' in stickflags)){
                stickflags['left'] = '';
                selectPrevCard(slotManager);
            }
            e.preventDefault();
        }
        if(keycode==K.DELETE){
            if(!('delete' in stickflags)){
                stickflags['delete'] = '';
                slotManager.clear();
            }
            e.preventDefault();
        }
    });
    $('body').keyup(function(e){
        if(isInTextarea()){
            return;
        }
        var keycode = e.keyCode;
        if(('n1' in stickflags) && keycode==K.N1){
            delete stickflags['n1'];
        }
        if(('n2' in stickflags) && keycode==K.N2){
            delete stickflags['n2'];
        }
        if(('n3' in stickflags) && keycode==K.N3){
            delete stickflags['n3'];
        }
        if(('l' in stickflags) && keycode==K.L){
            delete stickflags['l'];
        }
        if(('space' in stickflags) && keycode==K.SPACE){
            delete stickflags['space'];
        }
        if(('esc' in stickflags) && keycode==K.ESC){
            delete stickflags['esc'];
        }
        if(('right' in stickflags) && keycode==K.RIGHT){
            delete stickflags['right'];
        }
        if(('left' in stickflags) && keycode==K.LEFT){
            delete stickflags['left'];
        }
        if(('delete' in stickflags) && keycode==K.DELETE){
            delete stickflags['delete'];
        }
    });

});
