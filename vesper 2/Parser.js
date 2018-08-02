let Expr = require('./Expr');
let { toks } = require('./standard');
let { Vesper } = require('./Vesper');

class ParseError extends Error {

}

function error(token, message) {
    report(token.line, "", `${message}`);
}
function report(line, where, message) {
    // console.log(`[line ${line}, col ${column}] Error ${where}: ${message}`);
    console.log(`[line ${line}] Error ${where}: ${message}`);
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
    // program → instruction* EOF
    parse() {
        let instructions = [];
        while (!this.isAtEnd()) {
            instructions.push(this.instruction());
            if (instructions[instructions.length - 1] == undefined) {
            }
        }
        return instructions;
    }
    // instruction → (child | macroDef)*
    instruction() {
        try {
            if (this.check(toks.LEFT_SQ)) return this.macroDef();
            else return this.child();
        } catch (e) {
            console.log(e.message);
            this.synchronise();
            return null;
        }
    }
    
    
    
    // child → sExpr | macroCall | primary
    child() {
        // if (this.match(toks.RIGHT_BRACE, toks.RIGHT_PAREN, toks.RIGHT_SQ)) {
        //     let badToken = this.previous;
        //     this.error(badToken, `Unexpected closing ${badToken.lexeme}`);
        // }
        if (this.check(toks.LEFT_PAREN)) {
            // (a b c)
            return this.sExpr();
        } else if (this.check(toks.LEFT_BRACE)) {
            // {sqrt 4}
            return this.macroCall();
        } else {
            return this.primary();
        }
    }
    // sExpr → "(" child* ")"
    sExpr() {
        // console.log('beginning sExpr');
        this.consume(toks.LEFT_PAREN, `Expected '(' at beginning of sExpr.`);
        let paren = this.previous();
        let children = [];
        while (!this.match(toks.RIGHT_PAREN)) {
            if (this.isAtEnd()) {
                error(paren, `Unclosed ${paren.lexeme}`);
            }
            children.push(this.child());
        }
        return new Expr.SExpr(children);
    }
    // macroCall → "{" IDENTIFIER child* "}"
    macroCall() {
        // console.log('beginning macroCall');
        this.consume(toks.LEFT_BRACE, `Expected '{' at beginning of macroCall.`);
        this.consume(toks.IDENTIFIER, `Expected identifier at beginning of macroCall.`);
        let symbol = this.previous();
        let children = [];
        while (!this.match(toks.RIGHT_BRACE)) {
            children.push(this.child());
        }
        return new Expr.MacroCall(symbol, children);
    }
    // macroDef    → "[" IDENTIFIER child* "]" child
    macroDef() {
        // console.log('beginning macroDef');
        this.consume(toks.LEFT_SQ, `Expected '[' at beginning of macroDef.`);
        this.consume(toks.IDENTIFIER, `Expected identifier at beginning of macroDef.`);
        let symbol = this.previous();
        let children = [];
        while (!this.match(toks.RIGHT_SQ)) {
            children.push(this.child());
        }
        let definition = this.child();
        return new Expr.MacroDef(symbol, children, definition);
    }

    // primary     → IDENTIFIER | NUMBER | STRING | FALSE | TRUE | NULL
    primary() {
        if (this.match(toks.FALSE)) return new Expr.Literal(false);
        if (this.match(toks.TRUE)) return new Expr.Literal(true);
        if (this.match(toks.NULL)) return new Expr.Literal(null);
        if (this.match(toks.NUMBER, toks.STRING)){
            return new Expr.Literal(this.previous().literal);
        }
        if (this.match(toks.IDENTIFIER)) {
            return new Expr.Symbol(this.previous());
        }
        throw this.error(this.peek(), `Expected primary instead of ${this.peek().lexeme}`);
    }
    match(...types) {
        for (let type of types) {
            // console.log('type checking:', type);
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false; 
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    check(tokenType) {
        if (this.isAtEnd()) return false;
        return this.peek().type == tokenType;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type == toks.EOF;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    error(token, message) {
        error(token, message);
        return new ParseError();
    }
    synchronise() {
        this.advance();

        while (!this.isAtEnd()) {
            switch (this.peek().type) {
                case toks.LEFT_PAREN:
                case toks.LEFT_BRACE:
                case toks.LEFT_SQ:
                    return;
              }
        
            this.advance();
        }
    }
}


module.exports = { Parser };