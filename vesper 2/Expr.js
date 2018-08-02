let { Token } = require('./Token.js');
let { toks } = require('./standard.js');

class Base {
    accept(visitor) {
    }
}

class SExpr extends Base {
    constructor(children=[]) {
        super();
        this.children = children;
        this.type = 'SExpr';
    }
    accept(visitor) {
        return visitor.visitSExpr(this);
    }
}
class MacroCall extends Base {
    constructor(symbol, children=[]) {
        super();
        this.symbol = symbol
        this.children = children;
        this.type = 'MacroCall';
    }
    accept(visitor) {
        return visitor.visitMacroCall(this);
    }
}
class MacroDef extends Base {
    constructor(symbol, children=[], definition) {
        super();
        this.symbol = symbol
        this.children = children;
        this.definition = definition;
        this.type = 'MacroDef';
    }
    accept(visitor) {
        return visitor.visitMacroDef(this);
    }
}

class Literal extends Base {
    constructor(value) {
        super();
        this.value = value;
        this.type = 'Literal';
    }
    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

class Symbol extends Base {
    constructor(symbol) {
        //      tok
        super();
        this.symbol = symbol;
    }
    accept(visitor) {
        return visitor.visitSymbolExpr(this);
    }
}
module.exports = {
    Base,
    SExpr,
    Literal,
    Symbol,
    MacroCall,
    MacroDef
}