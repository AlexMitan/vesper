let { toks } = require('./standard.js');
class Token {
    constructor(tokenType, lexeme, literal, line) {
        if (toks[tokenType] === undefined) {
            throw "Undefined token type " + tokenType + " for " + lexeme;
        }
        this.tokenType = tokenType;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    toString() {
        return this.tokenType + " " + this.lexeme + this.literal;
    }
}

module.exports = Token;