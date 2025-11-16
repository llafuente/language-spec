<!--
  TODO
    handling varargs ?
-->
# Preprocessor and Metaprogramming

Metaprogramming is the way to generate code inside your code.

<!--
  https://gcc.gnu.org/onlinedocs/cpp/Macros.html
  https://en.wikipedia.org/wiki/Preprocessor
  https://en.wikipedia.org/wiki/Metaprogramming
  https://files.nothingisreal.com/software/gpp/gpp.html
  https://github.com/logological/gpp/blob/master/src/gpp.c

  https://gcc.gnu.org/onlinedocs/cpp/Variadic-Macros.html

  https://docs.julialang.org/en/v1/devdocs/reflection/

  https://doc.rust-lang.org/reference/macros-by-example.html

-->

*syntax*

```syntax
preprocessorProgramStmtList
  : preprocessorProgramStmt+
  ;

preprocessorProgramStmt
  : preprocessorSetStatement
  | endOfStmt
  ;

preprocessorExpr
  : preprocessorStr
  | preprocessorEcho
  | preprocessorCallExpr
  // PROPOSSAL: | preprocessorRepeatExpr
  ;

preprocessorStr
  : '##' identifier '#' // TODO why can't we use identifierUp here ?
  ;

preprocessorEcho
  : '#' (identifier | 'function') '#'
  ;

preprocessorCallExpr
  // TODO eos sensible
  : '#' postfix_expr ('(' preprocessorCallArgumentsList? ')')? '{' tokenList '}'
  | '#' postfix_expr ('(' preprocessorCallArgumentsList? ')')
  ;

preprocessorCallArgumentsList
  : tokenListNoComma (',' tokenListNoComma)*
  ;

tokenListNoComma
  : (groupTokens | isolatedTokenListNoComma)+  tokenListNoComma?
  ;

tokenList
  : (groupTokens | isolatedTokenList)+ tokenList?
  ;

// inside a group "," is allowed
groupTokens
  : '(' tokenList?  ')'
  | '{' tokenList? '}'
  ;

isolatedTokenListNoComma
  : ~(',' | '{' | '}' | '(' | ')')
  ;

isolatedTokenList
  : ~('{' | '}' | '(' | ')')
  ;

preprocessorStmts
  : preprocessorIfStmt
  | preprocessorLoopStmt
  ;

tokenizeExpr
  : 'tokenize' '{' tokenList '}'
  ;

```
## `#set`

`#set` is covered in [compiler configuration](compiler/compiler-configuration.md)

## `#if/else`

```syntax
preprocessorIfStmt
  : '#' ifStmt
  ;
```

*Semanticss*

Same a [control-flow.md#if-else](control-flow `if` statement) but the expression shall be resolved at compile time so developer shall asume only one block will remain.

*Constrains*

1. Expression shall be resolved at compile time or a semantic error shall raise

> expected expression to be resolved at compile time

2. conditions that yields true will be pruned leaving only the body, scope included.

```language-test
test static_if {
  #if true {
    #assert(true)
  } else {
    #semantic_error("unrecheable!")
  }
}
```

## `#function`

*syntax*

```syntax
preprocessorDecl
  : '#' 'function' identifier '(' preprocessorMacroArgumentList? ')' typeDefinition preprocessorBody
  ;

preprocessorMacroArgumentList
  : typeDefinition identifier (',' preprocessorMacroArgumentList)*
  ;

preprocessorBody
  : endOfStmt? '{' globalImportVarList? functionBodyStmtList? '}'
  ;
```

*Semantics*

`#function` Creates a function-like macro that can take arguments, can be expanded inside an expression or statement and can fetch the next block code.

*Constraints*

1. A `#function` shall return an `expression` or `statement`.

```language
import metaprograming as meta

#function sum(meta.expression a, meta.expression b) meta.expression {
  return tokenize {
    #a# + #b#
  }
}

test sum {
  var a = #sum(1, 2)
  #assert(a == 3)
  var b = #sum(a, 10)
  #assert(b == 13)

  var c = #sum(a, 3 * 3)
  #assert(b == 12)
}



#function for_stmt(meta.expression init, meta.expression condition, meta.expression inc) meta.statement {
  return tokenize {
    {
      #uid(UID)

#init#
#UID#_start:
  if (#condition#) {
    #block#

    #inc#
    goto #UID#_start
  }
    }
  }
}

#function log(meta.identifier variable) meta.tokens {
  #if variable implements index_iterator {
    return tokenize {
      { // create another block, so current and end don't leak out
        var current = #variable.begin()
        var end = #variable.begin()
        while (start != end) {
          var #value = current.value()
          var #key = current.key()

          logger(##variable, key, value)

          current.next()
        }
      }
    }
  }
  #if variable implements has_to_string {
    return tokenize {
      logger(##variable#.to_string())
    }
  }
}

#function log_iterable(meta.identifier key, meta.identifier value, meta.identifier iterable) meta.tokens {
  return tokenize {
    var current = #iterable.begin()
    var end = #iterable.begin()
    while (start != end) {
      var #value = current.value()
      var #key = current.key()

      current.next()
    }
  }
}
```

2. `#function` body shall have the same statements as function body

<!--
The compiler will choose when to expand depending on what inputs require the macro.
-->

2. Each macro arguments can declares how to handle input:

* [`#text`](#macro-text) (default)

* [`#string`](#macro-string)

* [`#expression`](#macro-expression)

* [`#value`](#macro-value)

3. If a macro fetch the next block (#block is used) the #block# shall be used inside the macro or a semantic-error shall raise.

4. When expanding a macro will create a new block at call site to keep
everything declared in the macro inside it's own scope.

5. A macro function shall not `return`. If used shall raise an syntax-error.

This is an error.

```todo-language-semantic-error
#macro ret() {
  return 0
}

function test(): number {
  #ret()
}
```

6. A macro call shall not be part of a expression.

This is an error.

```language
#function expr() meta.expression{
  return tokenize {
    1 + 1
  }
}

function test() {
  return #expr()
}


test {
  #assert(test() == 2)
}

```

7. A macro function need to be syntax valid code by it's own.

9. A macro argument is everything not comma and parenthesis will be honored,
no open parenthesis will be allowed without the closing match.
These prevent unshielded commas.

*Examples*

A macro can access variables outside its scope but no the other way around.

```todo-language
#macro macro_add() {
  var x = 10
  c = a + b
}

function add(i8 a, i8 b) {
  var c
  #macro_add()
  // print(x) <-- // this is a semantic error, variable not found

  return c
}

print(add(10, 10)) // stdout: 20
```

A macro can be called postfix.

```todo-language
var list = [1, 2, 3, 4]

list.#foreach(value) {
  print(value)
}
```

```language
#function add(meta.expression value, meta.expression value2) {
  return tokenize {
    #value# += #value2#
  }
}

type point = struct {
  float x
  float y

  function operator+=(ref<point> other) {
    x += other.x
    y += other.y
  }
}

var p1 = point(0,0)
var p2 = point(20,10)

p1.#add(p2)
```

<a name="macro-arguments"></a>
### arguments

To expand an argument use `#` followed by the name of the argument and `#` again.

To stringify the argument use `##` followed by the name of the argument and `#` again.
The string is double quote escaped.

<a name="macro-text"></a>
### `#text` argument

*Semantics*

`#text` is a macro argument modifier that tell that fetch the entire expression
as text.

This is the default method so `#text` it's optional.

*Example*

```todo-language
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

```language-compiled
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

*Constraints*

1. `block`, `text`, `value`, `list` and  as identifier are fobidden

2. Fully uppercased idenfitier are forbidden.

<a name="macro-string"></a>
### `#string` argument

*Semantics*

`#string` is a macro argument modifier that enforce the argument to be a valid string.

It's intention is to give better error message, as it's the same as #text with a type check.

```todo-language
#macro xxx(#string message) {
  print(#message#)
}

xxx("print this message!")

var x = false;
xxx(`do not print ${x} messages!")
```

<a name="macro-expression"></a>
### `#expression` argument

*Semantics*

`#expression` is a macro argument modifier that enforce the argument to be a valid expression.

<a name="macro-value"></a>
### `#value` argument

*Semantics*

`#value` is a macro argument modifier that make the expression to be evaluated
and assigned to a local variable.

*Constraints*

1. Given expression must be a valid rhs expression

<!-- test-preprocessor-constraints-value-2.language -->
2. Expression shall be evaluated only once at the top of the expansion.


*Example*

```todo-language
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

```todo-language
// Declaration
#macro safe_add(#text result, #value lhs, #value rhs, #text overflow) {

  if (lhs >= 0) {
    if (typeof(lhs).max - lhs < rhs) {
      overflow = true;
    }
  } else {
    if (rhs < typeof(rhs).min - lhs) {
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

#safe_add(r, a, b, overflowed)
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

*Semantics*

`#block` is a macro modifier that force to defined a block at call site, this block of code
will be expanded inside the macro.

*Constrains*

*Example*:

This is almost how we implement `foreach` internally in the language.

```todo-language
// declaration
#macro foreach_v(#text val, #value itr_able) #block {
  #assert(typeof(#itr_able#) implements Iterable)

  #itr_able#.reset()
  for (int i = 0; i < #itr_able#.length; ++i) {
    #val# := #itr_able#[i]
    #block#
    #itr_able#.next()
  }
}

#macro foreach_kv(#text key, #text val, #value itr_able) #block {
  #assert(typeof(#itr_able#) implements Iterable)

  #itr_able#.reset()
  for (int i = 0; i < #itr_able#.length; ++i) {
    #key#, #val# := #itr_able#.get_key_value(i);
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
```language-compiled
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

## `#forargs`

```syntax
forargsStmt
  : '#forargs' identifier ',' identifier functionBody
  ;
```

*Semantics*

`#forargs` will loop the macro function `arguments`.

*Constraints*

1. The first identifier is the arguments text

2. The second identifier is the arguments value


*Example*

```todo-language

#macro print(...) {
  #forargs i, k {
    print(#k#)
  }
}


print(10, 11, 12)
```


## `#loop`

*Syntax*

```syntax
preprocessorLoopStmt
  : '#' 'loop' identifier ',' identifier 'in' expression functionBody
  ;
```
*Semantics*

`#loop` will repeat it's body for each value in the given iterable.
Unlike loop statement there is no `break`, `continue` or `restart`

*Constraints*

1. `#loop` can be used outside `#function`


*Example*

```language-test
type abc = struct {
  i8 a
  i16 b
  i32 c
}
test example {
  var p = abc(1, 2, 3)

  #loop i, k in typeof(p) {
    #if (#i# == "a") {
      #assert(#v# == i8)
    }
    #if (#i# == "b") {
      #assert(#v# == i16)
    }
    #if (#i# == "c") {
      #assert(#v# == i32)
    }
  }

  #expect.stdout("a 18 i8 i8
b i16 i16 i16
c i32 i32 i32") {
    #loop i, k in abc {
      print(#i#, "#k#", abc.#i#, abc[##i#])
    }
  }

  #expect.stdout("1
2
3") {
    #loop i, k in abc {
      print(p.#i#)
    }
  }
}
```

## (core) `#assert(metaprogramming.expression condition, metaprogramming.string message)` (FINAL)

*Semantics*

Raise an error if the condition yields false.

If the condition is a compile time expression then it will raise a compiler error.

If the condition is a runtime time expression then it will raise an exception.

*Constraints*

1. Expression type shall be bool.

2. Message type shall be a string or a semantic error shall raise.

> assert expected message parameter to be a string

*Example*

```language
function main() {
  // runtime!
  var x = process.stdin.read()
  #assert(x == 1)

  // compile time!
  var y = 100
  #assert(y == 100)

  #assert(#PI# > 3.1)
  #assert(typeof x == typeof y)
  #assert(sizeof(x) > 16)
  #assert(x implements comparable)
}
```

## `#exec`

*syntax*

```syntax
execStmt
  : '#exec' anyNonNewLine
  ;
```

*Semantics*

Execute given command:
* if exit code is 0: It will include its standard output in the current output
* if exit code is not 0: It will stop compilation and display stderr and stdout as an error.

*Constraints*

1. It's only aviable at program code. Disallowed for packages.

2. The output of the command won't be re-evaluated. Any preprocessor or metaprogramming is disallowed.


## `#uid(metaprogramming.identifier name)`

*Semantics*

It generates a unique identifier, can be used as prefix or sufix.

*Constrains*

1. Values shall be unique at current compilation.

*Example*

```todo-language
#uid BLOCK_UID

start_#BLOCK_UID#:
// do some mad science
if (true) {
  goto end_#BLOCK_UID#
}
// more mad science
end_#BLOCK_UID#:
```

<!-- test-preprocessor-semantics-line-file.language -->
## `#line`

*Semantics*

Display current line

*Constraints*

1. Inside a macro function, display the caller line.

<!-- test-preprocessor-semantics-line-file.language -->
## `#file`

*Semantics*

Display current file

*Constraints*

1. Inside a macro function, display the caller file.


## `#date`

*Semantics*

Replaces itself by current date as string with optional formatting.

*Constraints*

Date format can be configured using compiler flag `config.preprocessor.date_format`

*Example*
```todo-language
#set config.preprocessor.date_format = "YYYY-mm-DD"

test "date" {
  print(##date)
  // TODO test with a regex
}
```

## `#error(metaprogramming.string msg)`

*Semantics*

Displays given error message and abort compilation.

*Constraints*

1. If an `#error` is not pruned from the AST, it will generate the error.

```language-test
test "comptime tree prune" {
  #if false {
    #error("this message is pruned")
  }

  #error("this message is not pruned")
}
```


## `#warning(metaprogramming.string msg)`

*Semantics*

Displays given warning message and continue compilation.

*Constraints*

1. If an `#warning` is not pruned from the AST, it will generate the error.

## `#type_error(metaprogramming.string msg)`

*Semantics*

Display given type error message and abort compilation.

*Constraints*

1. If an `#type_error` is not pruned from the AST, it will generate the error.

## `#semantic_error(metaprogramming.string msg)`

*Semantics*

Display a type semantic message and abort compilation.

*Constraints*

1. If an `#semantic_error` is not pruned from the AST, it will generate the error.

### #repeat (line repeater) (EXPERIMENTAL)

*Syntax*

```syntax
identifierList
    : identifier? (',' identifier)*
    ;

preprocessorRepeatExpr
  : '#repeat' '(' identifierList ')'
  ;
```

*Semantics*

This macro will repeat current line for each text sent and it will replace itself for each value.

*Constraints*

1. If two line repeater are found in the same line:

1. 1. Both must have the same number of values or a semantic error shall raise.

1. 2. Both will be expanded at the same time.

*Remarks*

It only accept identifiers, not expressions.

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

```todo-language-semantic-error
// Declaration
#macro print_text(#text t) {
  print("#t#")
}

print_text((xy)
```

> Invalid macro argument: Not closed parentheses started at line 6:11

```todo-language-semantic-error
// Declaration
#macro print_text(#text t) {
  print("#t#")
}

#print_text(x,y)
```

> Invalid macro arguments count: expected 1 found 2 at line 6

```todo-language-semantic-error
// Declaration
#macro print_text(#text t) {
  print("#t#")
}

#print_text(mess with quotes " compilation)
")
}
```

> End of line reached with an open string started at line 6:30

```todo-language-semantic-error
// Declaration
#macro print_text(#text t) {
  print("#t#)
}

#print_text(this is a mess)
")
}
```

> Syntax error unclosed string started at line 3:10
> #macro print_text(#text t) {
>   print("#t#)
>        ^
>}


```todo-language-semantic-error
#macro if() {
}
```

> Syntax error: Invalid macro name: used a reserved macro name at line 3:10
> :keywords


```todo-language-semantic-error
#macro test(#text if) {
}
```

> Syntax error: Invalid macro argument name: used a reserved macro name at line 3:10
> :keywords


```todo-language-semantic-error
#macro test(#if a) {
}
```

> Syntax error: Invalid macro argument modifier: expected #text or #value line 3:13
> :keywords


```todo-language-semantic-error
#macro foreach_v(#value value, #value itr_able) #block {}

test "foreach_v" {
  #foreach_v(1, 1)
  1 + 1
}
```

> Syntax error: foreach_v expected a block :file:line:column

<!--
### Variadic-Macros [*UNDER STUDY*]

Variadic macros are not included in the language. The reason is we don't need it.
It a bit hacky but variadic is supported because we honor parenthesis.

Example:

```todo-language
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



# metaprograming package

## types
* tokens: array<token>

  List of tokens

* expression: array<token>

  List of tokens, at constructor it will check if it's a valid expression

* statement: array<token>

  List of tokens, at constructor it will check if it's a valid statement

* statements: array<token>

  List of tokens, at constructor it will check if it's a valid statements

* empty: array<token>

  List of tokens, at constructor it will there no tokens

  This is used mostly to debug/error reporting, as it has no real purpose

## functions

* uid
* semantic_error
* type_error
* warning
* error
* print
