# pointers

## raw_ptr<$type>

*Semantics*

C-like pointer / Raw pointers.

## vector<$type>

*Semantics*

Holds a reference to a list of object in memory.

*Constrains*

1. A `vector` can move.

*Note*

A vector is not an array, a vector just hold the list of objects in a contiguous memory but it's unsafe as it do not holds the capacity or length used.

## variant<$type>

Holds a reference to a pointer and it's type

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

Holds a reference to a single memory object.

*Constrains*

1. `ref` shall not move, as its a single memory object.

### Methods

#### `operator .`

Dereference the object, and if it's null throws

#### `operator = ref<$type>`

Throws if the rhs is `nullptr`.


```language
struct ref<$type> {
  ptr<$type> pointer;

  constructor(ptr<$type> p) {
    operator = (p);
  }

  destructor() {
    libc.free(pointer);
  }

  operator . () $type {
    return deref(pointer);
  }

  operator = (ref<$type> p) {
    if (p == nullptr) {
      throws
    }
    pointer = p;
  }
}
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
