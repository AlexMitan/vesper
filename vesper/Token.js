let { toks } = require('./standard.js');
class Token {
    constructor(tokenType, lexeme, literal, line, column) {
        if (toks[tokenType] === undefined) {
            throw `Undefined token type ${tokenType} for ${lexeme} at line ${line}, column ${column}`;
        }
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.column = column;
    }
    toString() {
        return this.tokenType + " " + this.lexeme; // + this.literal;
    }
}

module.exports = Token;