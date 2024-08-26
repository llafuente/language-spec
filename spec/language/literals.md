# Literals / Constants

<!--
same as c, but we want to support advanced staff like
10s <-- 10 seconds, so we should remove the suffix staff for something flexible
(6.4.4)
(6.4.5)
-->

```lexer
/*
  literal / constants
*/

STRING_LITERAL
    :   ENCODING_PREFIX? '"' SCHAR_SEQUENCE? '"'
    ;

fragment
ENCODING_PREFIX
    :   'u8'
    |   'u'
    |   'U'
    |   'L'
    ;

fragment
SCHAR_SEQUENCE
    :   SCHAR+
    ;

fragment
SCHAR
    :   ~["\\\r\n]
    |   ESCAPE_SEQUENCE
    |   '\\\n'   // Added line
    |   '\\\r\n' // Added line
    ;

fragment
ESCAPE_SEQUENCE
    :   SIMPLE_ESCAPE_SEQUENCE
    |   OCTAL_ESCAPE_SEQUENCE
    |   HEXADECIMAL_ESCAPE_SEQUENCE
    |   UNIVERSAL_CHARACTER_NAME
    ;

fragment
SIMPLE_ESCAPE_SEQUENCE
    :   '\\' ['"?abfnrtv\\]
    ;

fragment
OCTAL_ESCAPE_SEQUENCE
    :   '\\' OCT_DIGIT OCT_DIGIT? OCT_DIGIT?
    ;

fragment
HEXADECIMAL_ESCAPE_SEQUENCE
    :   '\\x' HEX_DIGIT+
    ;


fragment
HEXADECIMAL_FRACTIONAL_CONSTANT
    :   HEX_DIGIT_SEQUENCE? '.' HEX_DIGIT_SEQUENCE
    |   HEX_DIGIT_SEQUENCE '.'
    ;

fragment
HEX_DIGIT_SEQUENCE
    :   HEX_DIGIT+
    ;

StringLiteral
    :   '\'' CCHAR_SEQUENCE '\''
    |   'L\'' CCHAR_SEQUENCE '\''
    |   'u\'' CCHAR_SEQUENCE '\''
    |   'U\'' CCHAR_SEQUENCE '\''
    ;

fragment
CCHAR_SEQUENCE
    :   CCHAR+
    ;

fragment
CCHAR
    :   ~['\\\r\n]
    |   ESCAPE_SEQUENCE
    ;


//
// numbers
//
/*
NUMBER
    : [0-9]+
    ;

TODO_
*/
NUMBER
    : INTEGER
    | FLOAT_NUMBER
    | IMAG_NUMBER
    ;

// https://docs.python.org/3.12/reference/lexical_analysis.html#integer-literals
fragment INTEGER        : DEC_INTEGER | DEC_ZERO | BIN_INTEGER | OCT_INTEGER | HEX_INTEGER;
fragment DEC_INTEGER    : NON_ZERO_DIGIT ('_'? DIGIT)*;
fragment DEC_ZERO       : '0' ('_'? '0')*;
fragment BIN_INTEGER    : '0' ('b' | 'B') ('_'? BIN_DIGIT)+;
fragment OCT_INTEGER    : '0' ('o' | 'O') ('_'? OCT_DIGIT)+;
fragment HEX_INTEGER    : '0' ('x' | 'X') ('_'? HEX_DIGIT)+;
// fragment NON_ZERO_DIGIT : [1-9];
fragment NON_ZERO_DIGIT : '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
//fragment DIGIT          : [0-9];
fragment DIGIT          : '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
fragment BIN_DIGIT      : '0' | '1';
fragment OCT_DIGIT      : [0-7];
fragment HEX_DIGIT      : DIGIT | [a-f] | [A-F];

// https://docs.python.org/3.12/reference/lexical_analysis.html#floating-point-literals
fragment FLOAT_NUMBER   : POINT_FLOAT | EXPONENT_FLOAT;
fragment POINT_FLOAT    : DIGIT_PART? FRACTION | DIGIT_PART '.';
fragment EXPONENT_FLOAT : (DIGIT_PART | POINT_FLOAT) EXPONENT;
fragment DIGIT_PART     : DIGIT ('_'? DIGIT)*;
fragment FRACTION       : '.' DIGIT_PART;
fragment EXPONENT       : ('e' | 'E') ('+' | '-')? DIGIT_PART;

// https://docs.python.org/3.12/reference/lexical_analysis.html#imaginary-literals
fragment IMAG_NUMBER : (FLOAT_NUMBER | DIGIT_PART) ('j' | 'J');



```

```syntax
stringLiteral
  : STRING_LITERAL
  ;

numberLiteral
  : NUMBER
  ;
```