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

```
var i8[] x = new[10] // start with 10 capacity
var y = new i8[10] // start with 10 capacity

// properties
x.push(0)
y.push(1)
y.grow(15)   // grow internal memory by 15
print(x.cap) // stdout: 10
print(y.cap) // stdout: 15
print(x.len) // stdout: 1
print(y.len) // stdout: 1
y[7] = 99
print(y.len) // stdout: 8
print(y[0]) // stdout: 1
print(y[1:6]) // stdout: [0,0,0,0,0,0]
print(y[7]) // stdout: 99

#assert type(x) == type(y)
```

*Implementation*

```
template $t
template $array_ptrt $t is ptr

interface IndexIterator<$t> {
  get size length
  operator[](index position) $t
}

type array_void_callback = function($t element, size index) void
type array_bool_callback = function($t element, size index) bool
type array_i32_callback = function($t element, size index) i32

struct array<$t> implements IndexIterator {
  size length
  alias len length
  alias count length

  size capacity
  alias cap capacity

  get isEmpty {
    return length == 0
  }

  get isFull {
    return length == capacity
  }

  get first {
    if (isEmpty) throw "array is empty"
    return data[0]
  }

  get last {
    if (isEmpty) throw "array is empty"
    return data[length-1]
  }

  // Type type // STUDY: maybe ?

  flexible_vector<$t> data

  function randomElement() $t { /**/ }

  // Adds a new element at the end of the array, the element will be copied.
  // Returns current length
  function append($t element) size { /**/ }
  // Adds the elements of a sequence to the end of the array, the elements will be copied.
  // NOTE $t shall not own memory
  function append(array<$t> elements) $t { /**/ }
  // Adds a new element at the end of the array, and return the element to be initialized
  // Returns an uninitialized element
  function append_new() uninitialized ref<$t> { /**/ }

  alias append push

  // Inserts a new element at the specified position
  // Returns current length
  function insert($t element, size at) size { /**/ }
  // Inserts a new element at the specified position, if used it will destroy the object
  // Returns an uninitialized element
  function insert_new(size at) uninitialized ref<$t> { /**/ }

  //

  // Replaces all values in the array that match inValue with given element.
  // Returns number of modified values
  function replace($t inValue, $t element) size { /**/ }
  // Replaces a range of elements with the elements in the specified collection.
  // Returns number of modified values
  function replace(range<size,size> rng, $t element) size { /**/ }

  // Reserves enough space to store the specified number of elements.
  function reserveCapacity(size)
  alias grow reserveCapacity


  // operators

  // Creates a new collection by concatenating the elements of a sequence and a collection.
  function operator+(array<$t> other) lend array<$t> { /**/ }
  // Appends the elements of a sequence to a range-replaceable collection.
  function operator+=(array<$t> other) { /**/ }

#if $t implements comparable_eq
  // Returns a Boolean value indicating whether two arrays contain the same elements in the same order.
  function operator==(array<$t> other) bool { /**/ }
  // Returns a Boolean value indicating whether two arrays contain the same elements in the same order.
  function operator!=(array<$t> other) bool { /**/ }
#endif

  // Removes and returns the element at the specified position.
  function remove(at: Int)
  // Removes the elements in the specified subrange from the collection.
  // Returns current length
  function remove(range<int, int>) size {
    // if $t is primitive -> call destructor
  }
  // Removes all the elements that satisfy the given predicate.
  function removeAll(array_bool_callback where)

  function pop() lend $t
  alias popLast pop

#if $t implements comparable_eq
  // Returns a Boolean value indicating whether the sequence contains the given element.
  function contains($t element) bool { /**/ }
  function contains(range<int,int> rng, $t element) bool { /**/ }

  // Returns the first element of the sequence that match given element
  function first($t element) $t { /**/ }
  // Returns the first element in given range that match given element
  function first(range<int,int> rng, $t element) $t { /**/ }
  // Returns the first element of the sequence that satisfies the given predicate
  function first(array_bool_callback where) $t { /**/ }

  // Returns a the position indicating whether the elements of the sequence are the same as the elements in another sequence.
  function indexOf(array<$t> element) size { /**/ }
  function indexOf($t element) size { /**/ }
  function indexOf(range<int,int> rng, $t element) size { /**/ }
  alias index indexOf

  function lastIndexOf($t element) size { /**/ }
  function lastIndexOf(range<int,int> rng, $t element) size { /**/ }
  alias index indexOf
#endif

  // Returns the minimum element in the sequence, using the given predicate as the comparison between elements.
  function min(array_i32_callback where) $t { /**/ }
#if $t implements comparable_lt
  // Returns the minimum element in the sequence.
  function min() $t { /**/ }
#endif

  // Returns the maximum element in the sequence, using the given predicate as the comparison between elements.
  function max(array_i32_callback where) $t { /**/ }
#if $t implements comparable_lt
  // Returns the maximum element in the sequence.
  function max() $t { /**/ }
#endif


  // Returns a subsequence by skipping elements while predicate returns true and returning the remaining elements.
  function drop(array_bool_callback while) lend array<$t> { /**/ }
  alias skip drop

  // Returns an array containing the results of mapping the given closure over the sequence’s elements.
  function map(function($t, size) $x where) array<$x>
  // TODO
  function reduce() {}

  // Calls the given closure on each element in the sequence in the same order as a for-in loop.
  function forEach(array_void_callback where) { /**/ }

#if $t implements comparable_lt
  // Sorts the collection in place.
  function sort() { /**/ }
  // Returns the elements of the sequence, sorted.
  function sorted() lend array<t> { /**/ }
  // Reverses the elements of the collection in place.
#endif

  function reverse() { /**/ }
  // Returns the elements of the sequence, in reverse order.
  function reversed() lend array<t> { /**/ }

  // Shuffles the collection in place.
  function shuffle()
  // Returns the elements of the sequence, shuffled.
  function shuffled() lend array<t>

  // Exchanges the values at the specified indices of the collection.
  function swapAt(size a, size b) void { /**/ }

#if $t implements comparable_eq
  // Returns the longest possible subsequences of the collection, in order, around elements equal to the given element.
  function split($t element) array<array<$t>> { /**/ }
#endif

  function join(string x) string { /**/ }


  every(array_bool_callback callback) bool { /**/ }
  some(array_bool_callback callback) bool { /**/ }
}

struct array<$t is pointer> implements IndexIterator {
  size length
  alias len length

  size capacity
  alias cap capacity

  // Type type // STUDY: maybe ?

  own flexible_vector<$t> data
}

function operator new (ptr<array<$t>> this, size capacity) void {
  // this = unsafe_cast<ptr<array<$t>>> libc_malloc(@sizeof(array<$t>) + $t.sizeof * cap)
  this = unsafe_cast<ptr<array<$t>>> libc_calloc(@sizeof(array<$t>) + $t.sizeof * cap)

  // x.type = @typeof($t)
  this.len = 0
  this.cap = capacity
}

function operator delete (ptr<array<$t>> this) {
  libc_free(this)
}

function operator[](ptr<array<$t>> this, index i) $t {
  #if COMPILER.ARRAY_CHECK_OOB
    if (i >= this.length) {
      throw error("out of bounds")
    }
  #endif

  return this.data[i]
  // as ptr -> this.data + i * $t.sizeof
}
```

## methods

## init_push() uninitialized $t

Push a value at the end to be initialized

*Example*

```language
function main() {
  var arr = new i8[10]
  #assert arr.length == 0
  #assert arr.capacity == 10

  // arr.init_push() = 5
  arr.init_push()(5)

  #assert arr[0] == 5
  #assert arr.length == 1
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
  #assert this.length > 0, "could not pop an empty array"

  --this.length

  memory_set(&this.data[this.length], $t.sizeof, 0)

  return this
}
```

## pop

```language
function pop(array<$t> this) {
  #assert this.length > 0, "could not pop an empty array"

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
