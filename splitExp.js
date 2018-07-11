function isNodeStart(tok) {
    let validStarts = ['(', '\'(', '#\'('];
    return validStarts.indexOf(tok) > -1;
}
function tokenise(exp='') {
    // console.log('exp has ' + (exp.match(/\n/g) || []).length + ' newlines');
    let refined = exp.replace(/\n/g, ' ')
                     .replace(/\)/g, ' ) ')
                     .replace(/\(/g, ' ( ')
                     .replace(/ {2,}/g, ' ');

    let rawTokens = refined.split(' ');
    let i = 0;
    let refinedTokens = [];
    let listStarts = ['(', '\'(', '#\'('];
    
    while (i < rawTokens.length) {
        let tok = rawTokens[i];
        if (i+1 < rawTokens.length) {
            let combined = rawTokens[i] + rawTokens[i+1];
            if (isNodeStart(combined)) {
            // if (listStarts.indexOf(combined) > -1) {
                tok = combined;
                i += 1;
            }
        }
        if (tok.length >= 1) {
            // HACK: I get empty tokens sometimes
            refinedTokens.push(tok);
        }
        i += 1;
    }
    return refinedTokens;
}

var factorialExp = `(defun factorial (n)
(if (= n 0)
    1
    (* n (factorial (- n 1))) ) )`

class LNode {
    constructor(startTok) {
        if (isNodeStart(startTok)) {
            this.type = startTok;
        } else {
            throw 'Invalid start token ' + startTok;
        }
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
    }
    log(indent=0) {
        console.log("  ".repeat(indent) + this.children[0])
        for (let child of this.children) {
            // if (
        }
    }
}

var tokenList = tokenise(factorialExp);
function makeTree(tokens) {
    console.log(tokens.join(' '));
    let nodes = [[]];
    for (let i=0; i<tokens.length; i++) {
        let currentNode = nodes[nodes.length-1];
        let tok = tokens[i];
        if (isNodeStart(tok)) {
            // start of a new node
            let newNode = [];
            currentNode.push(newNode);
            nodes.push(newNode);
            // console.log('current node:', tokens[i+1]);
        } else if (tok === ')') {
            nodes.pop();
        } else {
            currentNode.push(tok);
        }
    }
    return nodes;
}


// nodes[0].children[0].log();

// new Node('a')
function logTree(tree, indent=0) {
    for (let elem of tree) {
        if (Array.isArray(elem)) {
            console.log("  ".repeat(indent) + 'sexp');
            logTree(elem, indent + 1);
            // console.log("  ".repeat(indent) + ')');
        } else {
            console.log("  ".repeat(indent) + elem);
        }
    }
}
// logTree(nodes);
function evalTree(tree) {
    let result = null;
    let currentOp = null;
    console.log('evaluating', tree);
    if (!Array.isArray(tree)) {
        // leaf
        let leaf = tree || "";
        // console.log('leaf:', leaf);
        // number
        if (leaf.match(/[0-9]+/)) {
            leaf = Number(leaf);
            console.log('int:', leaf);
        }
        return leaf;
    } else if (tree.length === 0) {
        // null
        console.log('null element');
        return null;
    } else if (tree.length === 1) {
        // single-element
        console.log('atom:', tree);
        return evalTree(tree[0]);
    } else {
        // list
        currentOp = tree[0];
    }
    let ops = {
        "*": {
            func: (args) => (args.reduce((acc, curr) => acc * curr))
        },
        "+": {
            func: (args) => (args.reduce((acc, curr) => acc + curr))
        }
    }
    let args = tree.slice(1).map(evalTree);
    result = ops[currentOp].func(args);
    console.log('op:', currentOp, 'args:', args, 'result:', result);

    // for (let i=1; i<tree.length; i++) {
    //     let elem = evalTree(tree[i]);
    //     result = ops[currentOp].accum(result, elem);
    //     console.log('result:', result);
    // }
    return result;
}

let tree = makeTree(tokenise('(* 2 (+ 3 4) 5)'));
logTree(tree);
evalTree(tree);
