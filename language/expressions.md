# Expressions

```syntax
/*
expressions
*/

primary_expr
    : Identifier
    | String_literal
    | Constant
    | '(' expression ')'
    ;

postfix_expr
    // memberAccessExpression
    // TODO this should be a single expression
    : postfix_expr '[' expression ']'              # postfix_expr_braces
    | postfix_expr '.' Identifier                  # postfix_expr_dot
    // function call
    | postfix_expr '(' argument_expr_list? ')'     # postfix_expr_call
    | primary_expr ( '++' | '--' )*                # postfix_expr_idncr
    // NOTE:  there is not -> operator
    ;

argument_expr_list
  : assignment_expr (',' assignment_expr)*
  ;


// TODO expand the operator like @postfix_expr
unary_expr
    : 'new' type_ref '(' argument_expr_list? ')'
    // TODO this should be a single expression
    | 'new' type_ref '[' expression ']'
    | 'delete' Identifier

    // NOTE:  there is not sizeof operator
    | ('++' |  '--')* (postfix_expr | unary_operator cast_expr)
    ;

unary_operator
    :   '&' | '*' | '+' | '-' | '~' | '!'
    ;

cast_expr
    :   'cast' '<' type_ref '>' '(' cast_expr ')'
    |   unary_expr
    ;

multiplicative_expr
//    :   castExpression (('*'|'/'|'%') castExpression)*
    :   multiplicative_expr '*' cast_expr # multiplicative_expr_mult
    |   multiplicative_expr '/' cast_expr # multiplicative_expr_div
    |   multiplicative_expr '%' cast_expr # multiplicative_expr_mod
    |   cast_expr                         # multiplicative_expr_fw
    ;

additive_expr
//    :   multiplicative_expr (('+'|'-') multiplicative_expr)*
    : additive_expr '+' multiplicative_expr # additive_expr_add
    | additive_expr '-' multiplicative_expr # additive_expr_sub
    | multiplicative_expr                   # additive_expr_fw
    ;

shift_expr
//    :   additive_expr (('<<'|'>>') additive_expr)*
    : shift_expr '<<' additive_expr # shift_expr_left
    | shift_expr '>>' additive_expr # shift_expr_right
    | additive_expr                 # shift_expr_fw
    ;

relational_expr
//    :   shift_expr (('<'|'>'|'<='|'>=') shift_expr)*
    : relational_expr '<' shift_expr  # relational_expr_lt
    | relational_expr '>' shift_expr  # relational_expr_gt
    | relational_expr '<=' shift_expr # relational_expr_lte
    | relational_expr '>=' shift_expr # relational_expr_gte
    | shift_expr                      # relational_expr_fw
    ;

equality_expr
//    :   relational_expr (('=='| '!=') relational_expr)*
    : equality_expr '==' relational_expr # equality_expr_eq
    | equality_expr '!=' relational_expr # equality_expr_neq
    | relational_expr                    # equality_expr_fw
    ;

and_expr
    :   equality_expr ( '&' and_expr)*
    ;

exclusive_or_expr
    :   and_expr ('^' exclusive_or_expr)*
    ;

inclusive_or_expr
    :   exclusive_or_expr ('|' inclusive_or_expr)*
    ;

logicaland_expr
    :   inclusive_or_expr ('&&' logicaland_expr)*
    ;

logical_or_expr
    :   logicaland_expr ( '||' logical_or_expr)*
    ;

conditional_expr
    :   logical_or_expr ('?' expression ':' conditional_expr)?
    ;

assignment_expr
    :   conditional_expr
    |   unary_expr assignment_operator assignment_expr
    ;

assignment_operator
    :   '=' | '*=' | '/=' | '%=' | '+=' | '-=' | '<<=' | '>>=' | '&=' | '^=' | '|='
    ;

expression
    : assignment_expr (',' assignment_expr)*
    ;

rhs_expression
  : conditional_expr
  ;

```



```language
10
10.0
1e10
1+1
1-1
"xxxx"
```
