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

statement
  : CommentLine
  | CommentBlock
  | XtypeDecl
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

end_of_statement
  : (( '\r\n' | '\n' | ';')* | EOF )
  ;

// TODO REVIEW fragment ?
Newline
    :   (   '\r' '\n'?
        |   '\n'
        )
        -> skip
    ;

// fragment
// WS : [ \t\f]+                        -> channel(HIDDEN);
//WS        : [ \t\f]+                -> channel(HIDDEN);
//WHITESPACE: [ \t\f]+                -> channel(HIDDEN);
//Whitespace: [ \t\f]+                -> channel(HIDDEN);


CommentLine
    :   '//' ~[\r\nEOF]*
//        -> skip
    ;

CommentBlock
    :   '/*' .*? '*/'
//        -> skip
    ;
```

*Semantics*

1.

*Constrains*
