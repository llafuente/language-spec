# program

*Syntax*

```syntax
// main program entry point!
program
  : importStmtList? preprocessorProgramStmtList? programStmsList? EOF
  ;

programStmsList
  : programStms+
  ;

programStms
  : comments endOfStmt
  | preprocessorDecl endOfStmt
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

endOfStmt: (comments? (NEWLINE_TK | SEMICOLON_TK))+;

```

*Semantics*

1.

*Constrains*
