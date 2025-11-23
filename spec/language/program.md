# program

*Syntax*

```syntax
// main program entry point!
program
  : preprocessorProgramStmtList? importStmtList? programStmsList? EOF
  ;

programStmsList
  : programStms+
  ;

programStms
  : comments endOfStmt
  | preprocessorDecl endOfStmt
  | preprocessorStmts endOfStmt
  | functionDecl endOfStmt
  | operatorFunctionDecl endOfStmt
  // program exclusive!
  | typeDecl endOfStmt
  | globalVariableDeclStmt endOfStmt
  | fileVariableDeclStmt endOfStmt
  | testStmt endOfStmt
  | endOfStmt
  ;

comments
  : SINGLE_LINE_COMMENT
  | BLOCK_COMMENT
  ;

endOfStmt: (comments? (NEWLINE_WIN_TK | NEWLINE_LINUX_TK | SEMICOLON_TK))+;

ws: (comments | NEWLINE_WIN_TK | NEWLINE_LINUX_TK)+;

```

*Semantics*

1.

*Constrains*
