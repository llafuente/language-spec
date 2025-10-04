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
  cpp - 8.5.1 The if statement [stmt.if]
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

2. If a statement of "if-then-block" or "else-then-block" is reached via a label, note that none of "if-condition" will be evaluated.

*Constraints*

1. "if-condition" shall have boolean type.

<!-- https://eslint.org/docs/latest/rules/no-dupe-else-if -->
2. if expression shall not repeat or be part of previous "if-condition"

> This branch can never execute. Its condition is a duplicate or is covered by a previous if-condition

*Example*

```language
function main() {
  var x = true
  if (x) {
    print("ok")
  } else {
    throw "unexpected else condition, x shall be true"
  }

  x = false
  if (x) {
    throw "unexpected if condition, x shall be false"
  } else {
    print("ok")
  }

  var y = true

  if x {
    throw "unexpected if condition, x shall be false"
  } else if (y) { // parenthesis are optional
    print("ok")
  } else {
    throw "unexpected else condition, y shall be true"
  }
}
```
<!--
  STUDY: swift has a functionality monster around switch
  https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow/#Switch

  https://clang.llvm.org/doxygen/classclang_1_1SwitchStmt.html

  cpp -  8.5.2 The switch statement [stmt.switch]
-->

### `switch` (`case`, `default` `break` and `fallthrough`)

*Syntax*

```syntax
switchCaseStmt
  // REVIEW syntax require block here ? also required colon ?
  : 'case' expressionList ':' functionBodyStmtList
  ;
switchDefaultStmt
  : 'default' ':' functionBodyStmtList
  ;

switchStmt
  : 'switch' expression '{' (endOfStmt? switchCaseStmt)+ (endOfStmt? switchDefaultStmt)? '}'
  ;
```


*Semantics*

1. The switch statement causes control to be transferred to one of several
statements depending on the value of a condition.

2. If all cases yields false and a `default` case is present it will be executed.

3. A `case` could have multiple conditions comma separated.
They shall be check from left to right, when any yields true: stop and execute the `case_block`.

```language-test
// declare a type with operator ==, and count the calls
global var called = 0;
type point = struct {
  int x
  int y

  operator ==(point p2) {
    ++called
    return x == p2.x && y == p2.y
  }
}

function main() {
  var p = new point(10, 10)
  var p2 = new point(11, 11)
  var p3 = new point(12, 12)
  switch(10) {
    case p2,p,p3: {
      #assert called == 2
      break
    }
    default: {
      #assert false
    }
  }
  #assert true
}
```

4. `break` will exit switch statement.

5. `fallthrough` will jump to the first statement in the next `case_block` or
`default_block`. It will not execute the `case` expression.


*Constraints*

1. `default` case shall be the last.

2. The `switch-condition` expression will be evaluated only once at the start.

```language-test
global var v = 0
function add_one() {
  ++v
  return 10 // default
}

function main() {
  var defaultCase = false
  #assert v == 0
  switch(add_one()) {
    case 0:
    case 2:
    case 3, 4, 5:
      #assert false
    default:
      defaultCase = true
  }

  #assert v == 1
  #assert defaultCase
}
```

<!--
The compiler will search for an `operator switch` that match input condition
and case condition types. If not found
-->
3. If the `switch_condition` type is not int, it will check against `operator ==`

```language-test
type point = struct {
  int x
  int y
  
  operator==(point other) {
    return other.x == x && other.y == y
  }
}

function main() {
  var p = new point(10,10)
  var p2 = new point(10,10)

  switch(p) {
    case p2:
      print("ok")
    default:
      throw "default case shall not be reached"
  }

  #assert p == p2
}

```

4. There shall be at most one `default` within a `switch` statement.

5. There shall be at least one `case` within a `switch` statement.

<!-- TODO this requires some grammar modifications -->
6. `fallthrough` or `break` shall be the last statements in a `case-block` can't be in the middle.

*Example*

We can check a value against a variety of conditions of different types.

```language
function main() {
  var string_a = "a"
  var a = io.stdin.read_line()

  switch a {
    case string_a, "b", "c": {
      print("it's a, b or c")
      fallthrough
    }
    case "d": {
      print("it's a, b, c or d")
      break
    }
    case /^[e-z]/: {
      print("starts with letter from e to z")
      break
    }
    default: {
      print("maybe a number or uppercase?")
    }
  }
}
```

As mentioned `switch` use `operator ==` so for example this is how we support regex matching for strings

```language
// interface
// operator ==(? input, ? check) bool {
//   return true
// }

operator ==(ref<string> input, ref<regex> check) bool {
  return check.test(input)
}
```

5. There shall be no empty `case`


## Conditional Operator Statement

## Goto Statement

*Syntax*

```syntax
gotoStmt
  : 'goto' identifier
  ;
```


*Semantics*

1. A goto statement causes an unconditional jump to the statement prefixed
by the named label


*Constraints*

1. The label identifier in a goto statement shall target a labeled statement
located in the enclosing function.

> labeled statement with name '?:label_identifier' not found at function '?:function_name'

```language-semantic-error
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



<!--
  https://stackoverflow.com/questions/12992108/crosses-initialization-of-variable-only-when-initialization-combined-with-decl
-->
2. A jump shall not skip the declaration or initilization of any variable used
later or a semantic error shall raise

> goto ':?identifier' crosses initialization of ':?var_identifier' declared at ':?file:?line:?column'

```language-semantic-error
function main() {
  var int a = 5;
  goto JUMP;

  var b = 1;

  JUMP: {
    #assert a == 1
    #assert b == 0
  }
}
```

This includes, compiler variables.

```language-semantic-error
function main() {
  goto JUMP;

  loop 10 {
    JUMP: {
      #assert $index >= 0
    }
  }
}
```

## Iteration statements

* [`loop`](#loop)
* [`for`](#for)
* [`foreach`](#`foreach)
* [`while`](while) and [`do-while`](#do-while).

With the following jump statements

* `restart` can be used in any iteration.
* `continue` can be used in any iteration.
* `break` can be used in any iteration and `switch`

<a name="loop"></a>
### `loop`

*Preamble*

`loop` is a swiss army knife to iterate it enforces readability of what is the intend of the programmer

It's safe from infinite loops and it's should be safe from modifications.

Here is a few examples of what you can achieve.

* loop elements from start to last (default)
  ```language
  function main() {
    var iterable = [1, 2, 3, 4, 5]
    var chk = []
    loop iterable {
      chk.push($value)
    }
    #assert chk == [1,2,3,4,5]
  }
  ```

* loop a slice of elements (create the safe iterator)
  ```language
  function main() {
    var iterable = [1, 2, 3, 4, 5]
    var chk = []
    // start at 3rd element (index = 2), 3 elements
    loop iterable.safe_iterator(2,3) {
      chk.push($value)
    }
    #assert chk == [3, 4, 5]
  }
  ```

* loop elements until a condition is met:
  ```language
  function main() {
    var iterable = [1, 2, 3, 4, 5]
    var chk = []
    loop iterable until $value == 4 {
      chk.push($value)
    }
    #assert chk == [1,2,3]
  }
  ```

* loop elements while a confitionn is met:
  ```language
  function main() {
    var iterable = [1, 2, 3, 4, 5]
    var chk = []
    loop iterable while $value < 5 {
      chk.push($value)
    }
    #assert chk == [1,2,3,4]
  }
  ```

* loop only element that match certain criteria
  ```language
  function main() {
    var iterable = [1, 2, 3, 4, 5]
    var chk = []
    // only odds
    loop iterable where $value % 2 == 0 {
      chk.push($value)
    }
    #assert chk == [2,4]
  }
  ```

If you want to iterate starting below the start, send a built iterator for example:

```language-test
function main() {
  var arr = [1, 2, 3, 4, 5, 6]
  var check = []
  
  // 3rd element will be the first, 5th will be the last
  loop arr.iterator(3, 2)  {
    check.push($value);
  }
  #assert check == [3,4,5]
  #assert typeof(arr) == array<i64>
  #assert typeof(check) == array<i64>
}
```

*Syntax*

```syntax
loopStmt
  : 'loop'
    ((value=identifier 'in') | (key=identifier ',' value=identifier 'in'))?
    loop_limit_expr=expression
    ('where' where_expr=expression)?
    (('until' until_expr=expression) | ('while' while_expr=expression))?
    loop_body=functionBody
  ;
```

*Semantics*

1. `loop` will repeat `loop_body` a pre-defined number of times, defined prior the first iteration.

```language-test
function main() {
  var arr = []
  var i = 10
  // it will loop 10 times.
  loop i {
    i = 20 // regardless i being modified inside the loop
    arr.push(i)
  }
  #assert arr == [0,1,2,3,4,5,6,7,8,9]
}
```

2. Inside `loop_body` there will be two compiler variables available. If defined they shall be renamed.

  * `$keyType $index`: holds the index value, key_type depends on the `has_safe_iterator` used.

  * `$valueType $value`: holds the value of given structure if needed, value_type depends on the `has_safe_iterator` used.

```language-test
function main() {
  // numeric loop: $index and $value are the same.
  var indexes = []
  var values = []
  loop 10 {
    indexes.push($index)
    values.push($value)
  }
  #assert indexes == [0,1,2,3,4,5,6,7,8,9]
  #assert values == [0,1,2,3,4,5,6,7,8,9]

  indexes = []
  values = []
  loop value in 10 {
    indexes.push($index)
    values.push(value)
  }

  #assert indexes == [0,1,2,3,4,5,6,7,8,9]
  #assert values == [0,1,2,3,4,5,6,7,8,9]

  indexes = []
  values = []
  loop index, value in 10 {
    indexes.push(index)
    values.push(value)
  }

  #assert indexes == [0,1,2,3,4,5,6,7,8,9]
  #assert values == [0,1,2,3,4,5,6,7,8,9]
}
```

3. `where_expr` can be defined.

* `loop_body` will be executed when `where_expr` yields true. If yields false it will continue with the next element.

Inside `where_expr`: `$key` and `$value` (or the user defined names) will be available.

```language-test
function main() {
  var indexes = []
  var values = []
  loop 10 where $index > 4 {
    indexes.push($index)
    values.push($value)
  }
  #assert indexes == [5,6,7,8,9]
  #assert values == [5,6,7,8,9]
}
```

3. `until_expr` or `while_expr` can be defined.

* `loop_body` will be executed until `until_expr` yields false, it stops stops the `loop` if yields true.

* `loop_body` will be executed while `while_expr` yields true, it stops stops the `loop` if yields false.

Inside `until_expr` and `while_expr`: `$key` and `$value` (or the user defined names) will be available.

```language-test
function main() {
  var indexes = []
  var values = []
  loop 10 where $index > 4 until $index == 8 {
    indexes.push($index)
    values.push($value)
  }
  #assert indexes == [5,6,7]
  #assert values == [5,6,7]
}
```

*Constraints*

1. `loop` shall cache the `loop_limit_expr`, so it's safe to expression modifications,
see example below for more info. If your loop need to change behaviour for example
because the length of the string is changes use another loop statement like:
[`for`](#for) / [`foreach`](#foreach) / [`while`](#while) or [`do-while`](#do-while)

```language-test
function main() {
  var i = 5
  var iterations = []
  loop i {
    i = 10
    iterations.push($index)
  }
  #assert i == 10
  #assert iterations == [0, 1, 2, 3, 4]
}
```

2. `loop_limit_expr` shall have on of the following types:

* `numeric`: It shall repeat `loop_body` given number of times
  * If `loop_limit_expr` is positive, from 0 till given number adding one.
  * If `loop_limit_expr` is negative from 0 till given number substracting one.
  * `$keyType` and `$valueType` will be `i64`

* `range`: It shall repeat `loop_body` starting and ending according to given range.
  * `$keyType` and `$valueType` will be `i64`

* `has_safe_iterator<$keyType, $valueType>`: It shall loop the type from start to end.
  * Call `next()` to move the next elements.
  * Call `get_key()` to get the key value.
  * Call `get_ref_value()` to get a reference to the value.

<!--
* if expression is a struct
 * It will be a syntax error if `as` is not used
 * It loop each property if as has only one literal, `$index` will have string type.
 * It loop each property and value is `as` has two literals (separated by commas).
-->

*Remarks*

There is no (meaningful) way to increment a number different than one, use [`for`](#for) instead.

*Examples*

*Numeric* input.
```language-test
function main() {
  // Using positive *number*.
  var values = []
  loop 10 {
    values.push($index)
  }
  #assert values == [0,1,2,3,4,5,6,7,8,9]

  // Using negative *number*.
  var values = []
  loop -10 {
    values.push($index)
  }
  #assert values == [0,-1,-2,-3,-4,-5,-6,-7,-8,-9]
}
```

Using *range*: The following example will print 1 to 10 and continue.

It's not an infinite loop because the loop-expression is cached at start.

```language-test
function main() {
  var i = 10
  var arr = []
  loop 1 .. i {
    ++i
    arr.push($index)
  }
  #assert arr == [1, 2, 3, 4, 5, 6, 7, 8, 9]
  #assert i == 19
}
```

Using *safe_iterator*

```language-test
function main() {
  var src = [1, 2, 3, 4, 5]
  var dst = []

  loop v in src {
      dst.push(v)
      src.pop()
  }

  #assert src.length == 0
  #assert dst == [1, 2, 3, 4, 5]

  loop v in dst {
      src.push(v)
      dst.push(99)
      dst[$index] = 1
  }

  #assert src.length == 5
  #assert src == [1, 2, 3, 4, 5]

  #assert dst.length == 10
  #assert dst == [1, 1, 1, 1, 1, 99, 99, 99, 99, 99]
}
```


<a name="loop-rationale"></a>
*Rationale* 

Why it's expression is cached?
* `for` and `do` do not cache, so someone has to do it.
* `foreach` is unsafe to
 Because it use safe iterator. It's an optimization for 
most usages. You can use regular [#for](`for`) instead.

most of the time people loop a list to filter, that exactly what you do in SQL Select,
so we could have a similar syntax.

* `select key, value from objects where value.favourite = TRUE`
* `loop key,value in objects where value.favourite`


<a name="loop-implementation"></a>
*Implementation*

`loop` it's in fact a `macro`, depending on the input.

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
  : 'foreach'
    ((value=identifier 'in') | (key=identifier ',' value=identifier 'in'))?
    foreach_expr=expression
    foreach_body=functionBody
  ;
```

*Preamble*

Unlike `loop` it's not safe. You can fall into infinite loops, it's also not safe to some modifications but It will try to follow your modifications to the structure.

```language-test
function main() {
  var arr = [1, 2, 3, 4, 5]
  // it will loop 5 times.
  loop arr {
    arr.push($value)
  }
  #assert arr == [1,2,3,4,5,1,2,3,4,5]

  // but foreach will "infinite loop"
  var arr2 = [0]
  // it will loop 5 times.
  foreach arr2 {
    arr2.push($index)
    if ($index == 20) {
      break
    }
  }
  #assert arr2 == [0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
}
```

*Semantics*

1. `foreach` shall repeat `foreach_body` one per element.

2. Inside `foreach_body` there will be two compiler variables available. If defined they shall be renamed.

  * `key_type $index`: holds the index value, type will be defined by the iterator.

  * `value_type $value`: holds the value, type will be defined by the iterator.

3. `foreach_expr` shall implement `index_iterator<$keyType, $valueType>`

  * Call `next()` to move to next element

  * Call `get_key()`

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
  : 'do' functionBody ('while' | 'until') expression
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

```language-test
function continue_test() {
  loop i in 1 .. 10 { // TODO fix parser, needs a space to detect a range
    loop j in 1 .. 10 {
      if j < 5 {
        continue // it will skip first 5
      }
    }
  }
}

function continue_with_number_test() {
  // 10x10 array zero-initialized
  var arr = new[10][10](0)

  loop i in 1 .. 10 {
    loop j in 1 .. 10 {
      if i < 5 {
        continue 2 // it will skip the first 5 continue i loop
      }
      arr[i][j] = 1
    }
  }

  // now the top side is 0, and bottom side is 1
  loop 5 {
    #assert arr[$index] == [0,0,0,0,0,0,0,0,0,0]
  }
  loop 5 {
    #assert arr[5 + $index] == [1,1,1,1,1,1,1,1,1,1]
  }
}

function continue_with_label() {
  // 10x10 array zero-initialized
  var arr = new[10][10](0)

  outterloop: loop i in 1 .. 10 {
    loop j in 1 .. 10 {
      if j < 5 {
        continue outterloop // this is clearer and allowed :)
      }
      arr[i][j] = 1
    }
  }

  // now the top side is 0, and bottom side is 1
  loop 5 {
    #assert arr[$index] == [0,0,0,0,0,0,0,0,0,0]
  }
  loop 5 {
    #assert arr[5 + $index] == [1,1,1,1,1,1,1,1,1,1]
  }
}

function main() {
  continue_test()
  continue_with_number_test()
  continue_with_label()
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
