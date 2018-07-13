let { toks } = require('./vesLibs');
// let Token = require('./Token');
let Vesper = require('./Vesper')
let Scanner = require('./Scanner')

class Vesper {
    run(source="") {
        let scanner = new Scanner(source);
        let tokens = scanner.scanTokens();
        // for (let i=0; i<tokens.length; i++) {
        //     console.log(tokens[i]);
        // }
    }
    // runLine() {
    //     const readline = require('readline');

    //     this.run(readline());
    // }
    static error(line, message) {
        this.report(line, "", message)
    }
    static report(line, where, message) {
        console.log("[line " + line + "] Error" + where + ": " + message);
        Vesper.hadError = true;
    }
}

module.exports = Vesper;