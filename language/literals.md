# Literals / Constants

<!--
same as c, but we want to support advanced staff like
10s <-- 10 seconds, so we should remove the suffix staff for something flexible
(6.4.4)
(6.4.5)
-->

```syntax
/*
  literal / constants
*/

Constant
  : Integer_constant
  | Floating_constant
  // TODO study enumeration must be named, so it's a member access
  // | enumeration_literal
  | Character_constant
  ;

fragment
Integer_constant
  : DECIMAL_CONSTANT INTEGER_SUFFIX?
  | OCTAL_CONSTANT INTEGER_SUFFIX?
  | HEXADECIMAL_CONSTANT INTEGER_SUFFIX?
  | BINARY_CONSTANT
  ;

fragment
BINARY_CONSTANT
  : '0' [bB] [0-1]+
  ;

fragment
HEXADECIMAL_CONSTANT
  : HEXADECIMAL_PREFIX HEXADECIMAL_DIGIT+
  ;

fragment
HEXADECIMAL_PREFIX
  : '0' [xX]
  ;

// TODO study, this is necessary, we should be able to guest ?
fragment
INTEGER_SUFFIX
  : 'U'
  | 'UL'
  | 'ULL'
  ;

fragment
OCTAL_CONSTANT
  :   '0' OCTAL_DIGIT*
  ;

fragment
DECIMAL_CONSTANT
  : NON_ZERO_DIGIT DIGIT*
  ;

String_literal
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
    :   '\\' OCTAL_DIGIT OCTAL_DIGIT? OCTAL_DIGIT?
    ;

fragment
HEXADECIMAL_ESCAPE_SEQUENCE
    :   '\\x' HEXADECIMAL_DIGIT+
    ;

fragment
OCTAL_DIGIT
    :   [0-7]
    ;

Floating_constant
    :   DECIMAL_FLOATING_CONSTANT
    |   HEXADECIMAL_FLOATING_CONSTANT
    ;

fragment
DECIMAL_FLOATING_CONSTANT
    :   FRACTIONAL_CONSTANT EXPONENT_PART? FLOATING_SUFFIX?
    |   DIGIT_SEQUENCE EXPONENT_PART FLOATING_SUFFIX?
    ;

fragment
HEXADECIMAL_FLOATING_CONSTANT
    :   HEXADECIMAL_PREFIX (HEXADECIMAL_FRACTIONAL_CONSTANT | HEXADECIMAL_DIGIT_SEQUENCE) BINARY_EXPONENT_PART FLOATING_SUFFIX?
    ;

fragment
FLOATING_SUFFIX
    :   [flFL]
    ;

fragment
BINARY_EXPONENT_PART
    :   [pP] SIGN? DIGIT_SEQUENCE
    ;

fragment
FRACTIONAL_CONSTANT
    :   DIGIT_SEQUENCE? '.' DIGIT_SEQUENCE
    |   DIGIT_SEQUENCE '.'
    ;

fragment
EXPONENT_PART
    :   [eE] SIGN? DIGIT_SEQUENCE
    ;

fragment
SIGN
    :   [+-]
    ;

fragment
HEXADECIMAL_FRACTIONAL_CONSTANT
    :   HEXADECIMAL_DIGIT_SEQUENCE? '.' HEXADECIMAL_DIGIT_SEQUENCE
    |   HEXADECIMAL_DIGIT_SEQUENCE '.'
    ;

fragment
HEXADECIMAL_DIGIT_SEQUENCE
    :   HEXADECIMAL_DIGIT+
    ;

DIGIT_SEQUENCE
  :   DIGIT+
;

Character_constant
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

```
