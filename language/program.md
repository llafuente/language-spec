# program

*Syntax*

```syntax
program
  : programStmsList? EOF
  ;

programStmsList
  : (programStms end_of_statement)*
  ;

programStms
  : statement
  ;

comments
  : SINGLE_LINE_COMMENT
  | BLOCK_COMMENT
  ;

statement
  : comments
  | typeDecl
  | functionDecl
  | expression
  ;

  /*
  | function_decl
  | global_variable_declaration_statement
  | file_variable_declaration_statement
  | expression
  // for testing purposes
  | selectionStmt
  ;
  */

blockStmt
  : '{' statement '}'
  ;

end_of_statement: (NEWLINE_TK | SEMICOLON_TK)* | EOF;

identifier: IdentifierLow | IdentifierUp ;

dollarIdentifier
  : '$' identifier
  ;

dollarIdentifierList
  : dollarIdentifier (',' dollarIdentifier)*
  ;


preprocessorMacroCallArgumentList
  : '$'
  ;

preprocessorMacroCallExpr
  : '$'
  ;
```

*Semantics*

1.

*Constrains*
