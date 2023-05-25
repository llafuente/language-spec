# `function`

*Semantics*

*Constraints*

1. A function shall return `i32` by default if user don't specify a return type.

2. Empty `return` will return `0` as value if possible or raise an error if the
type conversion is not possible.

3. No `return` statement the compiler will add `return 0` as last statement in
the function body.

4. A void function shall not be assigned.

5. There is no type inference for function parameters. Use a template.

6. A function-body shall no declare types.

*Example*

```language
function sum(i32 a, i32 b) i32 {
  return a + b;
}
```
<a name="function-exit"></a>
## `function-exit`

*Semantics*

`function-exit` refer to all possible ways to quit current function:

* `return`

* `throw`

## `arguments`

```language
struct arguments {
  variant[] args
  get length { return this.args.length }

  function push(variant) {
    this.args.push(variant)
  }
}
```

If a function use arguments add this header.



## `hook`

*Semantics*

Wraps a function call.

The main usage for hook should be to replace a function causing bugs or debug input/output.

*Constraints*

1. A function can be hooked once in the same context.

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

2. Empty `throw` rethrows current handled exception.

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
throws function step1() void {
  global $error_stack

  $error_stack.push(error("simple error", __FILE__, __FUNCTION__, __LINE__))
  return void.DEFAULT
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
