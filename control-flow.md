# Control flow
<!--
  https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html
-->

## Selection statements

A selection statement selects among a set of statements depending on the value of a controlling expression.

*Constraints*

The controlling expression shall have bool type, there won't be implicit conversions.

### `if` / `else`

<!--
  https://clang.llvm.org/doxygen/classclang_1_1IfStmt.html
-->

*syntax*

```syntax
single-if-statement =
  ; nomenclature: if if-condition if-then-block
  if expression block

elseif-statement
  else single-if-statement
  elseif-statement

else-statement
  else block

if-statement =
  single-if-statement [elseif-statement] [else-statement]
```

*Semantics*

1. If the "if-condition" yields true, the "if-then-block" will be executed.
If the else part of the selection statement is present and "if-condition"
yields false, "else-then-block" will be executed.

2. If a statement of "if-then-block" is reached via a label, the "if-condition" is not evaluated and the "else-then-block" is not executed.

3. If a statement of "else-then-block" is reached via a label, the "if-condition" is not evaluated.


*Constraints*

1. "if-condition" shall have boolean type.


*Example*

```language
var x = false
var y = true

if x {
  print("x is true")
} else if y {
  print("y is true")
} else {
  print("x and y are false")
}
```

### `switch` (`case`, `break` and `fallthrough`)

<!--
  https://clang.llvm.org/doxygen/classclang_1_1SwitchStmt.html
-->

*Syntax*

```syntax
switch-statement
  case expression : statements
  default : statements

switch-statement
  switch ( expression ) { switch-statement }
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
```

As mentioned `switch` use `operator ==` so for example this is how we support regex matching for strings
```language
// interface
// function operator ==(? input, ? check) bool {
//   return true
// }

function operator ==(string input, regex check) bool {
  return check.test(input)
}
```

## Conditional Operator Statement

## Goto Statement

*Syntax*

```syntax
goto-statement
  goto label-identifier
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
loop-statement =
  loop expression [as literal[, literal] block
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

The controlling expression shall have numeric, range or implement IndexIterator.
* `numeric`: it shall repeat `loop-body` given number of times.
* `range`: it shall repeat `loop-body` starting and ending according to given range.
* `IndexIterator` it shall loop its length. An for example `$value` will have `rune` type if a `string` is given.

<!--
* if expression is a struct
 * It will be a syntax error if `as` is not used
 * It loop each property if as has only one literal, `$index` will have string type.
 * It loop each property and value is `as` has two literals (separated by commas).
-->

*Example*

The following example will print 1 to 10 and continue.
It won't fall into infinite loops, as `loop` is safe of this common pitfall.
```language
var i = 10
loop 1..i {
  ++i
  print($index)
}
```

<a name="loop-implementation"></a>
*Implementation*

`loop` it's in fact a `macro`.

The compiler shall replace the `loop` statement with a `macro` call.

```language
// helper macro to loop from start to end, one by one
#macro loop_range(#value start, #value end, #text index_name = "$index") block {
  #uid L_UID

#L_UID#_loop_restart:
  // cache input
  var index #L_UID#_$index = start
  var index #L_UID#_$max = end

#L_UID#_loop_start:
  if #L_UID#_$index < #L_UID#_$max {
    const #index_name# #L_UID#_$index

    #block#

#L_UID#_loop_continue:
    $index = $index + 1

    goto #L_UID#_loop_start:
  }

#L_UID#_loop_end: {}
}

// loop macro will generate code based on val type
#macro loop(#value val, #text index_name = "$index", #text value_name = "$value") block {
#if val is number
  #if #value_name# != "$value"
    #semantic_error "Invalid loop value, when looping a number there is no value."
  #fi

  #loop_range(1, val, #index_name#) #block#
#else if val is range
  #loop_range(val.start, val.end, #index_name#) #block#
#else if val implements RangeIterator
  #loop_range(1, val.length, #index_name#) {
    var #value_name# val[#index_name#]
    #block#
  }
#else
  #type_error "Invalid loop expression expected type: array, string, number or range."
#fi
}
```

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

<a name="foreach"></a>
### `foreach`

*Syntax*

```syntax
foreach-statement =
  foreach [identifier[, identifier]] in expression block
```

`foreach` will loop a structure.

`foreach` key has no performance impact.

`foreach` key and value has, mostly with structs, because they will be copied to
in each iteration to the stack.

*Semantics*

`foreach` shall repeat `foreach-body` for each value that given expression holds.

It will create two magic variables:
* `$index` of type index for the numeric index value
* `$value` that will hold the value of given structure.
Both magic variables can have custom names if provided.

The input is safe to be modified, change, add or remove are allowed.
*Note* Removing/changing current `$value` could make the value unusable depending on the implementations.

*Constraints*

If the structure is holding a value that will be copied to the stack, that means
modification to $value won't be reflected in the original value. But if the type
it's a pointer, then $value will modify the original.

Notice: This have performance implications.

The controlling expression need to implement `IndexIterator`

*Example*

The following example illustrate both behaviours with pointer and value.

```language
struct point {
  float x
  float y
}

// foreach by value

var list = new point[10]
list.init_push()(10, 10)

foreach k,v in list {
  v.x = 100
}

#assert list[0].x == 10 // 10, because v is copied

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
```

#### Implementation

`loop` it's in fact a `macro`.

The compiler shall replace the `loop` statement with a `macro` call.


```
// this macro
#macro foreach(#value val, #text index_name = "$index", #text value_name = "$value") block {
#if val implements IndexIterator

  #uid L_UID

#L_UID#_loop_restart:
  var index #index_name# = 0

#L_UID#_loop_check:
  if (#index_name# > val.length) {
    goto #L_UID#_loop_end
  }

  const #value_name# = val[#index_name#]

  #block#

#L_UID#_loop_continue:
  ++#index_name#

  goto #L_UID#_loop_check:


#L_UID#_loop_end: {}


#else
  #type_error "Invalid foreach expression expected type: ${type(val)} to implement IndexIterator"
}
```

<a name="for"></a>
### for
<a name="while"></a>
### while
<a name="do-while"></a>
### do-while

<a name="continue"></a>
### `continue` id

*Syntax*

```syntax
continue-statement=
  continue label-identifier
  continue number
  continue
```

*Semantics*

The `continue` statement tells a loop to stop what it???s doing and start again at
the beginning of the next iteration through the loop.

`id` represent the closest iteration to `continue`, by default 1, the closest one.
A label can be used instead to clarify.


*Example*

```language
loop 1..10 as $i {
  loop 1..10 as $j {
    if $j < 10 {
      continue // it will continue $j loop
    }
  }
}

loop 1..10 as $i {
  loop 1..10 as $j {
    if $j < 10 {
      continue 2 // it will continue $i loop
    }
  }
}

outterloop: loop 1..10 as $i {
  loop 1..10 as $j {
    if $j < 10 {
      continue outterloop // this is clearer and allowed :)
    }
  }
}
```


*Constraints*

The compiler shall traverse up searching a label with the
following pattern: `*_loop_end` and choose accordingly the given id.
Pick the first if id is not present

<a name="restart"></a>
### `restart` id

*Syntax*

```syntax
restart-statement=
  restart label-identifier
  restart number
  restart
```


*Semantics*

The `restart` statement tells a loop to stop what it???s doing and start again at
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
break-statement=
  break label-identifier
  break number
  break
```


*Semantics*

The `break` statement tells a loop to stop what it???s doing and exit.
`break` also applies to `switch` so keep it in mind when using the id.

`id` has the same meaning as explained in [`continue`](#continue).


*Constraints*

The compiler shall traverse up searching a label with the
following pattern: `*_loop_continue` and choose accordingly the given id.
Pick the first if id is not present
