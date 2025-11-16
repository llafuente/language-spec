# Array
<!--
  https://developer.apple.com/documentation/swift/array#2846730
-->

# static_array | sarray

*Semantics*

Static vector of a defined number possible values


```
interface comparable<$t> {
  operator==($t a, $t b) boolean
}

struct static_array<$t> {
  capacity
}
```

# dynamic array

*syntax*

```syntax
arrayItem
  : rhsExpr
  ;

arrayItemList
  : arrayItem (',' arrayItemList)?
  ;

arrayInitializer
  : '[' arrayItemList? ','? ']'
  ;

// TODO
arrayConstantInitializer
  : '[' arrayItemList ','? ']'
  ;
```

*Semantics*

An array it a contiguous memory container of a single type,
each element has a fixed size.


*Constraints*

The compiler shall complaint about reference an element

No overflow shall happen.

`string[]` means an array with strings

`[string]` means an array with a single string


*Example*

```language-test
test "" {
  var i8[] x = new[10] // start with 10 capacity
  var y = new i8[10] // start with 10 capacity

  // x = [0, 1] of capacity 10
  x.push(0)
  x.push(1)
  #assert(x.len == 2)
  #assert(x[0] == 0)
  #assert(x[0] == 1)
  #assert(x.cap == 10)
  
  // x = [0, 1] of capacity 10
  x.grow(15)   // grow internal memory by 15
  #assert(x.cap == 15)

  /// unlike push, if you set beyond length it will initialize to default value the previous
  y[7] = 99
  #assert(y.len == 8)
  #assert(y == [0,0,0,0,0,0,0,99])

  #assert(type(x) == type(y))

  // reference copy - point to the valuess, same memory
  x = y
  #assert(x.cap == 10)
  #assert(y.cap == 10)
  
  y.grow(15)
  #assert(x.cap == 15)
  #assert(y.cap == 15)

  #assert(x == y)
  // clone copy - point to the same values, different memory
  x = y.clone()
  #assert(x.cap == 15)
  #assert(y.cap == 15)

  y.grow(10)
  #assert(x.cap == 10)
  #assert(y.cap == 10)
  #assert(x == y)
}
```

## methods

## init_push() uninitialized $t

Push a value at the end to be initialized

*Example*

```language
function main() {
  var arr = new i8[10]
  #assert(arr.length == 0)
  #assert(arr.capacity == 10)

  // arr.init_push() = 5
  arr.init_push()(5)

  #assert(arr[0] == 5)
  #assert(arr.length == 1)
}
```

*Implementation*

```language
function init_push(array<$t> this) uninitialized $t {
  if this.length == this.capacity {
    throw "array out of capacity"
  }

  return this.data[this.length++]
}
```

## push($t value) index

*Implementation*

```language
function push(array<$t> this, $t value) size {
  if this.length == this.capacity {
    throw "array out of capacity"
  }

  this.data[this.length++] = value

  return this.length
}
```

## clear_pop

```language
function clear_pop(array<$t> this) {
  #assert(this.length > 0, "could not pop an empty array")

  --this.length

  memory_set(&this.data[this.length], $t.sizeof, 0)

  return this
}
```

## pop

```language
function pop(array<$t> this) {

  #assert(this.length > 0, "could not pop an empty array")

  --this.length

  return this
}
```

## fill($t value , index start = index.MIN, index end = index.MIN)


The start argument is optional. If it is not provided, +0𝔽 is used.

The end argument is optional. If it is not provided, the length of the this value is used.

NOTE 2
If start is negative, it is treated as length + start where length is the length of the array. If end is negative, it is treated as length + end.

```language
function fill(array<$t> this, $t value, index start = index.MIN, index end = index.MIN) {
  if (start == index.MIN and end == index.MIN) {
    start = 0
    end = this.capacity
  }

  if (start < 0) {
    start = this.length + start
  }
  if (end < 0) {
    end = this.length + end
  } else if (end == index.MIN) {
    end = this.length
  }
  var k = start

  while k < final {
    this.data[k] = value
    ++k
  }

  this.length = max(this.length, end)

  return this
}
```


# unique_array | uarray

*Semantics*

Array of unique values.


```
interface comparable<$t> {
  operator==($t a, $t b) boolean
}

struct unique_array<$t implements comparable<$t>> extends array<$t> {
  // TODO implement all methods that push data into the array
}
```
