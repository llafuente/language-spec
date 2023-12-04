# pointers

<!-- https://web1.eng.famu.fsu.edu/~haik/met.dir/hcpp.dir/notes.dir/cppnotes/node68.html -->

## ptr<$type>

*Semantics*

Holds a reference to a single object in memory.

*Constrains*

1. A `ptr` shall not move. No operator+, operator-, operator++, operator--, operator[]

2. Dot operator auto-dereference the pointer.

## vector<$type>

*Semantics*

Holds a reference to a contiguous list of objects in memory.

This is the pure C-like pointer.

Unsafe because there is no length/capacity stored.

*Constrains*

1. Full compatible c pointer.

2. Dot operator auto-dereference the pointer.

*Remarks*

A `vector` is not an `array`.

## variant<$type>

A variant is an especial pointer that holds a reference to a value and it's type.

```language
type variant = struct {
  typeid v_type
  ptr pointer

  function to<$t>() $t {
    if ($t == v_type) return cast<$t>(pointer)
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
struct ref<$t> {
  ptr<$t> pointer;

  function new(ptr<$t> p) {
    pointer = p;
  }

  default function new() lend uninitialized $t {
    return unsafe_cast<$t>(libc.malloc($t.size));
  }

  destructor() {
    libc.free(pointer);
  }

  operator . () $type {
    return __ptr_deref(pointer);
  }

  operator = (ref<$type> p) {
    if (p == nullptr) {
      throws
    }
    pointer = p;
  }
}
```

*Examples*

```language
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


```language
type point = struct {
  float x
  float y
}
type ref_point = ref<point>

var ref_point pp = new(0,0)

#assert ref_point.size == ptr.size

```

## mref<$type>

*Semantics*

Holds a multiple reference to another memory.

It contains a pointer to memory and a use counter.

*Constrains*

1. Assignment of a `mref` increment use count and return the same pointer.

2. If that counter reach zero, the `mref` will be released.



# pointers arithmetic

## Incrementing a pointer

Valid operators: `++ += +`

```
var x = vector<i8>;
++x; // single increment
x+=8; // increment bytes
```
## Decrementing a pointer

Valid operators: `-- -= -`

## Comparing a pointer

Valid operators: `>, >=, <, <=, ==, !=`
