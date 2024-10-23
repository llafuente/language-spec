<!-- 
  c: 6.8.4 Selection statements
  swift: https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html -->

# Control flow

## Selection statements

*Syntax*


```syntax
selectionStmts
  : ifStmt
  | switchStmt
  | gotoStmt
  | loopStmt
  | forStmt
  | foreachStmt
  | whileStmt
  | doWhileStmt
  | continueStmt
  | restartStmt
  | breakStmt
  | fallthroughStmt
  ;
```

*Semantics*

A selection statement selects among a set of statements depending on the value of a controlling expression.

*Constraints*

The controlling expression shall have bool type, there won't be implicit conversions.

### `if` / `else`

<!--
  https://clang.llvm.org/doxygen/classclang_1_1IfStmt.html
-->

*syntax*

```syntax
ifSelectionStmt
  // REVIEW syntax require block here ?
  : 'if' expression functionBody
  ;

elseSelectionStmt
  : 'else' functionBody
  ;

ifStmt
  : ifSelectionStmt ('else' ifSelectionStmt)* elseSelectionStmt?
  ;
```

*Semantics*

1. If the "if-condition" yields true, the "if-then-block" will be executed.
If the else part of the selection statement is present and "if-condition"
yields false, "else-then-block" will be executed.

2. If a statement of "if-then-block" is reached via a label, the "if-condition" is not evaluated and the "else-then-block" is not executed.

3. If a statement of "else-then-block" is reached via a label, the "if-condition" is not evaluated.


*Constraints*

1. "if-condition" shall have boolean type.

<!-- https://eslint.org/docs/latest/rules/no-dupe-else-if -->
2. if expression shall not repeat or be part of previous "if-condition"

> This branch can never execute. Its condition is a duplicate or is covered by a previous if-condition


*Example*

```language
function main() {
  var x = false
  var y = true

  if x {
    print("x is true")
  } else if y {
    print("y is true")
  } else {
    print("x and y are false")
  }
}
```

### `switch` (`case`, `break` and `fallthrough`)

<!--
  https://clang.llvm.org/doxygen/classclang_1_1SwitchStmt.html
-->

*Syntax*

```syntax
switchCaseStmt
  // REVIEW syntax require block here ? also required colon ?
  : 'case' expression ':'  functionBodyStmtList
  | 'default' ':' functionBodyStmtList
  ;

switchStmt
  : 'switch' expression '{' endOfStmt? switchCaseStmt? '}'
  ;
```


*Semantics*

The switch statement causes control to be transferred to one of several
statements depending on the value of a condition. If no match is found and
`default` part is present it will be executed.

A `case` could have multiple conditions comma separated.
If one check yields true, the `case-block` will be executed.

`break` will exit switch statement.

`fallthrough` will jump to the first statement in the next `case-block` or
`default-block`.


*Constraints*

`switch condition expression` will be evaluated once, the cached value will be
used in each case condition check.

<!--
The compiler will search for an `operator switch` that match input condition
and case condition types. If not found
-->
The compiler will search for an `operator ==`
that match input condition and case condition types.

There shall be at most one `default` within a `switch` statement.

There shall be at least one `case` or `default` within a `switch` statement.

`fallthrough` shall be the last statement in a `case-block`.

The last statement of a `case-block` must be `break` or `fallthrough`.

*Example*

We can check a value against a variety of conditions of different types.

```language
function main() {
  switch string_value {
    case string_a, string_b, string_c:
      fallthrough
    case string_d:
      // do something
      break
    case "constant-string":
      // do something
      break
    case /^abc/:
      // do something
      break
    default
  }
}
```

As mentioned `switch` use `operator ==` so for example this is how we support regex matching for strings

```language
// interface
// operator ==(? input, ? check) bool {
//   return true
// }

operator ==(string input, regex check) bool {
  return check.test(input)
}
```

## Conditional Operator Statement

## Goto Statement

*Syntax*

```syntax
gotoStmt
  : 'goto' identifier
  ;
```


*Semantics*

A goto statement causes an unconditional jump to the statement prefixed
by the named label


*Constraints*

The identifier in a goto statement shall name a label located somewhere in the enclosing
function.

A jump shall not skip the declaration or initilization of any variable used
later.


*Example*

```language
function x() i8 {
  //start
  goto end

end:
  return 1;
}

```

Error Example:

```language
// STUDY: which error ?
// first -> labels must be unique
// second -> labels can repeat, but not inside the same function
// semantic error: goto's target label must be inside the same function
// semantic error: could not find 'end' label inside 'x' function
function y() i8 {
end:
  return 1;
}
function x() i8 {
  //start
  goto end

  return 0;
}
```

Invalid usage.
While goto statement can jump anywhere inside a function should not skip
variable declaration or initialization.
This example is valid syntactically and semantically but yields an error

```
function main() {
  goto skip_decl; // semantic error: jump bypasses initialization of variable
  {
    var x = 1
skip_decl:
    print(x)
  }
}
```

## Loop Statements

We have a few loop statements: `loop`, `for`, `foreach`, `while` and `do-while`.

There are special statements inside loop with specific behaviour, explained below:

* `restart` will affect all.
* `continue` will affect all.
* `break` will affect all and `switch`

<a name="loop"></a>
### `loop`

*Syntax*

```syntax
loopStmt
  : 'loop' (identifier (',' identifier)? 'in')?  expression functionBody
  ;
```


*Semantics*

1. `loop` will repeat `loop body` a pre-defined number of times.

2. It will create a magic variable `$index` for the numeric index value, and
`$value` that will hold the value of given structure if needed. Both magic
variables can have custom names if provided.


*Constraints*

`loop` shall cache the loop-expression, so it's safe to expression modifications,
see example below for more info. If your loop need to change behaviour for example
because the length of the string is changes use another loop statement like:
[`for`](#for) / [`foreach`](#foreach) / [`while`](#while) or [`do-while`](#do-while)

There is no way to increment a number different than one,
use [`for`](#for) instead.

The controlling expression shall have numeric, range or implement index_iterator.
* `numeric`: it shall repeat `loop-body` given number of times.
* `range`: it shall repeat `loop-body` starting and ending according to given range.
* `safe_iterator` it shall loop the structure cloning if necessary.

<!--
* if expression is a struct
 * It will be a syntax error if `as` is not used
 * It loop each property if as has only one literal, `$index` will have string type.
 * It loop each property and value is `as` has two literals (separated by commas).
-->

*Example: number*

It will print from 0 to 10

```language
function main() {
  loop 10 {
    print($index)
  }
}
```

*Example: number*

It will print from 0 to -10

```language
function main() {
  loop -10 {
    print($index)
  }
}
```


*Example: range*

The following example will print 1 to 10 and continue.
It won't fall into infinite loop because the expression is cached at start.

```language
function main() {
  var i = 10
  loop 1..i {
    ++i
    print($index)
  }
}
```

*Example: safe_iterator*

The following example will print all keys and elements in the array and remove one (last)
At the end the array will be empty but loop is safe :)

```language
function main() {
  var arr = [1, 2, 3, 4, 5]
  loop arr {
    print($index, $value)
    arr.pop()
  }
  print(arr)
}
```

<a name="loop-implementation"></a>
*Implementation*

`loop` it's in fact a `macro`.

The compiler shall replace the `loop` statement with a `macro` call to
[core/loop.language](../../core/loop.language)

<!--
### Advanced usage of loop.

```
loop <struct> as $key, $value { // $index = 0; $index < num_properties(<struct>); ++$index
  $index
  $key = get_property(<struct>, $index)
  $value = get_value(<struct>, $index)
}

loop <number> every 500ms {
  // startTime = get_ms()


  // endTime =
  sleep(500 - get_ms() - startTime)
}
```
## while loop

```
loop ? while <Exception> {
  // loop until no exception
}
```

```
<unique-name>: loop ? {
  try {
    // block
  } catch e {
    if (e instanceof <Exception> && e.message == <Exception>.message) {
      continue <unique-name>
    }
    break <unique-name>
  }
}
```
-->

<a name="for"></a>
### `for`

*Semantics*

c-style for loop.

*Syntax*

```syntax
forCondition
    : (blockVariableDeclStmt | expression)? ';' forExpression? ';' forExpression?
    ;

forExpression
  : assignment_expr (',' assignment_expr)*
  ;

forStmt
  : 'for' '(' forCondition ')' functionBody
  ;
```

<a name="foreach"></a>
### `foreach`

*Syntax*

```syntax
foreachStmt
  : 'foreach' (identifier (',' identifier)? 'in')? expression functionBody
  ;
```

`foreach` will loop a structure.

`foreach` key has no performance impact.

`foreach` key and value has, mostly with structs, because value will be copied
in each iteration to the stack.

*Semantics*

`foreach` shall repeat `foreach-body` for each value that given expression holds.

It will create two magic variables:

* `$index` of type index for the numeric index value
* `$value` that will hold the value of given structure.

Both magic variables can have custom names if provided.

The input is safe to be modified, change, add or remove are allowed.
*Note* Removing/changing current `$value` could make the value unusable
depending on the implementations.

*Constraints*

If the structure is holding a value that will be copied to the stack, that means
modification to $value won't be reflected in the original value. But if the type
it's a pointer, then $value will modify the original.

Notice: This have performance implications.

The controlling expression need to implement `index_iterator`

*Example*

The following example illustrate both behaviors with pointer and value.

```language
type point = struct {
  float x
  float y
}

function main() {
  // foreach by key and value

  var list = new array<point>(10)
  list.init_push()(10, 10)
  #assert(list.len == 1)
  #assert(list.cap == 10)
  #assert(list[0].x == 10)
  #assert(list[0].y == 10)

  foreach k,v in list {
    v.x = 100
  }

  #assert(list[0].x == 10) // 10, because v is copied

  // foreach by key and modify value
  foreach k in list {
    list[k].x = 100
  }

  #assert list[0].x == 100 // 100, because we access directly the array memory

  // foreach by reference

  var list2 = new ptr<point>[10]
  list.push(new point(10, 10))
  foreach k,v in list {
    v.x = 100
  }

  #assert list[0].x == 100 // 100, because we copied the pointer but modify the target memory

  foreach k,v in list {
    list.clear_pop()
    #assert v.x == 0 // v is "safe" but logically, shouldn't be used as the array is empty
    // list[k] will give a runtime error because it's empty.
  }

  #assert list.length == 0
  #assert list.capacity == 10
}
```

#### Implementation

`loop` it's in fact a `macro`.

The compiler shall replace the `loop` statement with a `macro` call.



<a name="while"></a>
### while

```syntax
whileStmt
  : 'while' expression functionBody
  ;
```


<a name="do-while"></a>
### do-while

```syntax
doWhileStmt
  : 'do' functionBody 'while' expression
  ;
```

<a name="continue"></a>
### `continue` id

*Syntax*

```syntax
continueStmt
  : 'continue' (identifier | numberLiteral)?
  ;
```

*Semantics*

The `continue` statement tells a loop to stop what it’s doing and start again at
the beginning of the next iteration through the loop.

`id` represent the closest iteration to `continue`, by default 1, the closest one.
A label can be used instead to clarify.


*Example*

```language
function main() {
  loop i in 1..10 {
    loop j in 1..10 {
      if j < 10 {
        continue // it will continue $j loop
      }
    }
  }

  loop i in 1..10 {
    loop i in 1..10 {
      if j < 10 {
        continue 2 // it will continue $i loop
      }
    }
  }

  outterloop: loop i in 1..10 {
    loop 1..10 as j {
      if j < 10 {
        continue outterloop // this is clearer and allowed :)
      }
    }
  }
}
```


*Constraints*

The compiler shall traverse up searching a label with the
following pattern: `*_loop_continue` and choose accordingly the given id.
Pick the first if id is not present

<a name="restart"></a>
### `restart` id

*Syntax*

```syntax
restartStmt
  : 'restart' ( identifier | numberLiteral )?
  ;
```


*Semantics*

The `restart` statement tells a loop to stop what it’s doing and start again at
the beginning.

`id` has the same meaning as explained in [`continue`](#continue).


*Constraints*

The compiler shall traverse up searching a label with the
following pattern: `*_loop_restart` and choose accordingly the given id.
Pick the first if id is not present


<a name="break"></a>
### `break` id

*Syntax*

```syntax
breakStmt
  : 'break' ( identifier | numberLiteral )?
  ;
```


*Semantics*

The `break` statement tells a loop to stop what it’s doing and exit.
`break` also applies to `switch` so keep it in mind when using the id.

`id` has the same meaning as explained in [`continue`](#continue).


*Constraints*

The compiler shall traverse up searching a label with the
following pattern: `*_loop_break` and choose accordingly the given id.
Pick the first if id is not present

<a name="fallthrough"></a>
### `fallthrough`

*Syntax*

```syntax
fallthroughStmt
  : 'fallthrough'
  ;
```

*Semantics*

The `fallthrough` statement tells to continue with the next `switch-case`

*Constraints*

1. fallthrough shall be used only inside a switch case
