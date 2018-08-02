let Expr = require('./Expr');
let { Token } = require('./Token');
let { Environment } = require('./Environment');
let { VesperCallable } = require('./VesperCallable');
let { VesperFunction } = require('./VesperFunction');
// an expression visitor


function error(token, message) {
    report(token.line, "", `${message}`);
}
function report(line, where, message) {
    // console.log(`[line ${line}, col ${column}] Error ${where}: ${message}`);
    console.log(`[line ${line}] Error ${where}: ${message}`);
}

function makeNative(arity, name, func, processArgs=false) {
    return new class extends VesperCallable {
        arity() { return arity; }
        vesperCall(interpreter, args) {
            if (processArgs) {
                return func(interpreter, args.map(arg => arg.accept(interpreter)));
            }
            return func(interpreter, args);
        }
        toString() {return `native fn ${name}`};
    }
}

function nativeOp(arity, op) {
    return makeNative(arity, op, (interpreter, args) => eval(`args.reduce((a, b) => (a ${op} b))`), true);
}

class Interpreter {
    constructor() {
        this.globals = new Environment();
        for (let accumOp of ['+', '-', '/', '*', '>', '<']) {
            this.globals.define(accumOp, nativeOp(-1, accumOp));
        }
        for (let binaryOp of ['>', '<', '>=', '<=']) {
            this.globals.define(binaryOp, nativeOp(2, binaryOp));
        }
        this.globals.define("time", makeNative(0, "time", (interpreter, args) => {
            return new Date().getTime();
        }));
        this.globals.define("log", makeNative(-1, "log", (interpreter, args) => console.log(...args), true));
        this.globals.define("if", makeNative(3, "if", (interpreter, args) => {
            let processedCond = args[0].accept(interpreter);
            if (interpreter.isTruthy(processedCond)) {
                return args[1].accept(interpreter);
            } else {
                return args[2].accept(interpreter);
            }
        }));
        this.environment = this.globals;
    }
    execute(exprs) {
        for (let expr of exprs) {
            try {
                let value = expr.accept(this);
                console.log('>',value);
            } catch (e) {
                console.log(e);
            }
        }
        this.environment = this.environment.enclosing;
    }
    executeClosure(expr, environment) {
        let previous = this.environment;
        try {
            this.environment = environment;
            let value = expr.accept(this);
            return value;
        } catch (e) {
            console.log(e);
        } finally {
            this.environment = previous;
        }
    }
    visitSExpr(expr) {
        if (expr.children.length === 0) return null;
        let operator = expr.children[0].accept(this);
        let args = expr.children.slice(1);
        if (!(operator instanceof VesperCallable)) {
            error(expr.openingParen, `Can only call functions. ${operator} is not a function.`);
            return null;
        }
        // if (args.length < operator.arity()[0] || args.length > operator.arity()[1]) {
        // TODO: variable arity
        if (operator.arity() !== -1 && args.length !== operator.arity()) {
            error(expr.openingParen, `${operator} takes in ${operator.arity()} arguments, not ${args.length}.`);
        }
        return operator.vesperCall(this, args);
    }
    visitSymbolExpr(expr) {
        return this.environment.lookup(expr.symbol);
    }
    visitLiteralExpr(expr) {
        let value = expr.value;
        return value;
    }
    visitMacroCall(expr) {
        // return this.parenthesise('MACROCALL', expr.symbol, ...expr.children);
        let name = expr.symbol.lexeme;
        let macro = this.macros[name];
        if (macro) {
            let definition = macro.definition;
            let newExpr;

            if (definition instanceof Expr.Literal) {
                newExpr = new Expr.Literal(definition.value);
            } else if (definition instanceof Expr.SExpr) {
                let hash = {};
                let children = [];
                // bind call elements to macro symbols
                for (let i=0; i<macro.children.length; i++) {
                    let macroSymbol = macro.children[i].symbol.lexeme;
                    let exprChild = expr.children[i];
                    hash[macroSymbol] = exprChild;
                }
                // console.log(hash);
                for (let i=0; i<definition.children.length; i++) {
                    // console.log(`==================${i}==================`);
                    let defChild = definition.children[i];
                    // console.log(defChild);
                    // if it's a symbol and it's in the hash, bind it
                    if (defChild instanceof Expr.Symbol) {
                        let symbol = defChild.symbol.lexeme;
                        if (hash[symbol] != undefined) {
                            let value = hash[symbol];
                            // console.log(`symbol`);
                            // console.log(symbol);
                            // console.log(`value`);
                            // console.log(value);
                            defChild = value;
                        }
                    }
                    // HACK: should I copy tokens instead of pointing?
                    children.push(defChild);
                }
                newExpr = new Expr.SExpr(children);
                // newExpr = new Expr.SExpr([expr.symbol, ...macro.children]);
                // console.log('new SExpr:',[expr.symbol, ...macro.children]);
            }
            // console.log(newExpr);
            console.log(new AstPrinter().print([newExpr]));
            return newExpr;
        } else {
            throw `Undefined macro '${name}'`;
        }
    }
    visitMacroDef(expr) {
        let name = expr.symbol.lexeme;
        let func = new VesperFunction(name, expr.children, expr.definition, this.environment);
        this.environment.define(name, func);
        // this.macros[name] = { children: expr.children, definition: expr.definition };
        return null;
    }
    isTruthy(obj) {
        if (obj == null) return false;
        if (typeof obj === 'boolean') return obj;
        return true;
    }
}

const { Scanner } = require('./Scanner');
const { AstPrinter } = require('./AstPrinter');
const { Parser } = require('./Parser');
let code = `
[pi] 3.14
[square b] (* b b)
(if (> 14 (square 4)) 5 -5)
(pi)
// [tess b] (square (square b))
// (tess 10)`;
let printer = new AstPrinter();
let scanner = new Scanner(code);
let interpreter = new Interpreter();
interpreter.environment.define('a', 5);
scanner.scanTokens();
let parser = new Parser(scanner.tokens);
let instructions = parser.parse();
console.log(printer.print(instructions));

interpreter.execute(instructions);


module.exports = { Interpreter };