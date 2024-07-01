# Identifiers

<!--
(6.4.2.1)
(6.4.3)
-->
```syntax
IdentifierLow
    :   IDENTIFIERLOW_NON_DIGIT
        (   IDENTIFIER_NON_DIGIT
        |   DIGIT
        )*
    ;

IdentifierUp
    :   IDENTIFIERUP_NON_DIGIT
        (   IDENTIFIER_NON_DIGIT
        |   DIGIT
        )*
    ;

fragment
IDENTIFIERLOW_NON_DIGIT
    :   NON_DIGIT_LOW
    |   UNIVERSAL_CHARACTER_NAME
    ;
fragment
IDENTIFIERUP_NON_DIGIT
    :   NON_DIGITUP
    |   UNIVERSAL_CHARACTER_NAME
    ;

IDENTIFIER_NON_DIGIT
    :   NON_DIGIT
    |   UNIVERSAL_CHARACTER_NAME
    ;

fragment
NON_DIGIT
    :   [a-zA-Z_]
    ;

fragment
NON_DIGIT_LOW
    :   [a-z_]
    ;

fragment
NON_DIGITUP
    :   [A-Z]
    ;


fragment
NON_ZERO_DIGIT
    :   [1-9]
    ;

fragment
DIGIT
    :   [0-9]
    ;

fragment
UNIVERSAL_CHARACTER_NAME
    :   '\\u' HEX_QUAD
    |   '\\U' HEX_QUAD
    |   '\\U' HEX_QUAD HEX_QUAD
    |   '\\U' HEX_QUAD HEX_QUAD HEX_QUAD
    |   '\\U' HEX_QUAD HEX_QUAD HEX_QUAD HEX_QUAD
    ;

fragment
HEX_QUAD
    :   HEXADECIMAL_DIGIT HEXADECIMAL_DIGIT HEXADECIMAL_DIGIT HEXADECIMAL_DIGIT
    ;

fragment
HEXADECIMAL_DIGIT
    :   [0-9a-fA-F]
    ;
```
