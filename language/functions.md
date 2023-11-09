# `function`

## Declaration

*Syntax*

```syntax
function_decl
  : 'function' identifier '(' function_parameter_list ')' type+ function_body
  ;

function_body
  : '{' function_statements* '}'
  ;
function_statements
  : block_variable_declaration_statement
  | expression
  ;

function_parameter_list
  : (function_parameter (',' function_parameter)*)?
  ;

function_parameter
  : type identifier ('=' (constant | string_literal))?
  ;
```


*Semantics*

*Constraints*

1. A function shall return `i32` by default if user don't specify a return type.

2. If Empty `return` is found the compiler will add `0` as value.

3. If no `return` statement the compiler will add a `return 0` statements
as last statement in the function body.

4. A void function shall not be assigned at function call.

5. Parameters types shall be implicit (no inference)

6. The function `return` type shall not be a template unless that template is
the type of at least one parameter.

*Example*

```language
function sum(i32 a, i32 b) i32 {
  return a + b;
}
```

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

[1, 2, 3].sort(isort)

print(type isort)


```


<a name="function-exit"></a>
## `function-exit`

*Semantics*

`function-exit` refer to all possible ways to quit current function:

* `return` (implicit or explicit)

* `throw`

## function `parameters`

### parameter types

*Constraints*

1. All parameters must have a type.


### function parameter modifiers

#### writable (implicit)

*Semantics*

The parameter memory can be not be modified

*Constrains*

1. The parameter itself shall not be modified

#### readonly (const)

*Semantics*

Parameter (and it's memory) shall not be modified.

*Constrains*

1. The variable shall not be in a `left hand side` assigned.

2. A method that modified the value shall no be called.

3. Another function that modified the value shall not be called.

4. A readonly parameters shall not be casted to a non-readable type.

*Example*

```language
struct point {
  float x;
  float y;

  setX(float x) {
    this.x = x
  }
  setY(float y) {
    this.y = y
  }
}

// ok
function sum_func1(readonly p1 point, readonly p2 point) point {
  return point {x: p1.x + p2.x, y: p1.y + p2.y };
}

// Constrains 1
function sum_func2(readonly p1 point, readonly p2 point) point {
  p1.x += p2.x
  p1.y += p2.y
  return p1
}

// Constrains 2
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
