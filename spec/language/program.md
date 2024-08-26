# program

*Syntax*

```syntax
// main program entry point!
program
  : programStmsList? EOF
  ;

programStmsList
  : (programStms (endOfStmt | EOF))+
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
  : (comments endOfStmt?)* packageDefinitionStmt packageStmsList? EOF
  ;

packageStmsList
  : (packageStmts (endOfStmt | EOF))+
  ;

packageStmts
  : comments
  | functionDecl
  // program exclusive!
  | typeDecl
  | packageVariableDeclStmt
  | fileVariableDeclStmt
  ;

packageDefinitionStmt
  : 'package' identifier endOfStmt
  ;

comments
  : SINGLE_LINE_COMMENT
  | BLOCK_COMMENT
  ;

endOfStmt: (NEWLINE_TK | SEMICOLON_TK)+;

```

*Semantics*

1.

*Constrains*
