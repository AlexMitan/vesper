let Expr = require('./Expr');
let { Token } = require('./Token');
// an expression visitor
class AstPrinter {
    constructor() {
        this.indentation = 0;
    }
    print(instructions) {
        let representation = ["["];
        for (let instruction of instructions) {
            if (instruction instanceof Expr.Base) {
                representation.push("  " + instruction.accept(this));
            } else {
                representation.push(`  (ERROR ${instruction})`);
            }
        }
        return representation.join("\n") + "\n]";
    }
    visitSExpr(expr) {
        return this.parenthesise(expr.operator, ...expr.children);
    }
    visitSymbolExpr(expr) {
        // return this.parenthesise('SYMBOL', expr.symbol);
        return expr.symbol.lexeme;
    }
    visitLiteralExpr(expr) {
        let str = expr.value;
        if (typeof expr.value === 'string') {
            str = `"${str}"`;
        } 
        return str;
    }
    visitMacroCall(expr) {
        return this.parenthesise('MACROCALL', expr.symbol, ...expr.children);
    }
    visitMacroDef(expr) {
        return this.parenthesise('MACRODEF', expr.symbol, ...expr.children, expr.definition);
    }
    // parenthesise(name, ...exprs) {
    //     let strArr = [];
    //     strArr.push("(" + name);
    //     for (let expr of exprs) {
    //         strArr.push(" ");
    //         strArr.push(expr.accept(this));
    //     }
    //     strArr.push(')');
    //     return strArr.join('');
    // }
    // HACK: random arguments passed in as parens
    parenthesise(...args) {
        let strArr = [];
        strArr.push("(");
        for (let i=0; i<args.length; i++) {
            if (i>0) strArr.push(" ");
            let arg = args[i];
            // arg is string
            if (Array.isArray(arg)) {
                // HACK: split array into units recursively
                strArr.push(this.parenthesise(...arg));
            } else if (typeof arg === 'string') {
                strArr.push(arg);
            } else if (typeof arg === 'number') {
                strArr.push(arg);
            } else if (arg instanceof Expr.Base) {
                // arg is expr
                strArr.push(arg.accept(this));
            } else if (arg instanceof Token) {
                // arg is token
                // HACK: should probably use a proper expression
                // console.log(arg);
                strArr.push(arg.lexeme);
            }
        }
        strArr.push(')');
        return strArr.join('');
    }
}

module.exports = { AstPrinter };