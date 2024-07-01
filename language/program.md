# program

*Syntax*

```syntax
// main program entry point!
program
  : programStmsList? EOF
  ;

programStmsList
  : (programStms end_of_statement)*
  ;

programStms
  : comments
  | functionDecl
  // program exclusive!
  | typeDecl
  | globalVariableDeclStmt
  | fileVariableDeclStmt
  ;


// package entry point!
packageProgram
  : (comments end_of_statement?)* packageDefinition end_of_statement packageStmsList? EOF
  ;

packageStmsList
  : (packageStmts end_of_statement)*
  ;

packageStmts
  : comments
  | functionDecl
  // program exclusive!
  | typeDecl
  | packageVariableDeclStmt
  | fileVariableDeclStmt
  ;

packageDefinition
  : 'package' identifier
  ;

/*
blockStmt
  : '{' statement '}'
  ;
*/

comments
  : SINGLE_LINE_COMMENT
  | BLOCK_COMMENT
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
