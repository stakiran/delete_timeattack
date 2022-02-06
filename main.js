'use strict';

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

$(function() {
    $('#battleField').val(''); // reload 時でも確実にクリアしたい

    $('#battleField').keyup(function(e){
        const event = e
        console.log(`keyup ${event.keyCode}`)
    });

    $('#battleField').keydown(function(e){
        const event = e
        console.log(`keydown ${event.keyCode}`)
    });

});
