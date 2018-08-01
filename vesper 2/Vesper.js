let { toks } = require('./standard');
// let Token = require('./Token');
let Scanner = require('./Scanner')

class Vesper {
    run(source="") {
        let scanner = new Scanner(source);
        let tokens = scanner.scanTokens();
    }
    static error(line, message) {
        this.report(line, "", message)
    }
    static report(line, where, message) {
        // console.log(`[line ${line}, col ${column}] Error ${where}: ${message}`);
        console.log(`[line ${line}] Error ${where}: ${message}`);
        Vesper.hadError = true;
    }
}

module.exports = Vesper;