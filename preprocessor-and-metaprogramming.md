# Preprocessor and Metaprogramming

Preprocessor and metaprograming both share the same purpose, to generate code,
but at different compilation stage.
Both have the same syntax and should be undestood as a whole.

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

Defines a direct text substitution. Unlike c/cpp does not have arguments.

It's the preferred method to declare constants.

It MUST be just one line.

If used inside a macro it will live only inside the macro.

```syntax
#define identifier text ENDL
```

Example:

```language
#define PI 3.1496
#define HAL_PI (#PI# * 0.5)
```

## `#macro`

Creates a function-like macro that can take arguments.
It's always "inlined" by definition replacing each call.
<!--
The compiler will choose when to expand depending on what inputs require the macro.
-->


A macro function declares explicity how to handle inputs using:
* [`#text`](#macro-text)
* [`#value`](#macro-value)

A macro function can fetch next block of code and expanded inside it's own block see [`#block`](#macro-block).

### Implementation notes

Expanding a macro function will create expand the entire function body, a new block included.
Therefore can't return a value, using return inside a macro means the function that use it will return.
its variables won't leak out.
If you want to use a variable initialized/modified by the macro declare it outside the macro.

A macro function need to be syntax valid code by it's own.

Inside a macro function `#macro` are forbidden.

A macro argument is everything not comma and parenthesis will be honored,
no open parenthesis will be allowed without the closing match.
these prevent unshielded commas.

```syntax
macro_argument = ( #text text_no_comma_no_endl | #value expression_rhs )

macro_argument_list = [ macro_modifier macro_input [, macro_argument_list] ]

#macro identifier '(' macro_argument_list ')' [ #block ] block
```

<a name="macro-arguments"></a>
### arguments

To expand the argument use `#` followed by the name of the argument and `#` again.

To stringify the argument use `##` followed by the name of the argument and `#` again.

<a name="macro-text"></a>
### `#text` argument

Arguments mark as `#text` are going to be expanded as recieved.

This is the default method, and `#text` it's optional.

Example:

```language
// Declaration
#macro print_text(#text t) {
  print("#t#")
  print(##t#)
}

// Usage
#print_text(xxx.ccc)
#print_text(any_valid_exression())
#print_text(even-not-valid-staff-is-allowed ? .-)
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
```

<a name="macro-value"></a>
### `#value` argument

Arguments mark as `#value` are going to be assigned to a local variable,
and that will be used, so keep in mind that it must be a valid rhs and there
will be only one resolution to the expression.

Example:
```language
// declaration
#macro print_type(#value v) {
  print(typeof(#v#), "=", #v#)
}
// usage
#print_type(10+5)
#print_type(10+5.2)
```

Expansion:
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

Output:
```
i8 = 17
float = 17.2
```

Example 2:

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

Expansion:
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

A `#macro` marked with `#block` require a body-block at call site.

Example:

This is almost how we implement foreach internally in the language.

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

What happen
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
### Variadic-Macros

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

<!--
REVIEW
The `#repeat` operator is "underconsideration" to do the job of repeat
over varargs.
 -->

## `#forstruct`

`forstruct` will loop the struct properties.

It will be expanded later when types are ready.

```syntax
#forstruct identifier, identifier in expression block
```

Example:
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

Raise a compile time error.

`#assert` check will be delayed until macros expanded and all types are resolved.

```
#assert x is_type_of Y
#assert x implements Y
#assert y is_instance_of Y
#assert sizeof(x) > 16
```

```syntax
assert_expression = TODO
'#' assert assert_expression ENDL
```

## `#exec`

Execute given command:
* if exit code is 0: It will include its standard output in the current output
* if exit code is not 0: It will stop compilation and display an error.

This is only available in main program code. For security reasons it disallowed
in libraries.

The output of the command won't be re-evaluated.

```syntax
'#' exec text ENDL
```


## `#uid`

Generate a unique number.

Example:

```
#define BLOCK_UID #uid

start_#BLOCK_UID#:
// do some mad science
if (true) {
  goto end_#BLOCK_UID#
}
// more mad science
end_#BLOCK_UID#:
```


## `#line`

Display current line

```syntax
'#' line
```

## `#file`

Display current file

```syntax
'#' file
```

## `#date`

Display current date

```syntax
'#' date
```

## `#error msg`

Display the error message and abort compilation.

```syntax
'#' error text ENDL
```

## `#warning msg`

Display the warning message but continue compilation.

```syntax
'#' warning text ENDL
```

### #repeat (line repeater)

```syntax
identifier_list = identifier , identifier_list
'#' repeat '(' identifier_list ')'
```


This macro will repeat current line for each value sent.

If two line repeater are found in the same line both must have the same number
of values because both will be expanded at the same time.

## Example 1

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

## Example 2

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

## Example 2

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
