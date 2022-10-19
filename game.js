"use strict";

const _ = require('underscore');

const LETTERS = 'ABCDEFGHIJKabcdefghijk';
const SIZE = 11;

function dump(board, size) {
    for (let y = 0; y < size; y++) {
        let s = '';
        for (let i = 0; i <= y; i++) {
            s = s + ' ';
        }
        for (let x = 0; x < size; x++) {
            const pos = y * size + x;
            if (board[pos] > 0) {
                s = s + '* ';
            } else if (board[pos] < 0) {
                s = s + 'o ';
            }  else {
                s = s + '. ';
            }
        }
        console.log(s);
    }
    console.log('');
}

function rotate(pos, size, ix) {
    if (ix == 0) return pos;
    const x = pos % size;
    const y = (pos / size) | 0;
    return ((size - 1) - y) * size + (size - 1) - x;
}

function flip(pos, size, player) {
    if (player > 0) return pos;
    const x = pos % size;
    const y = (pos / size) | 0;
    return x * size + y;
}

function isDigit(c) {
    if (c == '-') return true;
    return (c >= '0') && (c <= '9');
}

function pieceNotation(c, p, size) {
    if (p == 0) return '' + c;
    c--;
    if (p > 0.01) c += size;
    return LETTERS[c];
}

function getFen(board, size) {
    let str = '';
    let k = 0; let c = 0; let p = 0;
    for (let pos = 0; pos < size * size; pos++) {
        if (k >= size) {
            if (c > 0) {
                str += pieceNotation(c, p, size);
            }
            str += "/";
            k = 0;
            c = 0;
            p = 0;
        }
        k++;
        const v = board[pos];
        if (Math.abs(v) < 0.01) {
            if ((p != 0) || ((c > 8) && (p == 0))) {
                str += pieceNotation(c, p, size);
                c = 0;
            }
            c++;
            p = 0;
        } else {
            if (v * p < 0.01) {
                if (c > 0) {
                    str += pieceNotation(c, p, size);
                    c = 0;
                }
                p = v;
                c = 1;
            } else {
                c++;
            }
        }
    }
    if (c > 0) {
        str += pieceNotation(c, p, size);
    }
    return str;
}

function load(data) {
    if (data.length % 2 != 0) return;
    let board = new Float32Array(SIZE * SIZE);
    let winner = (data.length % 4 != 0) ? 1 : -1;
    let player = 1;
    let pos = 0;
    while (pos < data.length - 1) {
        let estimate = 0; let s = 0.1;
        while ((pos < data.length) && isDigit(data[pos])) {
            if (data[pos] == '-') {
                s = -s;
                continue;
            }
            estimate += +data[pos] * s;
            s = s / 10;
        }
        const x = _.indexOf(LETTERS, data[pos]);
        if ((x < 0) || (x >= SIZE)) return;
        const y = _.indexOf(LETTERS, data[pos + 1].toUpperCase());
        if ((y < 0) || (y >= SIZE)) return;
        pos += 2;
        const move = y * SIZE + x;
        for (let ix = 0; ix < 2; ix++) {
            let b = new Float32Array(SIZE * SIZE);
            for (let i = 0; i < SIZE * SIZE; i++) {
                b[flip(rotate(i, SIZE, ix), SIZE, player)] = board[i];
            }
            const fen = getFen(b, SIZE);
            const p = flip(rotate(move, SIZE, ix), SIZE, player);
            const rd = _.random(1, 10000);
            console.log('insert into ai_fit(variant_id, setup, move, estimate, rd, winner) values(225, \'' + fen + '\', ' + p + ', ' + estimate + ', ' + rd + ', ' + winner + ');');
        }
        board[move] = player;
        player = -player;
//      dump(board, SIZE);
    }
}

module.exports.load = load;
