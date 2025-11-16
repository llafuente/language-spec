# Identifiers

<!--
(6.4.2.1)
(6.4.3)
-->

*Syntax*

```lexer
// Identifier: starts with a letter or underscore, followed by letters, digits, or underscores
Identifier
    :   (ID_Start | '_') (ID_Continue | '_')*
    ;

// Matches any character that can start an identifier (letters, letter numbers, etc.)
fragment ID_Start
    :   [\p{L}\p{Nl}]
    ;

// Matches any character that can continue an identifier (letters, digits, marks, connector punctuation, etc.)
fragment ID_Continue
    :   [\p{L}\p{Nl}\p{Nd}\p{Mn}\p{Mc}\p{Pc}]
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
    :   HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
    ;
```

```syntax
identifier: Identifier;

dollarIdentifier
  : '$' identifier
  ;

dollarIdentifierList
  : dollarIdentifier (',' dollarIdentifier)*
  ;
```

*Semantics*

There are three identifiers.

* All upercased, used for metaprogramming
* Dollar started, used for templates/generics
* The rest, Don't start with a number, dollar or uppercase.
