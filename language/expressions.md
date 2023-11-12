# Expressions

*Syntax*

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

## Operators

### Operators precedence

| Category               | Operator                                                  | Associativity |
|------------------------|-----------------------------------------------------------|---------------|
| Postfix                | () [] . ++ - -                                            | Left to right |
| Unary                  | +  -  !  ~  ++  -- &amp; typeof new delete                | Right to left |
| Multiplicative         | *  /  %                                                   | Left to right |
| Additive               | +  -                                                      | Left to right |
| Shift                  | &lt;&lt; &gt;&gt;                                         | Left to right |
| Relational             | &lt; &lt;=  &gt; &gt;=                                    | Left to right |
| Equality               | ==  !=                                                    | Left to right |
| Bitwise AND            | &amp;                                                     | Left to right |
| Bitwise XOR            | ^                                                         | Left to right |
| Bitwise OR             | \|                                                        | Left to right |
| Logical AND            | &amp;&amp;                                                | Left to right |
| Logical OR             | \|\|                                                      | Left to right |
| Conditional (**TODO**) | ?:                                                        | Right to left |
| Assignment             | =  +=  -=  *=  /=  %=&gt;&gt;=  &lt;&lt;=  &amp;=  ^= \|= | Right to left |

## Casting

### Implicit castings

*Semantics*

Change the type to another compatible.

*Constrains*

1. It shall not lose precision.

2. It shall not lose width.

*Error examples*
```language
var i32 a = 10
var i16 b = a            // error
var i16 c = cast<i16>(a) // error
```

### Explicit castings

*Semantics*

Change the type to another compatible.

*Constrains*

1. It shall not change shape of the type.

*Example*

```language
var x = cast<i32>(10)
```


<!--
unsafe_cast < type > ( expression )
STUDY: Design notes

* enforce parenthesis?
* alternative sysntax: cast(x)(--) ?
-->

## Operator optimization (Experimental)

If the same operator is chained multiple times over the same type for example:

```language
"a" + "b" + "c"
```

The compiler will try to call operator+(string a, string, b, string c)
instead of two times: operator+(string a, string, b).
If the type support the long operator, it will be used.

## Define custom operators

<!--
https://en.cppreference.com/w/cpp/language/operators
-->

You can define any operator in the language as functions with the name
`operator?`, example: `operator+`.

Those operator have a scope, they are not global.
So if you define a struct, like point in a file, and the operator in another
file, your program need to import both to work with operators.

```language
function operator+(point a, point b) point {
  return point(a.x + b.x, a.y + b.y)
}
```

If you try to define built-in operators you will get an error, for example

```language
function operator+(i8 a,i8 b) point {
  return x + b
}
```

> Operator redefinition at line <file_x>1:1 original <file_y>:1:1



