const { VesperCallable } = require('./VesperCallable')
const { Environment } = require('./Environment')

class VesperFunction extends VesperCallable {
    constructor(name, parameters, body, closure) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.closure = closure;
    }
    vesperCall(interpreter, args) {
        let environment = new Environment(interpreter.globals);
        for (let i = 0; i < this.parameters.length; i++) {
            let processedArg = args[i].accept(interpreter);
            environment.define(this.parameters[i].symbol.lexeme, processedArg);
        }
        try {
            return interpreter.executeClosure(this.body, environment);
        } catch (e) {
            if (e.isReturn) {
                return e.value
            } else throw e;
        }
        return null;
    }
    arity() {
        return this.parameters.length;
    }
    toString() {
        return `<fn ${this.name.lexeme}>`;
    }
}

module.exports = { VesperFunction };