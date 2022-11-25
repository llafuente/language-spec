# Control statements


## If statements

```
if (x) {

} else if (y) {

} else {

}
```
## Switch Statement

```
switch(value) {
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

function operator switch() {

}

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

Loop will repeat the block as many times as the value sent or length of the
value sent. It will create a magic variable `$index` by default.


> loop <expression> [as <literal>[,<literal>] block

* if expression is a number, it will repeat that number of times.
* if expression is a string, it will repeat string length of times.
* if expression is a array, it will repeat string length of times.
* if expression is a object
 * It will throw an error if `as` is not used
 * It loop each property if as has only one literal, $index will have string type.
 * It loop each property and value is `as` has two literals (separated by commas).
* if expression is a range, it will start and end according to the range.

```
loop <number> {}
// var index $index = 0; $index < <number>; ++$index

loop <array> {}
// var index $index = 0; $index < <array>.length; ++$index

loop [a..b] {}
// var index $index = a; $index < b; ++$index
```

### Minimal set generation

loop
```
<uid>_loop_restart: var index $index = ?

<uid>_loop_start: if $index < ? {

  @block

  <uid>_loop_continue: $index = $index + 1
  goto <uid>_loop_start:
}
<uid>_loop_end:
```

break
```
goto <uid>_loop_end
```

restart
```
goto <uid>_loop_restart
```

continue
```
goto <uid>_loop_continue
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

## foreach

foreach will generate

```
foreach k,v in <object|array|string> {}
```


loop <object> as key {}
// var index $index = 0; $index < type(<object>).properties.length; ++$index
// var string key = type(<object>).properties[$index]

loop <object> as key, value {}
// var index $index = 0; $index < type(<object>).properties.length; ++$index
// var string key = type(<object>).properties[$index]
// var value = $type_get_property(<object>, key)

