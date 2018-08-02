let { toks, keywords } = require('./standard');
let { Token } = require('./Token');
let { Vesper } = require('./Vesper')

function error(line, message) {
    report(line, "", message)
}
function report(line, where, message) {
    // console.log(`[line ${line}, col ${column}] Error ${where}: ${message}`);
    console.log(`[line ${line}] Error ${where}: ${message}`);
}

class Scanner {
    constructor(source="") {
        this.source = source;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 0;
        this.right = -1;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(toks.EOF, "", null, this.line));
    }
    scanToken() {
        let char = this.advance();
        switch (char) {
            case '(': this.addToken(toks.LEFT_PAREN); break;
            case ')': this.addToken(toks.RIGHT_PAREN); break;
            case '{': this.addToken(toks.LEFT_BRACE); break;
            case '}': this.addToken(toks.RIGHT_BRACE); break;
            case '[': this.addToken(toks.LEFT_SQ); break;
            case ']': this.addToken(toks.RIGHT_SQ); break;
            // case ':': this.addToken(toks.COLON); break;
            // case '\'':
            //     // if (this.match('(')) {
            //         // comment till end of line
            //         // while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
            //     // }
            //     this.addToken(toks.QUOTE);
            //     break;
            case '/':
                if (this.match('/')) {
                    // comment till end of line
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else if (this.match('*')) {
                    this.blockComment();
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;
        
            case '\n':
                this.line++;
                this.right = -1;
                break;
            case '"': this.string(); break;
            case '-':
                if (this.isDigit(this.peek())) {
                    this.advance();
                    this.number(true);
                } else {
                    this.identifier();
                }
                break;
            default:
                if (this.isDigit(char)) {
                    this.number();
                } else if (this.isSymbol(char) || this.isAlpha(char)) {
                    this.identifier();
                } else {
                    error(this.line, "Unexpected character.");
                }
                break;

        }
    }
    isSymbol(c) {
        // /[a-zA-Z0-9_+\-*\/\\=<>!&]+/
        // +-*/!@#$%^&*'
        return /[\+\*\/!@#\$%\^&_\'><=]/.test(c);
    }
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z');
    }
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
    identifier() {
        // look for symbol or alpha followed by number, symbol or alpha
        while (this.isSymbolChar(this.peek())) this.advance();
        while (this.isSymbol(this.peek()) || this.isAlphaNumeric(this.peek())) this.advance();

        // TODO: error on: a"asd"d

        let text = this.source.substring(this.start, this.current);
        let type = keywords[text] === undefined ? toks.IDENTIFIER : keywords[text];
        // let type = toks.IDENTIFIER;
        
        // console.log('identifier:', text, 'type:', type);

        this.addToken(type);
    }
    blockComment() {
        let foundEnd = false;
        while (!this.isAtEnd() && !foundEnd) {
            if (this.match('*') && this.match('/')) {
                foundEnd = true;
            }
            if (!foundEnd) this.advance();
        }   
                // while (this.peek() != '*' && this.peekNext() != '/' && !this.isAtEnd()) this.advance();
        // this.advance();
        // this.advance();
    }
    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++;
            this.advance();
        }

        // Unterminated string
        if (this.isAtEnd()) {
            Vesper.error(this.line, "Unterminated string");
            return;
        }

        // The closing "
        this.advance();

        let value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(toks.STRING, value);
    }
    match(expected) {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) != expected) return false;
        
        this.current++;
        return true;
    }
    peek(n=0) {
        if (this.current + n >= this.source.length) return '\0';
        return this.source.charAt(this.current + n);
    }
    number(neg=false) {
        while (this.isDigit(this.peek())) this.advance();

        // Look for fractional part
        if (this.peek() == '.' && this.isDigit(this.peek(1))) {
            // Consume the .
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        } else if (this.isSymbolChar(this.peek())) {
            while (this.isSymbolChar(this.peek())) this.advance();
            Vesper.error(this.line, 'Invalid identifier: ' + this.source.substring(this.start, this.current));
        }

        let value = this.source.substring(this.start, this.current);
        this.addToken(toks.NUMBER, Number(value));
    }
    isSymbolChar(c) {
        return this.isSymbol(c) || this.isAlpha(c);
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    advance() {
        this.right++;
        this.current++;
        return this.source.charAt(this.current - 1);
    }
    addToken(type, literal=null) {
        let text = this.source.substring(this.start, this.current);
        let token = new Token(type, text, literal, this.line, this.right);
        // HACK: count lines and columns from 0 or 1?
        let line = this.source.split('\n')[this.line];
        // TODO: integrate this with proper error checking
        // console.log(line);
        // console.log(' '.repeat(this.right) + '^');
        // console.log(`Token: ${token.type} ${token.lexeme} ${token.line} ${token.column}`);
        // console.log('\n');
        
        this.tokens.push(token);
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    logTokens() {
        console.log(this.tokens.map(e => e.lexeme).join(' '));
        // console.log(this.tokens.map(e => e.type).join(' '));
    }
}


module.exports = { Scanner };