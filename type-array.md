# Array

*Semantics*

An array it a contiguous memory container of a single type,
each element has a fixed size.

No overflow could happen.

*Constraints*

The compiler shall complaint about reference an element






*Example*

```
i8[] x = new[10];
var i = new i8[10];

// properties
x.push(0)
i.push(1)
i.grow(15) ; // grow internal memory by 15
print(x.cap) // stdout: 10
print(y.cap) // stdout: 15
print(x.len) // stdout: 1
print(y.len) // stdout: 1
i[7] = 99
print(y.len) // stdout: 8
```

*Implementation*

```
template $array_t
template $array_ptrt $array_t is ptr

interface IndexIterator<$t> {
  get size length
  operator[](index position) $t
}

struct array<$t> implements LengthIterator {
  size length
  alias len length

  size capacity
  alias cap capacity

  // Type type // STUDY: maybe ?

  flexible_vector<$t> data
}

struct array<$array_ptrt> implements LengthIterator {
  size length
  alias len length

  size capacity
  alias cap capacity

  // Type type // STUDY: maybe ?

  own flexible_vector<$array_ptrt> data
}

function operator new (ptr<array<$t>> this, size capacity) address {
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
  #if ARRAY_CHECK_OOB
    if (i > capacity) {
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
var arr = i8[10]
#assert arr.length == 0
#assert arr.capacity == 10

arr.init_push()(5)

#assert arr[0] == 5
#assert arr.length == 1
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
function push(array<$t> this, $t value) {
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
