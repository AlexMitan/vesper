let Expr = require('./Expr');
let { Token } = require('./Token');
// an expression visitor
class Interpreter {
    interpret(instruction) {
        // try {
        let value = instruction.accept(this);
        // } except (e) {
            // console.log(e);
            
        // }
    }
    visitSExpr(expr) {
        console.log(`visiting SExpr`);
        
    }
    visitSymbolExpr(expr) {
        console.log(`visiting SymbolExpr`);
        return expr.symbol.lexeme;
    }
    visitLiteralExpr(expr) {
        console.log(`visiting LiteralExpr`);
        let value = expr.value;
        return value;
    }
    visitMacroCall(expr) {
        console.log(`visiting MacroCall`);
        // return this.parenthesise('MACROCALL', expr.symbol, ...expr.children);
    }
    visitMacroDef(expr) {
        console.log(`visiting MacroDef`);
        return this.parenthesise('MACRODEF', expr.symbol, ...expr.children, expr.definition);
    }
}

const { Scanner } = require('./Scanner');
const { AstPrinter } = require('./AstPrinter');
const { Parser } = require('./Parser');
let code = `-64.123`;
let printer = new AstPrinter();
let scanner = new Scanner(code);
scanner.scanTokens();
scanner.logTokens();
console.log(scanner.tokens);

let parser = new Parser(scanner.tokens);
let instructions = parser.parse();
console.log(printer.print(instructions));

module.exports = { Interpreter };