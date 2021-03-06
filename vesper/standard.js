
function makeEnum(...args) {
    let hash = {};
    let ctr = 1;
    for (let arg of args) {
        hash[arg] = arg;
    }
    return Object.freeze(hash);
}

let toks = makeEnum(
    // Single-character tokens.
    'LEFT_PAREN', 'RIGHT_PAREN',
    // 'LEFT_BRACE', 'RIGHT_BRACE', 'LEFT_SQ', 'RIGHT_SQ',
    // 'QUOTE',
    // 'COMMA', 'DOT', 'MINUS', 'PLUS', 'SEMICOLON', 'SLASH', 'STAR',

    // // One or two character tokens.
    // 'BANG', 'BANG_EQUAL',
    // 'EQUAL', 'EQUAL_EQUAL',
    // 'GREATER', 'GREATER_EQUAL',
    // 'LESS', 'LESS_EQUAL',

    // Literals.
    'IDENTIFIER', 'STRING', 'NUMBER',
    'TRUE', 'FALSE', 'NULL',
    // // Keywords.
    // 'AND', 'CLASS', 'ELSE', 'FALSE', 'FUN', 'FOR', 'IF',  'OR',
    // 'PRINT', 'RETURN', 'SUPER', 'THIS', 'TRUE', 'VAR', 'WHILE',

    'EOF'
);
class HashEnum {
    constructor(...args) {
        // TODO: error on getting wrong enum value
    }
}
let keywords = {};
keywords["true"] =    toks.TRUE;
keywords["false"] =    toks.FALSE;
keywords["null"] =    toks.NULL;


module.exports = {
    toks: toks,
    makeEnum: makeEnum,
    keywords: keywords
};