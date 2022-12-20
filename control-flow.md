# Control flow
<!--
  https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html
-->

## Selection statements

A selection statement selects among a set of statements depending on the value of a controlling expression.

*Constraints*

The controlling expression shall have bool type, there won't be implicit conversions.

### `if` / `else`

It executes a set of statements only if the condition is true.

```syntax
single-if-statement =
  if expression block
elseif-statement
  else single-if-statement
  elseif-statement
else-statement
  else block

if-statement =
  single-if-statement [elseif-statement] [else-statement]
```

```language
if x {

} else if y {

} else {

}
```

### `switch`

switch expression will be evaluated once, and value cached and used in each
required case.


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
function operator switch($t input, $t2 check) bool {
  return true
}

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

Goto its allowed only inside the same function

Examples:

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
// compiler error: goto's target label must be inside the same function
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

## Loop Statements

We have a few loop statements: `loop`, `for`, `foreach`, `while` and `do-while`.

`restart` will affect all.

`continue` will affect all.

`break` will affect all and `switch`

<a name="loop"></a>
### `loop`

Loop will repeat the block as many times as the value sent or the length of the
value sent. It will create a magic variable `$index` by default to keep syntax
short and clean.

*Constraints*

`loop` will cache input expressions, it won't reevaluate in each loop, that
makes `loop` unsafe to input modifications. If an array is sent,
do not modify its length, use `foreach` instead that use a safe
(slower) iterator.

There is no way to increment a number different than one,
use [`for`](#for) instead.

*Syntax*
```syntax
loop-statement =
  loop expression [as literal[, literal] block
```

* if expression is a `number`: it will repeat that number of times, from 1 to `number`.
* if expression is a `string`: it will loop the string and value will be a `rune`.
* if expression is a `array`: it will loop array and value will be the value of the array.
* if expression is a `range`: it will start and end according to the range.
<!--
* if expression is a struct
 * It will be a syntax error if `as` is not used
 * It loop each property if as has only one literal, `$index` will have string type.
 * It loop each property and value is `as` has two literals (separated by commas).
-->


For example, the following example will print 1 to 10 and continue,
it won't fall into infinite loops, as `loop` is safe of this common pitfall.
```language
var i = 10
loop 1..i {
  ++i
  print($index)
}
```


#### Implementation

loop it's in fact a macro, the compiler should replace the statement for a macro call.

The compiler will transform the loop into a macro call.

```
#macro loop_range(#value start, #value end, #text index_name = "$index") block {
  #uid LR_UID

#LR_UID#_loop_restart:
  var index #LR_UID#_$index = start
  var index #LR_UID#_$max = end

#LR_UID#_loop_start:
  if #LR_UID#_$index < #LR_UID#_$max {
    const #index_name# #LR_UID#_$index

    #block#

#LR_UID#_loop_continue:
    $index = $index + 1

    goto #LR_UID#_loop_start:
  }

#LR_UID#_loop_end: {}
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

*break*
To implement break the compiler will search upwards a label with the following pattern:
`*_loop_end` and choose accordingly the id

*restart*
To implement break the compiler will search upwards a label with the following pattern:
`*_loop_restart` and choose accordingly the id

*continue*
To implement break the compiler will search upwards a label with the following pattern:
`*_loop_continue` and choose accordingly the id

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

`foreach` will loop a structure.
The structure is safe to modify, adding or removing values.
Value will be copied to the stack so in case not using a pointer the real
value won't be modified. See examples below.

```syntax
foreach-statement =
  foreach [key[, value]] in expression block
```

Performance notes.

`foreach` key has no performance impact.

`foreach` key and value has, mostly with structs, because they will be copied to
in each iteration to the stack.

```language
struct point {
  float x
  float y
}

var list = new point[10]
list.cpush()(10, 10)

foreach k,v in list {
  v.x = 100
}
print(list[0].x) // 10, because v is copied
foreach k in list {
  list[k].x = 100
}
print(list[0].x) // 100, because we access directly the array memory

var list2 = new ptr<point>[10]
list.push(new point(10, 10))
foreach k,v in list {
  v.x = 100
}
print(list[0].x) // 100, because we copy the pointer and modify the target memory
```

Expression must be:
* array: It will iterate the array length and get it value.
* string: It will iterate the array length and get each rune.
* any struct that implements IndexIterator.


<a name="for"></a>
### for
<a name="while"></a>
### while
<a name="do-while"></a>
### do-while

<a name="continue"></a>
### `continue` id

The `continue` statement tells a loop to stop what it’s doing and start again at
the beginning of the next iteration through the loop.

`id` represent the closest iteration to `continue`, by default 1, the closest one.
A label can be used instead to clarify.

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

<a name="restart"></a>
### `restart` id

The `restart` statement tells a loop to stop what it’s doing and start again at
the beginning.

`id` has the same meaning as explained in [`continue`](#continue).

<a name="break"></a>
### `break` id

The `break` statement tells a loop to stop what it’s doing and exit.
`break` also applies to `switch` so keep it in mind when using the id.

`id` has the same meaning as explained in [`continue`](#continue).
