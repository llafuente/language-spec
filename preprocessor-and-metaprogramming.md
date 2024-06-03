# Preprocessor and Metaprogramming

Preprocessor and metaprograming both share the same purpose, to generate code,
but at different compilation stage.
Both have the same syntax and should be understood as a whole.

<!--
  https://gcc.gnu.org/onlinedocs/cpp/Macros.html
  https://en.wikipedia.org/wiki/Preprocessor
  https://en.wikipedia.org/wiki/Metaprogramming
  https://files.nothingisreal.com/software/gpp/gpp.html
  https://github.com/logological/gpp/blob/master/src/gpp.c

  https://gcc.gnu.org/onlinedocs/cpp/Variadic-Macros.html

  https://docs.julialang.org/en/v1/devdocs/reflection/
-->

Implementation notes.

* Max recursion for any macro declaration is 5.

## `#define`

*syntax*

```syntax
define_decl
  : '#define' IdentifierUp any_non_endl ENDL
  ;
```

*Semantics*

Defines a direct text substitution. Unlike c/cpp does not have arguments.

It's the way the main program configure packages.

*Constrains*

1. The identifier must be uppercased.

2. It shall be just one line.

3. `#define` is scoped.

`#define` at program entry point it's available in every file in the program.

`#define` at package entry point it's available in every file in that package.

`#define` at block scope can be used outside the block.

4. If a define is redefined a semantic-error shall be raised.

4. Shall not be used inside functions


*Remarks*

There is no `#undef`, so package developers should append a unique prefix to
theirs definitions.

*Example*

```language
#define PI 3.1496
#define HALF_PI (#PI# * 0.5)
```

## `#macro`

*syntax*

```syntax
macro_modifier
  : '#text'
  | '#value'
  | '#list'
  | '#value_list'
  ;

macro_argument_list
  : macro_modifier Identifier (',' macro_argument_list)
  ;

macro_decl
  : '#macro' Identifier '(' macro_argument_list? ')' '#block'? function_body
  ;
```

*Semantics*

Creates a function-like macro that can take arguments.

A macro can fetch next block of code and expanded inside it's own block see [`#block`](#macro-block).

*Constraints*

1. A `#macro` is always inlined at macro-call.

2. `#macro` body shall have the same statements as functions.

<!--
The compiler will choose when to expand depending on what inputs require the macro.
-->

2. Each macro arguments can declares can how to handle input:
* [`#text`](#macro-text) (default)
* [`#value`](#macro-value)

3. If a macro fetch the next block of code must use it inside.

4. When expanding a macro will create a new block at call site to keep
everything declared in the macro inside it's own scope.

5. A macro function shall not `return`. If used shall raise an syntax-error.

This is an error.

```language-err
#macro ret() {
  return 0
}

function test(): number {
  #ret()
}
```

6. A macro call shall not be part of a expression.

This is an error.

```language-err
#macro expr() {
  1 + 1
}

function test(): number {
  var x = #expr()

  return x
}
```

7. A macro function need to be syntax valid code by it's own.

8. Inside a `#macro`: `#macro`, `#define` are forbidden.

9. A macro argument is everything not comma and parenthesis will be honored,
no open parenthesis will be allowed without the closing match.
These prevent unshielded commas.

*Examples*
A macro can access variables outside its scope but no the other way around.

```language
#macro m_sum() {
  var x = 10
  c = a + b
}

function sum(i8 a, i8 b) {
  var c
  #m_sum()
  // print(x) <-- // this is a semantic error, variable not found

  return c
}
```

<a name="macro-arguments"></a>
### arguments

To expand an argument use `#` followed by the name of the argument and `#` again.

To stringify the argument use `##` followed by the name of the argument and `#` again.
The string is double quote escaped.

<a name="macro-text"></a>
### `#text` argument

*semantics*

`#text` is a macro argument modifier that tell that fetch the entire expression
as text.

This is the default method so `#text` it's optional.

*Example*

```language
// Declaration
#macro print_text(#text t) {
  print("#t#") // it will print t text value
  print(##t#) // it will stringify t value and create a double quote string
}

// Usage
#print_text(xxx.ccc)                                // ok
#print_text(any_valid_exression())                  // ok
#print_text(even-not-valid-staff-is-allowed ? .-)   // ok
#print_text(someone do not space quotes ")          // ko
```

Expansion:
```
{
  print("xxx.ccc")
  print("xxx.ccc")
}
{
  print("any_valid_exression()")
  print("any_valid_exression()")
}
{
  print("even-not-valid-staff-is-allowed ? .-")
  print("even-not-valid-staff-is-allowed ? .-")
}
{
  print("someone do not space quotes "")
  print("someone do not space quotes \"")
}

```

<a name="macro-value"></a>
### `#value` argument

*semantics*

`#value` is a macro argument modifier that make the expression to be evaluated
and assigned to a local variable.

*Constraints*

1. Given expression must be a valid rhs

2. Expression shall be evaluated only once at the top of the expansion.


*Example*

```language
// declaration
#macro print_type(#value v) {
  print(typeof(#v#), "=", #v#)
}
// usage
#print_type(10+5)
#print_type(10+5.2)
```

*Expansion*
```
// declaration
// usage
{
  var unique_name = 10+5;
  print(typeof(unique_name), unique_name);
}
{
  var unique_name = 10+5.2;
  print(typeof(unique_name), unique_name);
}
```

*Output*
```
i8 = 17
float = 17.2
```

*Example 2*

```language
// Declaration
#macro safe_sum(#text result, #value lhs, #value rhs, #text overflow) {

  if (lhs >= 0) {
    if (type(lhs).max - lhs < rhs) {
      overflow = true;
    }
  } else {
    if (rhs < type(rhs).min - lhs) {
      overflow = true;
    }
  }

  result = lhs + rhs
}
// Usage
var a: i8 = 120;
var b: i8 = 120;
var r: i8 = 0;
var overflowed = false;

#safe_sum(r, a, b, overflowed)
print ("value", r, "overflowed?", overflowed)
```

*Expansion 2*
```
var a: i8 = 120;
var b: i8 = 120;
var r: i8 = 0;
var overflowed = false;

{
  var unique_name = a;
  var unique_name2 = b;

  if (unique_name >= 0) {
    if (type(unique_name).max - unique_name < unique_name2) {
      overflowed = true;
    }
  } else {
    if (unique_name2 < type(unique_name2).min - unique_name) {
      overflowed = true;
    }
  }

  result = unique_name + unique_name2
}
print ("value", r, "overflowed?", overflowed)
```

<a name="macro-block"></a>
### `#block`

*semantics*

`#block` is a macro modifier that force the a macro call to be followed by a
block, that will be expanded inside the macro.

*Constrains*

*Example*:

This is almost how we implement `foreach` internally in the language.

```language
// declaration
#macro foreach_v(#value value, #value itr_able) #block {
  #assert typeof(#itr_able#) implements Iterable

  #itr_able#.reset()
  for (int i = 0; i < #itr_able#.length; ++i) {
    #value# := #itr_able#[i]
    #block#
    #itr_able#.next()
  }
}

#macro foreach_kv(#value key, #value value, #value itr_able) #block {
  #assert typeof(#itr_able#) implements Iterable

  #itr_able#.reset()
  for (int i = 0; i < #itr_able#.length; ++i) {
    key, value := #itr_able#.get_key_value(i);
    #block#
    #itr_able#.next()
  }
}

// Usage:

foreach_v(it, [1,2,3,4]) {
  print it;
}

list := [1,2,3,4]
foreach_v(it, list) {
  print it;
}

foreach_kv(key, it, [1,2,3,4]) {
  print key, it;
}
```

*Expansion*
```
{ // expanding foreach arguments
  itr_able_unique := [1,2,3,4];

  // expanding foreach body
  #check itr_able_unique implements Iterable
  for (int unique_000_i = 0; unique_000_i < itr_able_unique; ++i) {
    it := itr_able_unique[i];
    {
      print it;
    }
  }
}

list := [1,2,3,4]

{ // expanding foreach
  itr_able_unique := list;
  for (int unique_000_i = 0; unique_000_i < itr_able_unique; ++i) {
    it := itr_able_unique[i];
    {
      print it;
    }
  }
}

{ // expanding foreach
  itr_able_unique := list;
  for (int unique_000_i = 0; unique_000_i < itr_able_unique; ++i) {
    key, value := itr_able_unique.get_key_value(i);
    {
      print key, it;
    }
  }
}

```

## `#forstruct`

*Syntax*

```syntax
forstruct_stmt
  : '#forstruct' Identifier ',' Identifier 'in' expression function_body
  ;
```
*Semantics*

`#forstruct` will loop the `struct` properties.

*Constraints*

1. `#forstruct` shall be part of metaprogramming expansion. So a `#macro` containing
`#forstruct` shall be marked as metaprogramming to be expanded later.


*Example*

```language
struct point {
  i8 x
  i8 y
}
var p = point(5, 7)

// #forstruct i, k in typeof(p) {
#forstruct i, k in point {
  print(#i#, "#k#", p.#k#)
}

```

Expansion:
```
struct point {
  i8 x
  i8 y
}
print(0, "x", p.x)
print(1, "y", p.y)
```


## `#assert`

*syntax*

```syntax
asset_stmt
  : '#assert' expression ',' string_literal ENDL
  ;
```

*Semantics*

Raise a compile time error if condition yield false.

`#assert` check will be delayed until macros expanded and all types are resolved.

*Constraints*

1. `#assert` shall be part of metaprogramming expansion.

2. expression type shall be bool.

*Example*

```
#assert x == 1
#assert arr.length != 0
#assert #PI# > 3.1
```
## `#static_assert`

```
#assert typeof x == typeof y
#static_assert sizeof(x) > 16
#static_assert x implements comparable
```

## `#exec`

*syntax*

```syntax
exec_stmt
  : '#exec' non_endl
  ;
```

*Semantics*

Execute given command:
* if exit code is 0: It will include its standard output in the current output
* if exit code is not 0: It will stop compilation and display an error.

This is only available in main program code. For security reasons it disallowed
in libraries.

The output of the command won't be re-evaluated.


## `#uid`

*Syntax*

```syntax
uid_stmt
  : '#uid' Identifier
  ;
```

*Semantics*

It generates a unique number per expansion.


*Example*
```language
#uid BLOCK_UID

start_#BLOCK_UID#:
// do some mad science
if (true) {
  goto end_#BLOCK_UID#
}
// more mad science
end_#BLOCK_UID#:
```


## `#line`

*Syntax*

```syntax
'#' line
```

*Semantics*

Display current line


## `#file`

*Syntax*

```syntax
'#' file
```

*Semantics*

Display current file

## `#date` [*TODO*: format]

*Syntax*

```syntax
'#' date
```

*Semantics*

Display current date.

*Constraints*

Date format can be configured using compiler flag `PREPROCESSOR_DATE_FORMAT`

*Example*
```language
#set preprocessor.date.format YYYY-mm-DD

print(##date)
```

## `#error msg`

*Syntax*

```syntax
'#' error text ENDL
```

*Semantics*

Display the error message and abort compilation.


## `#warning msg`

*Syntax*

```syntax
'#' warning text ENDL
```

*Semantics*

Display the warning message but continue compilation.

## `#type_error msg`

*Syntax*

```syntax
'#' type_error text ENDL
```

*Semantics*

Display a type error message and abort compilation.

### #repeat (line repeater)

*Syntax*

```syntax
identifier_list = identifier , identifier_list
'#' repeat '(' identifier_list ')'
```

*Semantics*

This macro will repeat current line for each text sent.

*Constraints*

1. If two line repeater are found in the same line both must have the same number
of values because both will be expanded at the same time.

*Example*

Input
```
doSomething(#repeat (a,b,c))
```

Generate
```
doSomething(a)
doSomething(b)
doSomething(c)
```

*Example*

Input
```
#repeat(a,b,c).doSomething()
```

Generate
```
a.doSomething()
b.doSomething()
c.doSomething()
```

*Example*

Input
```
#repeat (a1,b1,c1).doSomething(#repeat (a2,b2,c2))
```

Generate
```
a1.doSomething(a2)
b1.doSomething(b2)
c1.doSomething(c2)
```

## list of macro errors


#### Errors

```language
// Declaration
#macro print_text(#text t) {
  print("#t#")
}

print_text((xy)
```

```error
Invalid macro argument: Not closed parentheses started at line 6:11
```

```language
// Declaration
#macro print_text(#text t) {
  print("#t#")
}

#print_text(x,y)
```

```error
Invalid macro arguments count: expected 1 found 2 at line 6
```

```language
// Declaration
#macro print_text(#text t) {
  print("#t#")
}

#print_text(mess with quotes " compilation)
")
}
```

```error
End of file reached with an unclosed string started at line 7:1
```


```language
// Declaration
#macro print_text(#text t) {
  print("#t#)
}

#print_text(this is a mess)
")
}
```

```error
Syntax error unclosed string started at line 3:10
while expanding print_text at line 5.


{
  print("this is a mess)
        ^
}
```


```language
#macro if() {
}
```

```error
Syntax error: Invalid macro name: used a reserved macro name at line 3:10
(if, define, macro, forstruct, assert, repeat, line, file, date, error, warning, exec, block, value, text, uid)

#macro if() {
       ^
}
```

```language
#macro test(#text if) {
}
```

```error
Syntax error: Invalid macro argument name: used a reserved macro name at line 3:10
(if, define, macro, forstruct, assert, repeat, line, file, date, error, warning, exec, block, value, text, uid)

#macro test(#text if) {
                  ^
}
```

```language
#macro test(#if a) {
}
```

```error
Syntax error: Invalid macro argument modifier: expected #text or #value line 3:13
(if, define, macro, forstruct, assert, repeat, line, file, date, error, warning, exec, block, value, text, uid)

#macro test(#if a) {
            ^
}
```

```language
#macro foreach_v(#value value, #value itr_able) #block {}
#foreach_v(1, 1)
1 + 1
```

```error
Syntax error: foreach_v expected a block 2:1

#macro foreach_v(#value value, #value itr_able) #block {}
#foreach_v(1, 1)
^
1 + 1
```




<!--
### Variadic-Macros [*UNDER STUDY*]

Variadic macros are not included in the language. The reason is we don't need it.
It a bit hacky but variadic is supported because we honor parenthesis.

Example:

```language
#macro print_them(#text arg) {
  print#arg#
}

#print_them((1, 2, 3))
#print_them((1))
#print_them(1) // this will fail, that's why it's a by hacky
```

REVIEW
The `#repeat` operator is "underconsideration" to do the job of repeat
over varargs.
-->
