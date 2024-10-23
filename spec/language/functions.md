<!--
  c - 6.9.1 Function definition
-->


# `function`

## Declaration

*Syntax*

```syntax
returnStmt
  : 'return' rhsExpr?
  ;

deferStmt
  : 'defer' rhsExpr
  ;

functionDecl
  : (functionDef | anonymousFunctionDef) functionBody
  ;
/*
functionModifiers
  : '@pure'
  | '@mock'
  | '@debug'
  ;
*/
anonymousFunctionDef
  : 'pure'? 'function' templateDefinition? '(' functionParameterList? ')' functionReturnTypeModifiers* typeDefinition?
  ;

functionDef
  : 'pure'? 'function' identifier templateDefinition? '(' functionParameterList? ')' functionReturnTypeModifiers* typeDefinition?
  ;

memoryFunctionDecl
  : memoryFunctionDef functionBody
  ;

memoryFunctionDef
  : ('new'|'delete'|'clone') '(' functionParameterList? ')'
  ;

operatorFunctionDecl
  : operatorFunctionDef functionBody
  ;

operatorFunctionDef
  : 'operator' overloadableOperators '(' functionParameterList? ')' functionReturnTypeModifiers* typeDefinition?
  ;

overloadableOperators
  // Binary arithmetic operators
  : '+'
  | '-'
  | '*'
  | '/'
  | '^'
  // Assignament operators
  | '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '^='
  | '~='
  // Array subscript operator
  | '[' ']' '='
  | '[' ']'
  // Member access
  | '.'
  | '?.'
  // Comparison operators
  | '<'
  | '>'
  | '<='
  | '>='
  | '=='
  | '!='
  ;

functionBody
  : endOfStmt? '{' globalImportVarList? functionBodyStmtList? '}'
  ;

functionBodyStmtList
  : functionBodyStmt+
  ;

labeledStatement
  : identifier ':' endOfStmt? (functionBodyStmt | blockStatement)
  ;

globalImportVarList 
  : globalImportVar+
  ;

globalImportVar 
  : 'global' identifier (',' identifier)* endOfStmt
  ;

blockStatement
  : '{' functionBodyStmtList? '}'
  ;

functionBodyStmt
  : labeledStatement endOfStmt
  | blockStatement endOfStmt
  | comments endOfStmt
  | typeDecl endOfStmt
  | functionDecl endOfStmt
  | expression endOfStmt
  | selectionStmts endOfStmt
  // function exclusive
  | returnStmt endOfStmt
  | deferStmt endOfStmt
  | blockVariableDeclStmt endOfStmt
  | assertStmt endOfStmt
  | errorHandlingStmts endOfStmt
  | endOfStmt
  ;

functionParameterList
  : functionParameter (',' functionParameter)*
  ;

functionParameter
  : functionParametersTypeModifiers* typeDefinition identifier ('=' rhsExpr)?
  ;
```


*Semantics*

1. The declarator in a function definition specifies the name of the function being defined
and the identifiers and types of its parameters.

*function identifier/name constraints*

1. If used on lhs expression a semantic-error shall raise.

> Cannot assign to %identifier% because it is a function.

> The left-hand side of an assignment expression must be a variable or a property access.

2. If used as rhs expression.

2. 1. It will be resolve as function pointer if literal expression is used.

2. 2. It will be resolve as type otherwise.

3. If used as type reference it will be resolved to the type.

4. `type(identifier)` will resolve to the pointer to the type.

5. Function identifier/name shall not be redeclared inside the function body
or at the same level.

> Cannot redeclare %identifier% declared at %file%:%line%:%column%

```language
function xxx() {           // declaration
}

function yyy() xxx {       // point 3
  return xxx               // point 2
}

function main() {
  xxx = 10
  // point 1 stderr: A function name shall not be used in lhs expression
  var x = xxx                // point 2
  print(xxx.arguments)       // point 2 stdout: []
  print(xxx.return_type)     // point 2 stdout: i32
  print(typeof(xxx))           // point 4 stdout: function xxx() i32
  print(typeof(xxx).arguments) // point 4 stdout: []
}

```


*Return type constraints*

1. If no specified and no `return` statement to infer from a return type
`i32` shall be used.

2. If empty `return` (no expression) a `return 0` shall be used.

3. If a function don't have `return` statement a `return 0` shall be added
as last statement in the function body.

4. If return type is void, function call shall not be assigned or a
semantic-error shall raised.

*Parameters contraints*

1. All parameter shall define an identifier and type shall be implicit (no inference)

2. If a function define a template the template must be used in at least
one parameter.

<!--
  test-functions-parameters-contraints-3-a.language
  test-functions-parameters-contraints-3-b.language
-->

3. No parameter identifier shall not be redeclared inside the function body

> Cannot redeclare %identifier% declared at %file%:%line%:%column%

*Example*

```language
function sum(i32 a, i32 b) i32 {
  return a + b;
}
```

*Function constraints*

1. A pure function shall have no access to package, file or global variables
unless it's a constant or a semantic-error shall raise

> A pure function shall no read or write any non-constant variable.


## functions as Type

*Semantics*

Function name can be used as type.

*Example*

```language
function isort(i32 a, i32 b) i32 {
  return a + b;
}

function sort(i32[] arr, isort callback) {
  //...
}

function main() {
  // inline declaration
  type xxx = function(i32 a, i32 b) i32

  print([1, 2, 3].sort(isort))

  // equivalent ?
  #assert typeof(isort) === typeof(xxx)
}
```


<a name="function-exit"></a>
## `function-exit`

*Semantics*

`function-exit` refer to all possible ways to quit a function.

* `return` (implicit or explicit)

* `throw`

## function `parameters`

### parameter types

*Constraints*

1. All parameters must have a explicit type.


### function type modifiers

#### readonly (const)

*Semantics*

Parameter (and it's memory) shall not be modified.

*Constrains*

1. `readonly` shall be applied only to function parameters.

2. The variable shall not be in a `left hand side` assignament.

3. Any property of an object shall not be in a `left hand side` assignament.

4. A method that modified the value shall no be called.

5. Another function that modified the value shall not be called.

6. A readonly parameters shall not be casted to a non-readable type.

*Example*

```language
type point = struct {
  float x;
  float y;

  // real function signature: setX(out ref<point> this, float x)
  function setX(float x) {
    this.x = x
  }
  // real function signature: setY(out ref<point> this, float y)
  function setY(float y) {
    this.y = y
  }
}

// ok
function func_add_ok(readonly p1 point, readonly p2 point) point {
  return point {x: p1.x + p2.x, y: p1.y + p2.y };
}

// Constrains 1
function sum_func1(readonly p1 point, float x, float y) point {
  p1 = point{x: x, y: y}

  return p1
}

// Constrains 2
function sum_func2(readonly p1 point, readonly p2 point) point {
  p1.x += p2.x
  p1.y += p2.y
  return p1
}

// Constrains 3
function reset(readonly p1 point) {
  p1.setX(0)
  p1.setY(0)
}

// Constrains 3
function add(p1 point, readonly p2 point) point {
  p1.x += p2.x
  p1.y += p2.y
  return p1
}

function new_sum(readonly p1 point, p2 point) point {
  return p1.add(p2)
}

function main() {
  var point = func_add_ok(point{x: 0, y: 1}, point{x: 2, y: 0})
}

```

#### out (output)

*Semantics*

Mark the parameter as output.

*Constraints*

1. `out` shall be applied only to function parameters.

2. In at least one code-path the value shall be modified or a semantic-error shall raise

> At function '?' parameter '?' is mark as out but not modified.

3. The parameter will be promoted to a `ref` if necessary implicitly.

*Example*

```language
function reset(out int a) {
  a = 0
}

function main() {
  var int a = 1;
  #assert a == 1

  reset(a)
  #assert a == 0
}
```

#### lend

*Semantics*

`lend` marks a function parameter or function return type as output and additionally lend the
memory to the callee, that will handle it from now on. if not handled it
will be freed at the end of call block.

* Constrains*

1. `lend` shall be applied only to function parameters or function return type.

2. Stack memory shall not be lend or a semantic error shall raise

> stack memory shall not be lend at function '?'

3. All function paths shall lend memory, optionally if the paramter is nullable can return null or a semantic error shall raise

> Found a path that don't lend memory at 'line:col'

4. A parameters with lend shall be a `ref` type or a semantic error shall raise

> A parameter with `lend` require `ref` at '?'

5. A parameters with lend shall not have default value other than null, in wich case nullable operator is required.

> The only valid default value for a `lend` parameters is `null`

> Default value is `null` but nullable qualifier is not applied at '?'

#### own

*Semantics*

`own` marks a function parameter as memory reciever. The callee is no longer
responsible for the memory and it's the function the new owner. The function 
can lend the memory again or the memory will be freed at `function-exit`.

*Constrains*

1. At all `function-exits` the memory should be lend or deleted.

```language
function implicit_delete(own array<$t> arr) {
  // at function-exit, arr will be freed
}

function mix_usage(own array<$t> arr) {
  if (arr.length > 0) {
    pool_should_handle_it(arr)
    return // here arr won't be freed, "a pool" own the memory now.
  }
  // if no length, arr will be freed
}



function free_array_error(own array<$t> arr) {
  if (arr.length) {
    delete arr
  }
}
```

### Default arguments / Default parameters

*Semantics*

Allows a function to be called without providing one or more trailing arguments.

*Constraints*

1. A default parameter will be inserted at function call by the compiler.

2. Default parameter value shall be:

2. 1. A compile time known value.

```language
// 1h timeout
function default_test(int timeout = 60 * 60 * 1000) {}
function default_test2(int timeout = 15) {}
function default_test2(string timeout = "xxxx") {}
```

2. 2. A global, package, file variable.

```
global var default_timeout = 60 * 60 * 1000
function test(int timeout = default_timeout) {}

function main() {
  // compiler will add the as first argument default_timeout
  // test(default_timeout)
  test()

  // change value
  default_timeout = 30 * 60 * 1000
  test() // 30m this time, it will honor changes
}
```
3. Not supported at ffi (any to language) as it's a compiler construct.

<!-- EAGLE EYE: avoid double comma /empty parameter to use default argument ,, -->
4. To force a default argument use: `default` keyword.

*Example*

```language

function add2(int a, int b = 1) int {
  return a + b
}

function add4(int a = 1, int b = 2, int c = 3, int d = 4) {
  return a + b + c + d
}


function main() {
  #assert add2(7) == 8
  #assert add2(7, default) == 8
  #assert add2(7, 3) == 10
  // using named params
  #assert add2(b = default, a = 7) == 8

  
  #assert add4() == 10
  #assert add4(c = 7) == 14
  #assert add4(default, default, 7) == 14
  #assert add4(1, default, default, 7) == 13
}

```

<!--
  https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-arguments-exotic-objects
  varargs (c style)
-->
### `arguments` keyword

*Semantics*

It's a magic variable that holds the arguments passed with type:
*array&lt;variant&gt;*


*Remarks*

It's a compiler construct that has runtime cost.

*Constraints*

1. `arguments` shall be used only in function body.

2. At least one parameters shall be declared to use arguments inside 
a function or a semantic-error shall raise.

> arguments used but function has no parameters.

3. arguments shall implement `index_iterator`

4. arguments shall implement `string_iterator`

*Example*

```language
// default
function sum (int a, int b) {
  return a + b
}

// same but using arguments, slower - using index_iterator
function sum2 (int a, int b) {
  return arguments[0] + arguments[1]
}

// same but using arguments, even slower - using string_iterator
function sum2 (int a, int b) {
  return arguments["a"] + arguments["b"]
}

```
<!--
// mandatory when using varargs??
function sum3 (...) {
  int total = 0;
  print(typeof arguments); // stdout: array<variant>
  for (int i = 0; i < arguments.length; ++i) {
    total += arguments[i]
  }
  return total
}


`arguments` shall be implemented including the following macro
at the top of the function

```
readonly array<variant> arguments = []
#for param_key, param_value in self.parameters {
  arguments.push({#param_value#})
}
```


  REVIEW - even it's usefull it does something wrong
  you define a type in parameters but it's not the real type...

  also to force an array type implies another problem

  function join(string[] xxx...) {}
  join(["xxx", "yyy"]) // and now what ?

  function join(string[][] xxx...) {}
  join(["xxx"], ["yyy"], [["ups!"]]) // and now what ?

-->

## Named varargs

*Semantics*

*Constraints*

1. Named varargs are not compatible with C, because it's a compiler construct.

2. At least one parameters must be send.

3. The base type shall be array or a semantic-error shall raise

> parameter '?' is a vararg but type is not an array.

4. If the next parameter to a vararg is of the same type
it shall be filled before vararg.

This constraints implies that:

* function x (string[] list..., string separator)
* function x (string separator, string[] list...)

Shall not be allowed, a semantic error shall raise

> Function '?' declaration collide

5. If the vargs type is optional, null will be used if no arguments sent.

6. If the vargs type is not optional, empty array will be used if no arguments sent.

*Example*

```todo
// same type is supported.
function return_data(string[] list..., string separator) string?[]{
  return [list, null, separator]
}
function main() {
  // empty list, just the separator
  #assert return_data("1") == [[], null, "1"]
  // 1 parameters varargs
  #assert return_data("1", "2") == [["1"], null, "2"]
  // 2 parameters varargs
  #assert return_data("1", "2", "3") == [["1", "2"], null, "3"]
  // 3 parameters varargs
  #assert return_data("1", "2", "3", "4") == [["1", "2", "3"], null, "4"]
}

```

*Example 2*

```todo
function join(string[] list...) {
  var str = ""
  for (s in str) {
    str+=s
  }
  return str
}

#assert join("a", "b", "c") == "abc"

function joinBy(string[] list..., rune x) {
  // string[] list
  var str = ""
  for (s in str) {
    str+=s
    if(!$last) {
      str+=x
    }
  }
  return str
}

#assert joinBy("a", "b", "c", ',') == "a,b,c"

// same type is supported.
function joinBy2(string[] list..., string separator) {
  return joinBy(string[] list..., separator[0])
}
// empty list, just the separator
#assert joinBy("a") == ""
// ["a"], ":"
#assert joinBy("a", ":") == "a"
// ["a", "b", "c"], ":"
#assert joinBy("a", "b", "c", ":") == "a:b:c"


```

## `hook`

*Semantics*

Wraps a function call.

*Remarks*

The main usage for `hook` should be to replace a buggy functions or debug input/output.

*Constraints*

1. A function can be hooked once in the same context.

2. Declared function shall have the same type and name as `hook`ed one.

3. `hook`ed function can be called using the keyword `hook` inside function body.

*Example*

```language
function sum(i32 a, i32 b) i32 {
  return a + b
}

hook function sum(i32 a, i32 b) i32 {
  var r = hook(a, b);
  print("sum(", a, ",", b, ") = ", r)
  return r;
}


sum(10, 15)
```

## `throws`, `throw` and `error`
<!--
https://github.com/llvm-mirror/libcxxabi/blob/master/src/cxa_exception.cpp
https://github.com/ApexAI/static_exception
-->
*Semantics*

Raise an error to the caller. If the callee don't handle the error is raised
again and add current code location to the trace.

*Constraints*

1. `throw` code must be generated before `defer`.

2. Empty `throw` (re)throws current handled exception.

```
function main() {
  try {
    throw "x"
  } catch (e) { // catch all exceptions
    // rethrow
    throw
  }
}
```

3. Trace can be disabled with flag: compiler.disable_traces


*Code generation*


```language
throws function step1() void {
  throw error("simple error")
}

function step2() {
  step1()
}

function main() {
  try {
    step2()
  } catch(e) {
    print(e.message)
  }
}

```

```language
throws function step1() i32 {
  global $error_stack

  $error_stack.push(error("simple error", __FILE__, __FUNCTION__, __LINE__))
  return i32.DEFAULT
}

throws function step2() i32 {
  global $error_stack

  step1()
  if ($error_stack.length) {
    $error_stack.trace.unshift(__FILE__, __FUNCTION__, __LINE__)
    return i32.DEFAULT
  }

  return 10
}


throws function main() void {
  global $error_stack

  step2()
  if ($error_stack.length) {
    var error = $error_stack.pop()

    print(e)
  }
}

```


## `defer`
<!--
https://www.open-std.org/jtc1/sc22/wg14/www/docs/n2895.htm
-->

*Semantics*

A defer statement pushes the expression execution to the end of the surrounding function ([function-exits](#function-exit)).


*Constraints*

1. Defer shall be compiler feature and not a runtime.

<!-- selected-by-pitfall: while this maybe be usefull is hard to follow for human eye. -->
2. `defer` shall honor visual order (top-down) rather than execution order.

```language
function defer_order(ref<array<string>> ar) {
  defer ar.push("start")
  goto end

middle: {
  defer ar.push("middle")
  goto exit
}
end: {
  defer ar.push("end")
  goto middle
}
exit:{}
}

function main() {
  var a = new array<string>()
  defer_order(ar)
  #assert ar.length == 3
  #assert ar[0] == "start"
  #assert ar[1] == "middle"
  #assert ar[2] == "end"
}
```


3. `defer` shall honor scope and raise semantic-error if a parameter is out-of-scope at
any [function-exit](#function-exit).

> variable '?' is out of scope at this function exit '?'

```language
function out_of_scope() void {
  {
    var b = 10
    defer print (b)
  }
}
```

```compiled
function out_of_scope() void {
  var defer_001 = false
  {
    int b = 10
    var defer_001 = true
    b = 11
  }

  if (defer_001) {
    print (b)
  }
}
```

Lambda may extend the scope of a variable.

In this example `null` will be printed, as `a` goes out of scope and it's deleted before the deferred print.

```language
function out_of_scope_but_lambda2() void {
  {
    var shared_ptr<int> a = 10
    var weak_ptr<int> b = a
    defer function() {
      print (b)
    }
    b = 11
  }
}
```

```compiled
function out_of_scope_but_lambda2() void {
  var defer_001 = false
  var defer_001_callable
  {
    shared_ptr<int> a = 10
    weak_ptr<int> b = a
    defer_001 = true
    defer_001_callable = function() {
      print (b)
    }
    b = 11
  }
  if (defer_001) {
    defer_001_callable()
  }
}
```

4. Defer statement shall not be a constant.

```error
function error() void {
  defer 1
  defer "string"
  defer 1 + 1
}
```


*Example*

STUDY-PITFALL. lambda grabbing for primitives is by copy.

```language
function add_one(i32 a) void {
  defer print("stmt - add_one", a)
  defer function () {
    print("lambda add_one", a)
  }
  ++a
}

function main() {
  x(10)
  x(15)
}
```

```output
stmt add_one 11
lambda add_one 10

stmt add_one 16
lambda add_one 15
```

*Example 2*

```language
function add_one(i32 a) void {
  defer print("add_one", a)
  ++a
}
```

*Generation*

```compiled
function add_one(i32 a) i32 {
  bool defer_001 = false

  defer_001 = true
  ++a

  if (defer_001) {
    print("add_one", a)
  }
  return 0
}
```

*Example 3*

```language
function defer2() void {
  for (var i = 0; i < 10; ++i) {
    defer print("defer2", i)
  }
}
```

*Generation*

```compiled
function add_one(i32 a) i32 {
  bool defer_001 = false

  for (var i = 0; i < 10; ++i) {
    defer_001 = true
  }

  ++a

  if (defer_001) {
    print("defer2", i)
  }
  return 0
}
```

## lambda / anonymous functions


*Semantics*

A lambda / anonymous functions is the way the simplest way to create a
function object.

*Constraints*

1. Stack variables are captured by value.

```language
function sum (int a, int b) {
  const r = function () {
    return a + b
  }

  ++a

  return r
}

function main() {
  #assert sum(10, 10)() == 20
}
```

2. `readonly` stack variables shall raise an error

```language-error
// error, as shared_ptr will be modificied if copied!
function sum_error (readonly shared_ptr<int> a, int b) {
  return function () {
    return a + b
  }
}
```

```language
function sum_works (shared_ptr<readonly int> a, int b) {
  return function () {
    return a + b
  }
}
```

3. Lambda shall not capture global variables implicitily.

4. Lambda type is `shared_ptr<lambda.callable>`

5. Lambda will honor current memory pool.

*Implementation*

* Locate all variables captures
* Use the variables as parameters
* create a `shared_ptr<lambda.callable>`
* assign all parameters


```language
function sum (autocast ref<int> a, autocast ref<int> b) {
  return function () {
    return a + b;
  }
}
// extract the lambda function
// define parameters
function lambda_sum_001 (ref<int> a, ref<int> b) {
  return a + b;
}

function main() {
  // create the callable
  var x = new shared_ptr<lambda_sum_001.callable>(a, b)
}

```



*Examples*

```language
function sum (autocast ref<int> a, autocast ref<int> b) {
  return function () {
    return a + b;
  }
}

function main() {
  sum(10, 11)()
}
```


## Generics

*Semantics*

A generic function is a function witch parameters types (one or more) will be specified later.

For more information about templates read: [Generic programming](generic-programming.md).

*Constraints*

1. Implicit generics declaration will be filled from left to right and skipping repetitions

```
# implicit declaration
function x($a a, $b b, $c c) {}
function y($a a, $a b, $a c) {}
function z($a a, $b b, $a c, $d d) {}
# explicit declaration
function x<$a, $b, $c>($a a, $b b, $c c) {}
function y<$a>($a a, $a b, $a c) {}
function z<$a, $b, $d>($a a, $b b, $a c, $d d) {}
```

2. Implicit call will be filled from left to right

```language
function add($t a, $t b) {
  return a + b
}

function main () {
  #assert add(5, 6) == 11
  #assert add(3.1, 3.1) ~= 6.2
}
````

```error
add(5, "hello")
```

> invalid template specification 'add($t a, $t b)', '$t' is a 'int' and 'string' at the same time.


1. A function shall not be declared with and without a template.

```
function add(float a, float b) {
  return a + b 
}
function add<$t>($t a, float b) {
  return a - b 
}
```

It should be
```
function add<$t>($t a, float b) $t {
  return a - b 
}
function add<$t is float>($t a, float b) $t {
  return a + b 
}
```