# Identifiers

<!--
(6.4.2.1)
(6.4.3)
-->
```syntax
Identifier
    :   (IDENTIFIER_NON_DIGIT | '$')
        (   IDENTIFIER_NON_DIGIT
        |   DIGIT
        )*
    ;

identifier_list
    :   Identifier? (',' Identifier?)*
    ;
fragment
IDENTIFIER_NON_DIGIT
    :   NON_DIGIT
    |   UNIVERSAL_CHARACTER_NAME
    //|   // other implementation_defined characters...
    ;
fragment
NON_DIGIT
    :   [a-zA-Z_]
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
