# Control flow
<!--
  https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html
-->

## Selection statements

A selection statement selects among a set of statements depending on the value of a controlling expression.

*Constraints*

The controlling expression shall have bool type, there won't be implicit conversions.

### `if` / `else`

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

Executes the next block of code if the the given condition yields true.

If the "if-condition" yields true the "if-then-block" will be executed.
If the else part of the selection statement is present and "if-condition"
yields false, "else-then-block" will be executed.

if a statement of "if-then-block" is reached via a label, the "if-condition" is not evaluated and the "else-then-block" is not executed.

if a statement of "else-then-block" is reached via a label, the "if-condition" is not evaluated.


```language
if x {

} else if y {

} else {

}
```

### `switch` (`case`, `break` and `fallthrough`)

*Syntax*

```syntax
switch-statement
  case expression : statements
  default : statements

switch-statement
  switch ( expression ) { switch-s }
```
*Semantics*

The switch statement causes control to be transferred to one of several
statements depending on the value of a condition. If no match is found and
`default` part is present it will be executed.

A `case` could have multiple conditions comma separated.
If one check yields true the `case-block` will be executed.

`break` will exit switch statement.

`fallthrough` will jump to the first statement in the next `case-block` or
`default-block`.

*Constraints*

switch condition expression will be evaluated once, the cached value will be
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

The last stament of a `case-block` must be `break` or `fallthrough`.

*Examples*
```language
switch value {
  case a, b, c:
    fallthrough
  case d:
    // do something
    break
  case /^abc/:
    // do something
    break
  default
}
```


`switch` can be overriden by an operator with the following interface:
```language
// interface
// function operator switch(? input, ? check) bool {
//   return true
// }

// real example
struct point {
  float x
  float y
}

function operator switch(point input, point check) bool {
  return point.x == check.x && point.y == check.y
}
```

## Conditional Operator Statement

## Goto Statement

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

## Loop Statements

We have a few loop statements: `loop`, `for`, `foreach`, `while` and `do-while`.

`restart` will affect all.

`continue` will affect all.

`break` will affect all and `switch`

<a name="loop"></a>
### `loop`

*Syntax*

```syntax
loop-statement =
  loop expression [as literal[, literal] block
```

*Semantics*

`loop` will repeat given block of code, loop body, a defined number of times.

It will create a magic variable `$index` for the numeric index value, and
`$value` that will hold the value of given structure if needed. Both magic
variable can have custom names if provided.

*Constraints*

`loop` is meant to be top performant. It will cache the expression, won't
reevaluate in each loop, that makes `loop` unsafe to input modifications.
In case you want to modify the array/string input use foreach instead as use an
(slower but safer) iterator.

There is no way to increment a number different than one,
use [`for`](#for) instead.

The controlling expression shall have numeric, range, string or array type.
* `numeric`: it will repeat that number of times,
* `range` then it will start and end according to the range.
* `string` then it will loop the `string` and value type will be `rune`.
* `array` then it will loop the `array` and value type will be the same the
array holds.

<!--
* if expression is a struct
 * It will be a syntax error if `as` is not used
 * It loop each property if as has only one literal, `$index` will have string type.
 * It loop each property and value is `as` has two literals (separated by commas).
-->

*Examples*

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
#### Implementation

`loop` it's in fact a `macro`.

The compiler shall replace the `loop` statement with a `macro` call.


```
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

// this macro
#macro loop(#value val, #text index_name = "$index", #text value_name = "$value") block {
#if (val is array) or (val is string)
  #loop_range(1, arr.length, #index_name#) {
    var #value_name# arr[#index_name#]
    #block#
  }
#else if val is number
  #loop_range(1, val, #index_name#) #block#
#else if val is range
  #loop_range(val.start, val.end, #index_name#) #block#
#else if val implements RangeIterator
  // TODO
#else
  #type_error "Invalid loop expression expected type: array, string, number or range"
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


Performance notes.

`foreach` key has no performance impact.

`foreach` key and value has, mostly with structs, because they will be copied to
in each iteration to the stack.

*Semantics*

`loop` will repeat given block of code for each value the given structure holds.

It will create a magic variable `$index` for the numeric index value, and
`$value` that will hold the value of given structure. Both magic
variable can have custom names if provided.

The structure is safe to be modified (change, add or remove are allowed).

*Constraints*

If the structure is holding a value that will be copied to the stack, that means
modification to $value won't be reflected in the original value. But if the type
it's a pointer, then $value will modify the original.

Notice: This have performance implications.

The controlling expression need to implement `IndexIterator`

*Examples*

The following example illustrate both behaviours with pointer and value.

```language
struct point {
  float x
  float y
}

// foreach by value

var list = new point[10]
list.cpush()(10, 10)

foreach k,v in list {
  v.x = 100
}

#assert list[0].x == 10 // 10, because v is copied

foreach k in list {
  list[k].x = 100
}

#assert list[0].x == 100 // 100, because we access directly the array memory

// foreach by pointer

var list2 = new ptr<point>[10]
list.push(new point(10, 10))
foreach k,v in list {
  v.x = 100
}

#assert list[0].x == 100 // 100, because we copy the pointer and modify the target memory
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

*Semantics*

The `continue` statement tells a loop to stop what it’s doing and start again at
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

<a name="break-implementation"></a>
#### Implementation

The compiler will search upwards a label with the
following pattern: `*_loop_end` and choose accordingly the given id.
Pick the first if id is not present

<a name="restart"></a>
### `restart` id

*Semantics*

The `restart` statement tells a loop to stop what it’s doing and start again at
the beginning.

`id` has the same meaning as explained in [`continue`](#continue).

<a name="restart-implementation"></a>
#### Implementation

The compiler will search upwards a label with the
following pattern: `*_loop_restart` and choose accordingly the given id.
Pick the first if id is not present


<a name="break"></a>
### `break` id

*Semantics*

The `break` statement tells a loop to stop what it’s doing and exit.
`break` also applies to `switch` so keep it in mind when using the id.

`id` has the same meaning as explained in [`continue`](#continue).

<a name="continue-implementation"></a>
#### Implementation

The compiler will search upwards a label with the
following pattern: `*_loop_continue` and choose accordingly the given id.
Pick the first if id is not present
