let { toks } = require('./standard.js');
class Token {
    constructor(type, lexeme, literal, line, column) {
        if (toks[type] === undefined) {
            throw `Undefined token type ${type} for ${lexeme} at line ${line}, column ${column}`;
        }
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.column = column;
    }
    toString() {
        return this.type + " " + this.lexeme; // + this.literal;
    }
}

module.exports = { Token };