let { Vesper } = require('./Vesper');

class VesperRuntimeError extends Error {
    constructor(token, message) {
        super(message);
        this.token = token;
    }
}

class Environment {
    constructor(enclosing=null) {
        this.values = {};
        this.enclosing = enclosing;
    }
    define(str, value) {
        // str
        this.values[str] = value;
    }
    lookup(token) {
        // get variable name in scope
        if (this.values[token.lexeme] !== undefined) {
            return this.values[token.lexeme];
        }
        // look in higher scope
        if (this.enclosing !== null) {
            return this.enclosing.lookup(token);
        }
        // Vesper.error(token, `Undefined variable ${token.lexeme}.`);
        // CARE: sometimes this doesn't work as intended
        throw new VesperRuntimeError(token, `Undefined variable ${token.lexeme}.`);
    }
    assign(token, value) {
        // assign to variable name in scope
        if (this.values[token.lexeme] !== undefined) {
            this.values[token.lexeme] = value;
            return;
        }
        // look in higher scope and assign there
        if (this.enclosing !== null) {
            this.enclosing.assign(token, value);
            return
        }

        throw new VesperRuntimeError(token, `Assigning to undefined variable ${token.lexeme}.`);
    }
}

module.exports = { Environment };