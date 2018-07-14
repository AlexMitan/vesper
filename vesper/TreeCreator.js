let Scanner = require('./Scanner');
let Vesper = require('./Vesper');
let { toks } = require('./standard');
let Token = require('./Token');

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
            return this.enclosing.find(varName, token);
        } else {
            // reached global without finding varName
            if (token) {
                Vesper.error(token.line, "Identifier " + varName + " not defined");
            } else {
                Vesper.error('???', "Identifier " + varName + " not defined");
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
// function evalTree(exp, env={}) {
//     if (!Array.isArray(exp)) {
//         // a token
//         let token = exp;
//         if (token.type === toks.NUMBER) return token.literal;
//         if (token.type === toks.STRING) return token.literal;
//         if (token.type === toks.TRUE) return true;
//         if (token.type === toks.FALSE) return false;
//         if (token.type === toks.NULL) return null;
//         if (token.type === toks.IDENTIFIER) {
//             return env.lookup(token.lexeme, token);
//         }
//     } else {
//         if (exp.length === 0) return null;
//         // [op arg arg...]
//         let op = exp[0];
//         if (Array.isArray(op)) {
//             op = evalTree(op, env);
//         }
//         let args = exp.slice(1);
//         // let mappedArgs = exp.slice(1).map(item => evalTree(item, env));
//         if (op.type === toks.IDENTIFIER) {
//             let lexeme = op.lexeme;
//             switch(lexeme) {
//                 case 'if':
//                     // (if test then else)
//                     if (args.length !== 3) Vesper.error(op.line, 'if operator takes three arguments');
//                     args = args.map(item => evalTree(item, env));
//                     return args[0] ? args[1] : args[2];
//                 case 'quote':
//                 case '\'':
//                     // (' 1 2 3)
//                     args = args.map(item => evalTree(item, env));
//                     return args;
//                 case 'car':
//                     // HACK: something is weird here with the data type mixture
//                     // (car (' 1 2 3))
//                     args = args.map(item => evalTree(item, env));
//                     return args[0][0];
//                     case 'define':
//                     // (define x 5)
//                     console.log(args);
//                     let varName = args[0];
//                     let value = args[1];
//                     console.log(`attempting to define ${varName} as ${value}`);
//                     env.find(varName)[varName] = evalTree(value, env);
//                     return null;
//                 default:
//                     op = env.lookup(lexeme, op);
//                     break;
//             }
//         }
//         // console.log(op, 'applied to', ...args);
//         // HACK: checking if it's not a function
//         // console.log('op:', op, typeof(op));
        
//         if (typeof(op) !== 'function') Vesper.error(op.line || "???", `Invalid operand: ${op}`);
//         // if (op.type === undefined) Vesper.error(op.line, `Invalid operand: ${op}`);
//         args = args.map(item => evalTree(item, env));
//         return op(...args);
//     }
// }
let cond_3 = `(if false 1 (if true (if false 2 3) 4))`;
let func_car_20 = `((car (' twice thrice)) 10)`;

class Expr {
    // [{+}, {"asd"}, [{*}, {2}, {3}], []]

    //     [{+} . .      . ]
    //         /   \      \
    //      {asd} [{*} . . ]  []
    //                /   \
    //              {2}   {3}
    constructor(arr, env) {
        this.children = arr;
        this.env = env;
    }
    eval() {
        if (this.children.length === 0) {
            // null ()
            return null;
        } else {
        }
    }
}

let globals = new Env({
    "a": 4, "b": 70,
    "twice": (x) => x * 2,
    "thrice": (x) => x * 3,
    "+": (...args) => args.reduce((curr, next) => curr + next),
    "log": (x) => console.log(x)
});
let env1 = new Env({"a": 5, "c": 6}, globals);
let env2 = new Env({"a": 5, "c": 6}, env1);

let lispy = `(false null ( () () ))`;

// let codeComm = `a  d`;
let vesperScanner = new Scanner(lispy);
vesperScanner.scanTokens();
vesperScanner.logTokens();
// console.log(vesperScanner.tokens);

let tree = exprTree(vesperScanner.tokens);
// console.log(tree);
// evalTree(tree, env2);
// let expr = new Expr(tree[0], globals);
// expr.eval();
console.log(printTree(tree));

function exprTree(tokens, level=0) {
    if (tokens.length === 0) {
        Vesper.error(1, 'Unexpected EOF while reading');
    }
    // paren scan
    let parenBalance = 0;
    let parenError = false;
    let lineNr = 1;
    let columnNr = 1;
    for (let i=0; i<tokens.length; i++) {
        let token = tokens[i];
        console.log(token);
        if (token.type === toks.LEFT_PAREN) parenBalance += 1;
        if (token.type === toks.RIGHT_PAREN) parenBalance -= 1;
        if (parenBalance < 0) {
            // too many )
            Vesper.error(token.line, 'Unexpected )');
            parenBalance = 0;
            parenError = true;
        }
    }
    if (parenBalance > 0) {
        // too many (
        // HACK: TODO: show proper line
        Vesper.error('???', 'Paren number' + parenBalance + 'not closed');
        parenError = true;
    }
    if (parenError) {
        Vesper.error(1, 'Unbalanced parentheses.');
        throw 'Vesper error: parentheses';
    }
    
    let nodes = [[]];
    for (let i=0; i<tokens.length; i++) {
        let token = tokens[i];
        // current line
        if (token.line > lineNr) lineNr = token.line;
        if (token.column > columnNr) columnNr = token.column;
        if (token.type === toks.LEFT_PAREN) {
            nodes.push([]);
        } else if (token.type === toks.RIGHT_PAREN) {
            let nodeToPush = nodes[nodes.length - 1];
            nodes.pop();
            console.log(`ready to push, node length ${nodeToPush.length}`);
            
            if (nodeToPush.length === 0) {
                // null node
                nodes[nodes.length - 1].push(new Token(toks.NULL, "null", null, lineNr, columnNr));
            } else {
                // one or more children
                nodes[nodes.length - 1].push(nodeToPush);
            }
            
        } else if (token.type !== toks.EOF) {
            // TODO: figure out if I should exclude EOF
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