class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
}

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
    find(varName) {
        if (this.bindings[varName] !== undefined) {
            return this;
        } else if (this.enclosing !== null) {
            return this.enclosing.find(varName);
        } else {
            throw varName + ' not defined';
        }
    }
    lookup(varName) {
        return this.find(varName).bindings[varName];
    }
}

let globals = new Env({"a": 4, "b": 70});
// console.log(globals);
let env1 = new Env({"a": 5, "c": 6}, globals);
let env2 = new Env({"a": 5, "c": 6}, env1);
// console.log(env1.find("a"));
// console.log(env1.find("b"));
console.log(env2.lookup("b"));
// console.log(env1.find("x"));

class Expr {
    constructor(arr, env){

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