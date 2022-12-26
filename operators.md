# Operators

## Operators precedence

| Category               | Operator                                                  | Associativity |
|------------------------|-----------------------------------------------------------|---------------|
| Postfix                | () [] . ++ - -                                            | Left to right |
| Unary                  | +  -  !  ~  ++  - -  (type)* &amp; sizeof typeof          | Right to left |
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


## casting

```syntax
cast < type > ( expression )
unsafe_cast < type > ( expression )
```
<!--

STUDY: Design notes

* enforce parenthesis?
* alternative sysntax: cast(x)(--) ?
-->

## Operator optimization (Under study)

If the same operator is chained multiple times over the same type for example:

```language
"a" + "b" + "c"
```

The compiler will try to call operator+(string a, string, b, string c)
instead of two times: operator+(string a, string, b).
If the type support the long operator, it will be used.

## Custom operators

You can define any new operator in the language as functions with the name
`operator???`.

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
  return point(a.x + b.x, a.y + b.y)
}
```

> Operator redefinition at line <file_x>1:1 original <file_y>:1:1



