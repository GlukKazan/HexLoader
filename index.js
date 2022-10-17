"use strict";

const fs = require('fs'); 
const readline = require('readline'); 

const game = require('./game');

async function proceed() {
    const rl = readline.createInterface({
        input: fs.createReadStream('data/hex-11.txt'), 
        console: false 
    });
    for await (const line of rl) {
//      console.log(line);
        game.load(line);
    }
}

async function run() {
    await proceed();
}

(async () => { await run(); })();