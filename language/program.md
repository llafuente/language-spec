# program

```syntax
program
  : program_stms_list EOF
  ;

program_stms_list
  //: program_stms end_of_statement (program_stms end_of_statement)*
  : (program_stms end_of_statement)+
  ;

program_stms
  : type_decl
  | function_decl
  | global_variable_declaration_statement
  | file_variable_declaration_statement
  | expression
  | Comment_line
  | Comment_block
  ;

end_of_statement
  : ( '\r\n' | '\n' | ';' | EOF )
  ;

Whitespace
    :   [ \t]+
        -> skip
    ;

// TODO REVIEW fragment ?
Newline
    :   (   '\r' '\n'?
        |   '\n'
        )
        -> skip
    ;

fragment
WS : (' ' | '\t' | '\r' | '\n')* -> skip;

Comment_line
    :   '//' ~[\r\n]*
        -> skip
    ;

Comment_block
    :   '/*' .*? '*/'
        -> skip
    ;
```
