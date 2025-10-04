# program

*Syntax*

```syntax
// main program entry point!
program
  : endOfStmt* importStmtList? programStmsList? EOF
  ;

programStmsList
  : programStms+
  ;

programStms
  : comments endOfStmt
  | functionDecl endOfStmt
  | operatorFunctionDecl endOfStmt
  // program exclusive!
  | typeDecl endOfStmt
  | globalVariableDeclStmt endOfStmt
  | fileVariableDeclStmt endOfStmt
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
