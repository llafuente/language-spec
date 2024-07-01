<!--
  c - 6.9.1 Function definition
-->


# `function`

## Declaration

*Syntax*

```syntax
returnStmt
  //TODO : 'return' expression
  : 'return'
  ;

// TODO NOTE some are only valid inside struct, maybe we should move it
functionDecl
  : functionDef functionBody
  ;

functionDef
  : 'pure'? 'function' identifier '(' functionParameterList? ')' typeDefinition?
  ;

memoryFunctionDecl
  : memoryFunctionDef functionBody
  ;
memoryFunctionDef
  : ('new'|'delete'|'clone') '(' functionParameterList? ')' typeDefinition?
  ;

operatorFunctionDecl
  : operatorFunctionDef functionBody
  ;

operatorFunctionDef
  : 'operator' overloadableOperators '(' functionParameterList? ')' typeDefinition?
  ;

overloadableOperators
  : '+'
  | '-'
  | '*'
  | '/'
  | '^'
  | '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '^='
  | '.'
  | '?.'
  | '[' ']'
  | '++'
  ;

functionBody
  : end_of_statement? '{' functionBodyStmtList '}' end_of_statement?
  ;

functionBodyStmtList
  : end_of_statement? (functionBodyStmt end_of_statement)*
  ;

labeledStatement
  : identifier ':' functionBodyStmt
  ;

blockStatement
  : '{' end_of_statement? functionBodyStmtList '}'
  ;

functionBodyStmt
  : labeledStatement
  | blockStatement
  | comments
  | typeDecl
  | functionDecl
  | expression
  | selectionStmts
  // function exclusive
  | returnStmt
  | blockVariableDeclStmt
  ;

functionParameterList
  : functionParameter (',' functionParameter)*
  ;

functionParameter
  : 'autocast'? typeDefinition identifier ('=' constant)?
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

xxx = 10                   // point 1 stderr: A function name shall not be used in lhs expression
var x = xxx                // point 2
print(xxx.arguments)       // point 2 stdout: []
print(xxx.return_type)     // point 2 stdout: i32
print(type(xxx))           // point 4 stdout: function xxx() i32
print(type(xxx).arguments) // point 4 stdout: []

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

// inline declaration
type xxx = function(i32 a, i32 b) i32

print([1, 2, 3].sort(isort))

// equivalent ?
#assert type isort === type xxx
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


### function parameter modifiers

#### writable (implicit)

*Semantics*

The parameter memory can be modified

*Constrains*

1. The parameter itself shall not be modified


```language
function xxx(writable ref<i32> a) i32 {
  a = 10;
  // fail
  a = new ref<i32>(11); // a contents are writable but a is constant
}

xxx(10) // fail, as 10 is not writable, also not a pointer
var ref<i32> i = new ref<i32>(10);
xxx(i) // fail, as 10 is not writable, also not a pointer

```


#### readonly (const)

*Semantics*

Parameter (and it's memory) shall not be modified.

*Constrains*

1. The variable shall not be in a `left hand side` assignament.

2. Any property of an object shall not be in a `left hand side` assignament.

3. A method that modified the value shall no be called.

4. Another function that modified the value shall not be called.

5. A readonly parameters shall not be casted to a non-readable type.

*Example*

```language
struct point {
  float x;
  float y;

  // real function signature: setX(writable point this, float x)
  setX(float x) {
    this.x = x
  }
  // real function signature: setY(writable point this, float y)
  setY(float y) {
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


var point = func_add_ok(point{x: 0, y: 1}, point{x: 2, y: 0})




```

#### output

*Semantics*

Mark the parameter as a reference output (explicit pointer).

An output parameter can be in a left hand side assignment.

*Example*

```language
function reset(output a int) {
  a = 0
}

int a = 1;
print a // stdout: 1
reset(a)
print a // stdout: 0
```

#### lend

*Semantics*

Lend mark the parameter as output and additionally lend the memory to the callee,
that should handle it from now on. if not handled it will be freed at the end of
call block

* Constrains*

1. Stack memory shall not be lend.

2. All function paths must lend memory or null.

3. lend shall not have default value.

#### own

*Semantics*

The parameter memory will be owned

*Constrains*

1. All function exits the memory should be lend or deleted.

```language
function free_array(own array<$t> arr) {
  delete arr
}

function free_array_error(own array<$t> arr) {
  if (arr.length) {
    delete arr
  }
}
```

### Default parameters

*Semantics*

1. A default parameter will be inserted at function call by the compiler.

2. It's a compiler construct but don't has runtime cost.

*Constraints*

1. Default parameter value shall have a static value.


### `arguments` keyword

*Semantics*

1. it's a magic variable that holds the arguments passed with type:
*array&lt;variant&gt;*

2. It's a compiler construct, it has runtime cost.

3. It's the way to access unnamed varargs (c style).

*Constraints*

1. `arguments` shall be used only in function body.

2. At least one parameters shall be declared to use arguments inside a function.

*Example*

```language
// default
function sum (int a, int b) {
  return a + b
}

// same but using arguments, slower
function sum2 (int a, int b) {
  return arguments[0] + arguments[1]
}

// mandatory when using varargs
function sum3 (...) {
  int total = 0;
  print(typeof arguments); // stdout: array<variant>
  for (int i = 0; i < arguments.length; ++i) {
    total += arguments[i]
  }
  return total
}

```

If a function use arguments add this header.

## Named varargs

*Semantics*

*Constraints*

1. Named varargs are not compatible with C, because it's a compiler construct.

2. At least one parameters must be send.

*Example*

```language
function join(string list...) {
  // list type is not string
  // it's string[] list
}
function joinBy(string list..., rune x) {
  // string[] list
}
function join_anything(variant list) {
  // variant[] list
}
```

## `hook`

*Semantics*

Wraps a function call.

The main usage for hook should be to replace a function causing bugs or debug input/output.

*Constraints*

1. A function can be hooked once in the same context.

2. Declared function must have the same type as hooked one.

*Example*

```language
function sum(i32 a, i32 b) i32 {
  return a + b
}

hook sum(i32 a, i32 b) i32 {
  var r = @hook(a, b);
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
try {
  throw "x"
} catch (e) { // catch all exceptions
  // rethrow
  throw
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
  return 0
}

throws function step2() i32 {
  global $error_stack

  step1()
  if ($error_stack.length) {
    $error_stack.last.addTrace(__FILE__, __FUNCTION__, __LINE__)
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

A defer statement defers the execution of a function call until the surrounding [function-exits](#function-exit).


*Constraints*

1. Defer shall be compiler feature and not a runtime.

2. `defer` shall honor scope and raise error if a parameter is out-of-scope at
any [function-exit](#function-exit).

*Example*

```language
function add_one(i32 a) void {
  defer print("add_one", a)
  defer () => {print("add_one", a)}
  ++a
}

x(10)
x(15)
```

```output
add_one 11
add_one 16
```

*Example 2*

```language
function add_one(i32 a) void {
  defer print("add_one", a)
  ++a
}
```

*Generation*

```language
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

```language
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
