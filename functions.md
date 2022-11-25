# Functions


## Implementations notes

* A function return by default `i32 = 0`
* When a function return `void` return the default value.
* The compiler dissalow assignament if void is used.


## `function`

```
function sum(i32 a, i32 b) i32 {
  return a + b;
}
```

## `hook`

Wrap a function call, hook can be used once in the current file context.

The main usage for hook should be to replace a function causing bugs or debug input/output.

```
hook sum(i32 a, i32 b) i32 {
  print("sum", a, b)
  r = @hook(a, b);
  return r;
}
```

## defer

A defer statement defers the execution of a function call until the surrounding function returns.

Defer is function block.
