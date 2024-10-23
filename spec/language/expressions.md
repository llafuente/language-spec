<!--

  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/

  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/expressions#12126-enumeration-comparison-operators

  https://docs.python.org/3/library/operator.html

-->

# Expressions

*Syntax*

```syntax
/*
expressions
*/

constant
    : 'true'                  # trueLiteralExpr
    | 'false'                 # falseLiteralExpr
    | 'null'                  # nullLiteralExpr
    | 'default'               # defaultValueExpr
    | 'new'                   # newValueExpr
    | stringLiteral           # stringLiteralExpr
    | numberLiteral           # numberLiteralExpr
    | identifier              # identifierExpr
    // typeof is only available inside postfixCallExpr
    | 'typeof'                # typeofIdentifierExpr
    | preprocessorExpr        # preprocessorExpr2
    ;

primary_expr
    : constant                   # constantPrimaryExpr
    | arrayInitializer           # arrayInitializer2
    | structConstantInitializer  # structInitializer2
    | structInitializer          # structInitializer2
    | '(' expression ')'         # groupPrimaryExpr
    ;

memberIdentifier
    : identifier | 'default' | 'new' ;

postfixMemberAccessExpr: postfix_expr '.' memberIdentifier;

postfix_expr
    // memberAccessExpression
    // TODO this should be a rhs_expression?
    : postfix_expr '![' expression ']'                                                 # postfixSelfElementAccessExpr
    | postfix_expr '?[' expression ']'                                                 # postfixSafeElementAccessExpr
    | postfix_expr '[' expression ']'                                                  # postfixElementAccessExpr
    // TODO slice operator
    | postfix_expr '[' expression ':' expression ']'                                   # postfixSliceExpr
    | postfix_expr '?.' memberIdentifier                                               # postfixSafeMemberAccessExpr
    | postfix_expr '!.' memberIdentifier                                               # postfixSelfMemberAccessExpr
    | postfix_expr '.' memberIdentifier                                                # postfixMemberAccessExpr2
    // function call
    | postfix_expr '(' argumentExprList? ')'                                           # postfixCallExpr
    //| postfix_expr '.' '#' identifier '(' preprocessorMacroCallArgumentList? ')'     # preprocessorMemberMacroCallExpr
    //| preprocessorMacroCallExpr                                                      # preprocessorMacroCallExpr2
    | primary_expr ( '++' | '--' )*                                                    # postfixIndecrementExpr
    ;

namedArgument
    : identifier '=' conditional_expr
    ;

orderedArgument
    : conditional_expr
    ;


argumentExprList
  : (namedArgument | orderedArgument) (',' (namedArgument | orderedArgument))*
  // TODO 
  // send as object
  // expand from struct / variable
  // use spread operator? ...b ...{}
  // a(@b) a(@{a: 1, b: 2})
  ;


// TODO expand the operator like @postfix_expr
unary_expr
    : unaryNewExpression                                        # unaryNewExpr
    | unaryDeleteExpression                                     # unaryDeleteExpr
    // NOTE:  there is not sizeof operator
    | ('++' |  '--')* (postfix_expr | unary_operator cast_expr) # operatorUnityExpr
    ;

unary_operator
    :   '@' | '&' | '*' | '+' | '-' | '~' | '!' | 'not'
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
    : shift_expr '<' '<' additive_expr # shift_expr_left
    | shift_expr '>' '>' additive_expr # shift_expr_right
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
    // memory equality (pointer comparation)
    : equality_expr '===' relational_expr # equality_expr_eqp
    // memory inequality (pointer comparation)
    | equality_expr '!==' relational_expr # equality_expr_nep
    // floating point equality: abs(left - right) < epsilon
    | equality_expr '~=' relational_expr # equality_expr_almost_equal
    // type equality
    | equality_expr '==' relational_expr # equality_expr_eq
    // type inequality
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
    :   inclusive_or_expr (('&&' | 'and') logicaland_expr)*
    ;

logical_or_expr
    :   logicaland_expr (('||' |'or') logical_or_expr)*
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

rhsExpr
  : conditional_expr
  | anonymousFunctionDef functionBody
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
| Postfix                | () ?[] ![] [] !. ?. . ++ --                               | Left to right |
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


<!--

    Experimental operators

    Nullish coalescing assignment
    ??=
    assign if left is null

    =??

    assign if right is not null

-->    

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



<a name="operator-overloading"></a>
## structure/object operators (operator overloading)

*Semantics*

Customizes the operators for operands of user-defined types.


### Binary arithmetic

Binary arithmetic operators operates over two types and return a new one.

* `+`: addition
* `-`: subtraction
* `*`: multiplication
* `/`: division
* `^`: power

*Constraints*

1. Definition for all binary arithmetic

> lend? ref<struct> operator X (ref<struct> lhs, readonly ref<struct> rhs)

*Example*

```language
type point = struct {
  float x
  float y

  operator +(point b) point {
    return point(a.x + b.x, a.y + b.y)
  }
  operator +(float z) point {
    return point(a.x + z, a.y + z)
  }
}

function main() {
  var a = point(1, 2)
  var b = point(3, 4)
  var c = a + b

  #assert c.x ~== 4
  #assert c.y ~== 6
  #assert typeof c.y == point
  
  c = a + 5.5
  #assert c.x ~== 6.5
  #assert c.y ~== 7.5
}
```

### Assignament operators

Assignament operators operates over two types, modify the first one and return a copy or the first one.

* `=`: assignament 
* `+=`: addition assignament
* `-=`: subtraction assignament
* `*=`: multiplication assignament
* `/=`: division assignament
* `^=`: power assignament
* `~=`: floating point equality

*Constraints*

1. Definition for all assignaments

> lend? ref<struct> operator X (ref<struct> lhs, readonly ref<struct> rhs)

### Comparison operators

Comparison operators compare two types and return a boolean

*Constraints*

1. Definition for all comparison

> bool operator X (ref<struct> lhs, readonly ref<struct> rhs)

2. If `operator<` is defined the others are implicit as desrcibed

```language
bool operator >  (readonly ref<$T> lhs, readonly ref<$T> rhs) { return rhs < lhs; }
bool operator <= (readonly ref<$T> lhs, readonly ref<$T> rhs) { return !(lhs > rhs); }
bool operator >= (readonly ref<$T> lhs, readonly ref<$T> rhs) { return !(lhs < rhs); }
```

3. If `operator==` is defined the `!=` are implicit as desrcibed

```language
bool operator != (readonly ref<$T> lhs, readonly ref<$T> rhs) { return !(lhs == rhs); }
```

*Example*

```language
type floatWapper = struct {
  float value

  bool operator ==  (readonly ref<$T> rhs) { return this.value == lhs.value; }
  bool operator <  (readonly ref<$T> rhs) { return this.value < lhs.value; }
  bool operator >  (readonly ref<$T> rhs) { return this < lhs; }
  bool operator <= (readonly ref<$T> rhs) { return !(this > rhs); }
  bool operator >= (readonly ref<$T> rhs) { return !(this < rhs); }

}
```

## Array subscript operator

*Semantic*

Provides array-like access to a struct.

*Constraints*

1. Definition shall be compatible

> any operator [] (readonly ref<struct> lhs, any rhs)
> ref<struct> operator []= (ref<struct> lhs, any rhs)


## Member access (unary)

*Semantic*

Provides a seamnless encapsulation method it also providen a easy extension method at user code.

* `.`: member access
* `?.`: safe member access

*Constraints*

1. Definition shall be compatible

> any operator . (readonly ref<struct> lhs)
> any operator ?. (ref<struct> lhs)

2. Max operator recursion is 10.


*Example*

```language
type myref = struct<$T> {
  ref<$T> p

  uninitialized $T operator new() {
    return intrinsics_deref(this.p)
  }

  $T operator.() {
    return intrinsics_deref(this.p)
  }
}

struct point {
  float x
  float y
}

function main() {
    var pp = new myref<point>()(1, 2)
    print(pp.x, pp.y)
}
```
```






#### cast_expr

This is a very special operator because this allows the compiler to fit your
type in many places. Use it with care.

```language
operator cast($t lhs) $other {}
operator autocast($t lhs) $other {}
```
