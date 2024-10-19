# program

*Syntax*

```syntax
// main program entry point!
program
  : programStmsList? EOF
  ;

programStmsList
  : programStms+
  ;

programStms
  : comments endOfStmt
  | functionDecl endOfStmt
  // program exclusive!
  | typeDecl endOfStmt
  | globalVariableDeclStmt endOfStmt
  | fileVariableDeclStmt endOfStmt
  | endOfStmt
  ;


// package entry point!
packageProgram
  : (comments endOfStmt?)* packageDefinitionStmt packageStmsList? EOF
  ;

packageStmsList
  : packageStmts+
  ;

packageStmts
  : comments endOfStmt
  | functionDecl endOfStmt
  // program exclusive!
  | typeDecl endOfStmt
  | packageVariableDeclStmt endOfStmt
  | fileVariableDeclStmt endOfStmt
  | endOfStmt
  ;

packageDefinitionStmt
  : 'package' identifier endOfStmt
  ;

comments
  : SINGLE_LINE_COMMENT
  | BLOCK_COMMENT
  ;

endOfStmt: (comments? (NEWLINE_TK | SEMICOLON_TK))+;

```

*Semantics*

1.

*Constrains*
