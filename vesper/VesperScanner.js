let { toks } = require('./vesLibs');
let Token = require('./Token');

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

class Scanner {
    constructor(source="") {
        this.source = source;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
    }
    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(toks.EOF, "", null, this.line));
    }
    scanToken() {
        let c = this.advance();
        switch (c) {
            case '(': this.addToken(toks.LEFT_PAREN); break;
            case ')': this.addToken(toks.RIGHT_PAREN); break;
            case '{': this.addToken(toks.LEFT_BRACE); break;
            case '}': this.addToken(toks.RIGHT_BRACE); break;
            case ']': this.addToken(toks.LEFT_SQ); break;
            case '[': this.addToken(toks.RIGHT_SQ); break;
            case '\'':
                // if (this.match('(')) {
                    // comment till end of line
                    // while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                // }
                this.addToken(toks.QUOTE);
                break;
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
                break;

            case '"': this.string(); break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isSymbol(c) || this.isAlpha(c)) {
                    this.identifier();
                } else {
                    Vesper.error(this.line, "Unexpected character.");
                }
                break;

        }
    }
    isSymbol(c) {
        // /[a-zA-Z0-9_+\-*\/\\=<>!&]+/
        return /[\+\-\*\/!@#\$%\^&_\[\]]/.test(c);
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
        // let tokenType = keywords[text] === undefined ? toks.IDENTIFIER : keywords[text];
        let tokenType = toks.IDENTIFIER;
        
        // console.log('identifier:', text, 'type:', tokenType);

        this.addToken(tokenType);
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

        // The closing ""
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
    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }
    peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }
    number() {
        while (this.isDigit(this.peek())) this.advance();

        // Look for fractional part
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
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
        this.current++;
        return this.source.charAt(this.current - 1);
    }
    addToken(tokenType, literal=null) {
        let text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(tokenType, text, literal, this.line));
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    logTokens() {
        console.log(this.tokens.map(e => e.lexeme).join(' '));
    }
}
function exprTree(tokens, level=0) {
    if (tokens.length === 0) {
        Vesper.error(1, 'Unexpected EOF while reading');
    }
    // paren scan
    let parenBalance = 0;
    let parenError = false;
    for (let i=0; i<tokens.length; i++) {
        let token = tokens[i];
        if (token.tokenType === toks.LEFT_PAREN) parenBalance += 1;
        if (token.tokenType === toks.RIGHT_PAREN) parenBalance -= 1;
        if (parenBalance < 0) {
            // too many )
            Vesper.error(token.line, 'Unexpected )');
            parenBalance = 0;
            parenError = true;
        }
    }
    if (parenBalance > 0) {
        // too many (
        Vesper.error(token.line, 'Paren number' + parenBalance + 'not closed');
        parenError = true;
    }
    if (parenError) {
        Vesper.error(1, 'Unbalanced parentheses.');
        throw 'Vesper error: parentheses';
    }
    let nodes = [[]];
    for (let i=0; i<tokens.length; i++) {
        let token = tokens[i];
        if (token.tokenType === toks.LEFT_PAREN) {
            nodes.push([]);
        } else if (token.tokenType === toks.RIGHT_PAREN) {
            nodes[nodes.length - 2].push(nodes[nodes.length - 1]);
            nodes.pop();
            
        } else if (token.tokenType !== toks.EOF) {
            nodes[nodes.length - 1].push(token.lexeme);
        }
    }
    return nodes[0];
}

// let codeComm = `a  d`;
let lispy = `(+ 2 3 5) (* 2 3)`;
let vesperScanner = new Scanner(lispy);
vesperScanner.scanTokens();
// console.log(vesperScanner.tokens);
// vesperScanner.logTokens();

console.time('exptree');
let tree = exprTree(vesperScanner.tokens);
console.timeEnd('exptree');
// vesperScanner.logTokens();
console.log(tree);