# Preprocessor and Metaprogramming

Preprocessor and metaprograming both share the same purpose, to generate code,
but at different compilation stage.
Both have the same syntax and should be undestood as a whole.

<!--
  https://gcc.gnu.org/onlinedocs/cpp/Macros.html
  https://en.wikipedia.org/wiki/Preprocessor
  https://en.wikipedia.org/wiki/Metaprogramming
  https://files.nothingisreal.com/software/gpp/gpp.html
-->

Implementation notes.

* Max recursion for any macro declaration is 5.

## `#define`

Defines a direct text substitution. Unlike c/cpp does not have arguments.
It's use to declare constants

### Example

```
#define PI 3.1496
#define HAL_PI (PI * 0.5)
```

## `#macro`

Creates a function macro the compile will choose when to expand depending on
what inputs require the macro.

A macro function declares explicity how to handle inputs.
A macro function is always "inlined" by definition replacing each call.
A macro function can fetch next block of code and expanded inside it's own block.
A macro function do not return.
A macro function creates a block at call site. So it's variable won't leak out.
A macro function can use variables from outter/upper scopes at call site.
A macro function need to be syntax valid code by it's own.
A macro function could not contain any `#define` or `#macro`

syntax

> macro_modifier = #text|#value
> macro_input = expression|text_no_comma_no_endl
> #macro identifier(\[macro_modifier macro_input]\[, macro_modifier macro_input]) [#block] block


### `#text`

Arguments mark as `#text` are going to be expanded as recieved.

This is the default method, and `#text` it's optional.

Text is everything not comma and parenthesis will be honored, no open
parenthesis will be allowed without match.

To expand the argument use `@` followed by the name of the argument.

#### Example



```language
// Declaration
#macro print_text(#text t) {
  print("@t")
}

// Usage
print_text(xxx.ccc)
print_text(any_valid_exression())
print_text(even-not-valid-staf-is-allowed ? .-)
```

Generates
```
{
  print("xxx.ccc")
}
{
  print("any_valid_exression()")
}
{
  print("even-not-valid-staf-is-allowed ? .-")
}

```

#### Errors

Input
```
print_text((xy)
```

Error
> Not closed parentheses started at line 1:11

Input
```
print_text(and not we mess " compilation)
")
}
```

Use could this that it will generate the following code... and should be valid
```
{
  print("and not we mess " compilation")
}
")
}
```

but in fact it's an error, because expansion should be understood after expansion
without relying on the sorroundings.

Error
> Syntax error: Unexpected literal
> Expanding line 1:
>   print_text(and not we mess " compilation)

> Expansion:
>   {
>     print("and not we mess " compilation")
>   }


### `#value`

Arguments mark as `#value` are going to be assigned to a local variable,
and that will be used, so keep in mind there will be only one resolution
to the expression.

If the user declare the type it will be enforced in the assignament.

Because it will be assigned `#value` need to be a valid `rhs`.

### Example

Declaration

```
#macro print_type(#value v) {
  print(typeof(@v), "=", @v)
}
```

Input

```
print_type(10+5)
print_type(10+5.2)
```

Expansion

```
{
  var unique_name = 10+5;
  print(typeof(unique_name), unique_name);
}
{
  var unique_name = 10+5.2;
  print(typeof(unique_name), unique_name);
}
```

Output
```
i8 = 17
float = 17.2
```

## Example 2

Declaration:
```
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
```

Examples:
```
var a: i8 = 120;
var b: i8 = 120;
var r: i8 = 0;
var overflowed = false;

sum(r, a, b, overflowed)
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

### `#forstruct`

`forstruct` will loop the struct properties.

Syntax

> #forstruct identifier, identifier in expression block

Example
```
struct point {
  i8 x
  i8 y
}
var p = point(5, 7)

// #forstruct i, k in typeof(p) {
#forstruct i, k in point {
  print(@i, "@k", p.@k)
}

```

Generate
```
struct point {
  i8 x
  i8 y
}
print(0, "x", p.x)
print(1, "y", p.y)
```

### `#block`

A `#marco` mark with `#block` require a body-block at call site.

#### Example

This is how we implement foreach internally in the language, it's a `#macro` :D

Definition:
```
#macro foreach(#value value, #value itr_able) #block {
  #assert @itr_able implements Iterable

  @itr_able.reset()
  for (int i = 0; i < @itr_able.length; ++i) {
    @value := @itr_able[i];
    @block
    @itr_able.next()
  }
}

#macro foreachk(#value key, #value value, #value itr_able) #block {
  #assert @itr_able implements Iterable

  @itr_able.reset()
  for (int i = 0; i < @itr_able.length; ++i) {
    key, value := @itr_able.get_key_value(i);
    @block
    @itr_able.next()
  }
}

```

Usage:
```
foreach(it, [1,2,3,4]) {
  print it;
}

list := [1,2,3,4]
foreach(it, list) {
  print it;
}

foreach(key, it, [1,2,3,4]) {
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

## `#assert`

Raise a compile time error.

`#assert` check will be delayed until macros expanded and all types are resolved.

```
#assert x is_type_of Y
#assert x implements Y
#assert y is_instance_of Y
#assert sizeof(x) > 16
```

syntax:

> #assert expression ENDL

## `#exec`

Execute given command:
* if exit code is 0: It will include its standard output in the current output
* if exit code is not 0: It will stop compilation and display an error.

This is only available in main program code. For security reasons it disallowed
in libraries.

The output of the command won't be re-evaluated.

syntax:

> #exec text ENDL


## `#line`

Display current line

syntax:

> #line

## `#file`

Display current file

syntax:

> #file

## `#date`

Display current date

syntax:

> #date


## `#error msg`

Display the error message and abort compilation.

syntax:

> #error text ENDL

## `#warning msg`

Display the warning message but continue compilation.

syntax:

> #warning text ENDL

### #repeat (line repeater)

syntax:

> #repeat (identifier [,identifier]\*)


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
