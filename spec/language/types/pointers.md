# pointers

<!-- https://web1.eng.famu.fsu.edu/~haik/met.dir/hcpp.dir/notes.dir/cppnotes/node68.html -->

## ref<$type>

*Semantics*

Holds a reference to a single object in memory.

<!-- Operator. will dereference the pointer and expand type properties. -->

*Constrains*

1. A `ref` shall not move. No operator+, operator-, operator++, operator--, operator[]

2. Dot operator auto-dereference the pointer.


## vector<$type>

*Semantics*

Holds a reference to a contiguous (unbound) list of objects in memory.

This is the pure C-like pointer.

Unsafe because there is no length/capacity stored.

*Constrains*

1. Full compatible c pointer.

2. Dot operator auto-dereference the pointer.

3. operator[] returns a ref

*Remarks*

A `vector` is not an `array`.

## variant<$type>

A variant is an especial pointer that holds a reference to a value and it's type.

```language
type variant<$t> = struct {
  typeid v_type
  ref<$t> pointer

  new($t t) {
    this.v_type = typeid(v_type)
    this.pointer = t
  }

  function to<$t>() $t {
    if ($t == v_type) {
      return cast<$t>(pointer)
    }
    throw "impossible cast at variant"
  }
}
```

## optional<$type>

Holds a reference to an object that can be `nullptr`.

### Methods

#### `nullify()` bool

Set pointer to `nullptr`.

#### `isNull()` bool

Returns if the pointer is null.

#### `operator .`

Dereference the object, and if it's null throws

#### `operator .?`

Try to dereference the object and do nothing in case of `nullptr`.

#### `operator = ref<$type>`

Assign rhs.

## ref<$type>

*Semantics*

Holds a reference to a single memory type.

*Constrains*

1. `ref` shall not move.

2. When a ref is out of scope it will delete the memory if its the owner.


*Examples*

```
struct vector2 {
  float x
  float y
}
var ref<byte> pb // pointer to a single byte
var ref<int> pi // pointer to a single int
var ref<vector<i8>> pvector // pointer to a vector of i8s
```

### Methods

#### `operator.`

Dereference the object to access its fields.

If compiler property `ref.null_check` is enabled, before deref it must check is not null or throw
otherwise

#### `operator = ref<$type>`

Throws if the rhs is `nullptr`.


```language
type ref<$t> = struct {
  ptr<$t> pointer;

  new(ptr<$t> p) {
    pointer = p;
  }

  // TODO syntax
  //new() lend uninitialized $t {
  //  return unsafe_cast<$t>(libc.malloc($t.size));
  //}

  delete() {
    libc.free(pointer);
  }

  operator . () $t {
    return __ptr_deref(pointer);
  }

  operator = (ref<$t> p) {
    if (p == nullptr) {
      throws
    }
    pointer = p;
  }
}
```

*Examples*

```todo-language

var i32 value = 100
var ref<i32> pi32 = value

print(value) // 100
print(pi32) // 100
print(&pi32) // 0x????

var address api32 = pi32
print(api32) // 0x????

pi32 = api32 // failure <--
pi32 = unsafe_cast<>(api32) // ok-ish
```


```language-test
type point = struct {
  float x
  float y
}
type ref_point = ref<point>

test "pointer sizes" {
  var ref_point pp = new(0,0)
  #assert(ref_point.sizeof == ptr.sizeof)
}

```

## mref<$type> (shared_ref)

*Semantics*

Holds a multiple reference to another memory.

It contains a pointer to memory and a use counter to know how many copies there are in the program.

*Constrains*

1. Assignment of a `mref` increment use count and return the same pointer.

2. If that counter reach zero, the `mref` will be released.

```language-test
import fs

type filecache = struct {
  path filename
  mref<string> contents

  new(path filename) {
    this.filename = filename
  }
  function read() mref<string> {
    if (!contents) {
      contents = fs.file.read(filename)
    }
    return contents
  }
}

test "load keys" {
    var fcache = new filecache("file://text.txt")
    var instance1 = fcache.read()
    var instance2 = fcache.read()
    var instance3 = fcache.read()

    // !. will access self properties!
    #assert(instance1!.count == 3)
    #assert(instance2!.count == 3)
    #assert(instance3!.count == 3)
    #assert(instance1!.pointer == instance2!.pointer == instance3!.pointer)
}
```
# pointers arithmetic

## Incrementing a pointer

Valid operators: `++ += +`

```language-test

test "incrementing a pointer" {
  // creates a vector of 10 i8 elements.
  var b1 = new i8[10];
  #assert(address(b1) + 1 == address(b1 + 1))

  var b2 = cast<i16[5]>(b)
  var b2_p1 = b2
  var b2_inc = b2
  var b2_ret = b2
  #assert(address(b2) + 2 == address(b2 + 1))

  b2_p1 += 1
  #assert(address(b2_p1) == address(b2 + 1))

  b2_ret = b2_inc++
  #assert(address(b2_ret) == address(b2))
  #assert(address(b2_inc) == address(b2 + 1))
  
  b2_inc = b2
  b2_ret = ++b2_inc
  #assert(address(b2_ret) == address(b2 + 1))
  #assert(address(b2_inc) == address(b2 + 1))
}
```
## Decrementing a pointer

Valid operators: `-- -= -`

## Comparing a pointer

Valid operators: `>, >=, <, <=, ==, !=`
