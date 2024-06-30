# Expressions

*Syntax*

```syntax
/*
expressions
*/

// TODO specific string numeric octal binary hex etc...
constant
    : 'true'                  # primary_expr_true_literal
    | 'false'                 # primary_expr_false_literal
    | 'null'                  # primary_expr_null_literal
    | String_literal          # primary_expr_string_literal
    | Constant                # primary_expr_constant
    | identifier              # primary_expr_identifier
    ;

primary_expr
    : constant                # constantPrimaryExpr
    | '(' expression ')'      # groupPrimaryExpr
    ;

postfix_expr
    // memberAccessExpression
    // TODO this should be a rhs_expression?
    : postfix_expr '[' expression ']'                                                  # postfix_expr_braces
    // TODO slice operator
    | postfix_expr '[' expression ':' expression ']'                                   # postfix_expr_slice
    | postfix_expr '?.' identifier                                                     # postfix_expr_safe_dot
    | postfix_expr '!.' identifier                                                     # postfix_expr_self_dot
    | postfix_expr '.' identifier                                                      # postfix_expr_dot
    // function call
    | postfix_expr '(' argument_expr_list? ')'                                         # postfix_expr_call
    | postfix_expr '.' '#' identifier '(' preprocessorMacroCallArgumentList? ')'       # preprocessorMemberMacroCallExpr
    | preprocessorMacroCallExpr                                                        # preprocessorMacroCallExpr2
    | primary_expr ( '++' | '--' )*                                                    # postfix_expr_idncr
    ;

argument_expr_list
  : conditional_expr (',' conditional_expr)*
  // TODO send arguments by name
  // a = 1, b = 2...
  // send as object
  // expand from array / struct
  // a(@b) a(@{a: 1, b: 2})
  ;


// TODO expand the operator like @postfix_expr
unary_expr
    : unaryNewExpression
    | unaryDeleteExpression
    // NOTE:  there is not sizeof operator
    | ('++' |  '--')* (postfix_expr | unary_operator cast_expr)
    ;

unary_operator
    :   '&' | '*' | '+' | '-' | '~' | '!'
    ;

cast_expr
    :   'cast' '<' typeDefinition '>' '(' cast_expr ')'
    |   unary_expr
    ;

multiplicative_expr
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
    : relational_expr '<' shift_expr  # relational_expr_lt
    | relational_expr '>' shift_expr  # relational_expr_gt
    | relational_expr '<=' shift_expr # relational_expr_lte
    | relational_expr '>=' shift_expr # relational_expr_gte
    | shift_expr                      # relational_expr_fw
    ;

equality_expr
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

operators
  : assignment_operator
  | '||'
  | '&&'
  | '|'
  | '^'
  | '&'
  | '==' | '!='
  | '<' | '>' | '<=' | '>='
  | '<<' | '>>'
  | '-' | '+'
  | '*' | '/' | '%'
  | '<' | '>'
  | unary_operator
  | '--' | '++'
  ;

```

## Operators

### Operators precedence

| Category               | Operator                                                  | Associativity |
|------------------------|-----------------------------------------------------------|---------------|
| Postfix                | () [] !. ?. . ++ - -                                      | Left to right |
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
function operator+(i8 a, readonly i8 b) point {
  return x + b
}
```

> Operator redefinition at line <file_x>1:1 original <file_y>:1:1

#### Unsupported operators

<!--
  TODO reconsider ^ <-- could be power ?
-->

Here is the list of unsupported operators.

* shift_expr: all
* unary_expr: all
* and_expr: all
* exclusive_or_expr: all
* inclusive_or_expr: all
* logicaland_expr: all
* logical_or_expr: all
* conditional_expr: all
* postfix_expr: `operator()`, `operator++`, `operator--`
    * `operator!.` self operator shall not be overriden, as this will remove access to an object that overrides dot.
* assignment_expr: `operator<<=`, `operator >>=`, `operator&=`, `operator^=`, `operator|=`

#### relational_expr operators

`$t` and `$other` can be the same type.

```language
function operator< (readonly $t lhs, readonly $other rhs) bool { /* implement! */ }
function operator> (readonly $t lhs, readonly $other rhs) bool { return rhs < lhs; } // default implementation when < is defined
function operator<=(readonly $t lhs, readonly $other rhs) bool { return !(lhs > rhs); } // default implementation when < is defined
function operator>=(readonly $t lhs, readonly $other rhs) bool { return !(lhs < rhs); } // default implementation when < is defined
```

#### multiplicative_expr operators

`$t` and `$other` can be the same type.

```language
function operator*(readonly $t lhs, readonly $other rhs) lend $t { /* implement! */ }
function operator/(readonly $t lhs, readonly $other rhs) lend $t { /* implement! */ }
function operator%(readonly $t lhs, readonly $other rhs) lend $t { /* implement! */ }
```

#### additive_expr operators

`$t` and `$other` can be the same type.

```language
function operator+(readonly $t lhs, readonly $other rhs) lend $t { /* implement! */ }
function operator-(readonly $t lhs, readonly $other rhs) lend $t { /* implement! */ }defined
```

#### equality_expr operators

`$t` and `$other` can be the same type.

```language
function operator==(readonly $t lhs, readonly $other rhs) bool { /* implement! */ }
function operator!=(readonly $t lhs, readonly $other rhs) bool { return !(lhs == rhs); } // default implementation when == is defined
```

#### assignment_expr operators

`$t` and `$other` can be the same type.

assignament_expr cannot be chained so no `return`

```language
function operator = ($t lhs, readonly $other rhs) {}
function operator *= ($t lhs, readonly $other rhs) {}
function operator /= ($t lhs, readonly $other rhs) {}
function operator %= ($t lhs, readonly $other rhs) {}
function operator += ($t lhs, readonly $other rhs) {}
function operator -= ($t lhs, readonly $other rhs) {}
```

#### cast_expr

This is a very special operator because this allows the compiler to fit your
type in many places. Use it with care.

```language
operator cast($t lhs) $other {}
```


#### postfix_expr

<!--
Member access can be done two different ways, but both share the same principle.
It's forbidden to lend memory.

  TODO study: operator. lend memory
  this is almost mandatory to implement runtime COM objects
-->


```language
function operator [](readonly $t lhs, $other rhs) $another {}
// operator slice
// start == number.MIN means not defined example: arr[:10]
// function operator [:](readonly $t lhs, number start = number.MIN, number end = number.MIN) $another {}
function operator.(readonly $t lhs, string rhs) lend $another {}
```

The operator. it's a very special operator that will call recursive the operator. of a given type.

dot operator is meant


```language
struct ref<$T> {
  ptr<$T> p

  operator.() {
    return __deref(p)
  }
}

struct point {
  float x
  float y
}

ref<point>
```