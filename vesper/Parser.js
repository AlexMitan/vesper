let Scanner = require('./Scanner');
let Vesper = require('./Vesper');
let { toks } = require('./standard');

class Parser {
    constructor(tree) {
        this.tree = tree;
    }
}

// (define twice (lambda (x) (* 2 x)))

class Env {
    constructor(hash, enclosing=null) {
        this.enclosing = enclosing;
        this.bindings = {};
        this.update(hash);
    }
    update(hash) {
        for (var key in hash) {
            if (hash.hasOwnProperty(key)) {
                this.bindings[key] = hash[key];
            }
        }
    }
    find(varName, token=null) {
        if (this.bindings[varName] !== undefined) {
            return this;
        } else if (this.enclosing !== null) {
            return this.enclosing.find(varName);
        } else {
            // reached global without finding varName
            if (token) {
                Vesper.error(token.line, "Identifier " + varName + " not defined");
            }
        }
    }
    lookup(varName, token=null) {
        return this.find(varName, token).bindings[varName];
    }
}
class Literal {
    constructor(value) {
        this.value = value;
    }
}
function evalTree(exp, env={}) {
    if (!Array.isArray(exp)) {
        // a token
        let token = exp;
        if (token.tokenType === toks.NUMBER) return token.literal;
        if (token.tokenType === toks.STRING) return token.literal;
        if (token.tokenType === toks.TRUE) return true;
        if (token.tokenType === toks.FALSE) return false;
        if (token.tokenType === toks.NIL) return null;
        if (token.tokenType === toks.IDENTIFIER) {
            return env.lookup(token.lexeme);
        }
    } else {
        if (exp.length === 0) return null;
        // [op arg arg...]
        let op = exp[0];
        if (Array.isArray(op)) {
            op = evalTree(op, env);
        }
        let args = exp.slice(1).map(item => evalTree(item, env));
        
        if (op.tokenType === toks.IDENTIFIER) {
            let lexeme = op.lexeme;
            switch(lexeme) {
                case 'if':
                    // (if test then else)
                    if (args.length !== 3) Vesper.error(op.line, 'if operator takes three arguments');
                    return args[0] ? args[1] : args[2];
                case 'quote':
                case '\'':
                    return args;
                case 'car':
                    return args[0][0];
                default:
                    console.log('non-keyword op', op.lexeme, 'looking up...');
                    op = env.lookup(lexeme, op);
                    break;
            }
        }
        // console.log(op, 'applied to', ...args);
        // HACK: checking if it's still a token
        if (op.tokenType !== undefined) Vesper.error(op.line, `Invalid operand: ${op.lexeme}`);
        return op(...args);
    }
}
let cond_3 = `(if false 1 (if true (if false 2 3) 4))`;
let func_car_20 = `((car (' twice thrice)) 10)`;
let lispy = `(+ 10 20)`;

class Expr {
    constructor(arr, env) {
        this.children = arr;
        this.env = env;
    }
    eval() {
        if (this.children.length === 0) {
            // null ()
            return null;
        } else {
            // HACK: avoids Expr creation altogether
            for (let i=1; i<this.children.length; i++) {
                let child = this.children[i];
                if (Array.isArray(child)) {
                    this.children[i] = new Expr(child, new Env({}, this.env)).eval();
                } else {
                    this.children[i] = evalToken(child, this.env);
                }
            }
            
            let op = this.children[0];
            let args = this.children.slice(1);
            console.log(op, ' applied to ', args);
            return op(args);
        }
    }
}

let globals = new Env({
    "a": 4, "b": 70,
    "twice": function(x) {
        return x * 2;
    },
    "thrice": (x=100) => x * 3,
    "+": (a, b) => a + b,
    "log": (x) => console.log(x)
});
let env1 = new Env({"a": 5, "c": 6}, globals);
let env2 = new Env({"a": 5, "c": 6}, env1);

// let codeComm = `a  d`;
let vesperScanner = new Scanner(lispy);
vesperScanner.scanTokens();
vesperScanner.logTokens();
// console.log(vesperScanner.tokens);

let tree = exprTree(vesperScanner.tokens);
for (let exp of tree) {
    console.log(evalTree(exp, env2));
}
// evalTree(tree, env2);
// let expr = new Expr(tree[0], globals);
// expr.eval();
// console.log(printTree(tree));


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
            nodes[nodes.length - 1].push(token);
        }
    }
    return nodes[0];
}
function printTree(tree, str='') {
    for (let i=0; i<tree.length; i++) {
        let child = tree[i];
        if (Array.isArray(child)) {
            str += '(' + printTree(child) + ')';
        } else {
            if (i > 0) str += ', '
            str += child.toString();
        }
    }
    return str;
}