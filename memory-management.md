# Memory management

Language implements a Automatic memory management based on static anotation of
the memory. With just one premise: Memory must be owned by `one` in all moment,
that implies a few limitations but we can get rid of memory leaks.

## `new`: allocate memory
<!--
  https://cplusplus.com/reference/new/operator%20new/
  -->

Dynamically allocate memory.
`new` can be overloaded to support custom allocators by type or at "alloc" time.

Custom allocators must honor the same characterictics as default allocator:

* Memory must be contiguous.
* If target machine allowed, 32bit aligned.
* Allocating zero memory returns `nullptr`

`new` will [`lend`](#lend) memory to the local variable or to a
[memory-pool](#memory-pool).


or by a local variable.
If that variable is the result of the function (return) the return type of that
function will be mark a `lend`, because it will `lend` the memory.

Memory allocated inside a function that won't be lended, it will be deleted (freed).

```syntax
// single heap instance
// Allocate memory, returns a pointer to that memory. Memory will be own by a local variable if pool is not defined.
new [shared] type [ '(' function_arguments ')' [at identifier]]
// multiple heap instances
// Allocate memory, returns a pointer to that memory. Memory will be own by a local variable if pool is not defined.
new [shared] type '[' expression ']' '(' function_arguments ')' [at identifier]
```


### Implementation notes

* Allocate primitives without initializing will auto-initialize: numbers = `0`, `bool` = `false`, ptr-like = `nullptr`.
  ```language
  var x = new i8         // x = 0
  var y = new i8(10)     // y = 10
  var z = new vector<i8>[20](20) // z[0..20] = 32
  ```

* Allocate a struct without initializing is forbidden, because it's uninitilized memory.
  ```language
  struct point {
    float x
    float y
  }

  var p = new point() // default constructor, everthing will be zero
  var p2 = new point // p2 is holding uninitialized memory, that's an error
  ```

* You can allocate memory that is not initialized, like an array
  ```language
  var z1 = new i8[20]        // initilize the array, but not it's values
  var z2 = new array<i8>[20] // alias of the above
  var z3 = new i8[20](0)     // initilize the array and all values to zero
  ```

### Minimal code generation set

```language
new type(a, b, c)
```

```
function heap_allocator(size) uninitilized ptr {
  return malloc(size)
}

type.constructor(
  /* this = uninitialized i8* */ unsafe_cast<ptr<type>> heap_allocator(type.sizeof(a, b, c)),
  a, b, c
)
```

```language
new type[10](a, b, c)
```

```
// this will honor sizeof operator overloading
// use must create one per constructor or the compiler will use default sizeof
// that it's the the size of the members

var $arr = array.construct(
  /* this = uninitialized i8* */ heap_allocator(array.sizeof() + type.sizeof(a, b, c) * 10)
)
for (size int $i = 0; $i < 10; ++$i) {
  var ptr = $arr.value
  type.constructor(
    ptr,
    a, b, c
  )
  ++ptr
}
```

## `grow`: reallocate memory

Reallocate memory, only `shared pointers` can be reallocated, and only if they are unique.

`grow` will check those conditions at runtime, and it will throw an error if it's not possible to grow.

It checks if the shared_pointer is unique, grow can only be used on shared_pointers.

## `delete`: deallocate memory

Deallocate memory.

The first rule is you can't delete what you don't own.

`delete` memory from a pool is forbidden, you must `delete` the pool.

## `lend`: transfer memory ownage

* Transfer memory ownage to the caller
* `lend` is only available as anotation of a return type. So a function can only lend a single memory.
  If your function need to return more use a [`memory pool`](#memory-pool).

## uninitilized

When a memory is annotated as `uninitilized` the memory must be sent to a constructor before assigned to a variable of any type.


# Usage / Examples

```language

function new_and_delete() {
  // memory is owned by x so the memory will be deleted
  // at the end of the function block
  var x = new i8[25];
}

function new_and_lend() lend i8[25] {
  // memory is owned by x
  var x = new i8[25];

  return x; // and now the memory will be lend
}


function new_and_lend2(bool a) lend i8[25] {
  // memory is owned by x
  var x = new i8[25];
  if (a) {
    return x // and now the memory will be lend
  }

  // memory is owned by b
  var b = new i8[25];
  return b // and now the memory will be lend
  // this also means that x memory is not lend, so it will be deleted here
}

function borrow() {
  // autogenerate: defer delete x
  // Memory was lended to me, but i do not lend it to anyone,
  // so it will be deleted at the end of the function block
  var x = new_and_lend();
}

function borrow2() lend i8[25] {
  var x = new_and_lend(); // do not autogenerate, because memory is lended
  return x;
}

struct slist {
  own list ptr<i8[25]>

  destructor() {
    delete list
  }
}

function borrow3() lend i8[25] {
  var s = slist() // autogenerate: defer delete s
  s.list = new_and_lend(); // do not autogenerate, because menory is lend
  return x;
}


// compile error: you can't lend and own at the same time.
function borrow_error() lend i8[25] {
  var s = slist() // autogenerate: defer delete s
  s.list = new_and_lend(); // do not autogenerate, because menory is lend
  return x;
}



```
<a name="memory-pool"></a>
# Memory pool(s)

Memory pool allocated memory in batches, can have different implementations
to optimize memory usage. This is the only source a "temporary leak" in the
language.

It's temporary because you are the one that need to delete the pool when noone
will use it. This memory is for optimization purposes, if your program is not
memory intensive you may not need to rely on this memory model and keep your
code "temporary leak" free.

```language

global memory_pool beach

func use_pool() {
  // memory is owned by a pool of memory
  // wont be deleted at the end of the function block
  var x = new i8[10] at beach
}

func main() {

  loop 10 {
    use_pool()
  }

  // pool can be released anytime
  delete beach

  loop 10 {
    use_pool()
  }

  // compile will add this line at the end of main
}
```


## utils

### memory_copy

It will loop the memory and copy it's content into another location.

It's types and the first argument must be greater than the second.

memory copy will ignore memory layout but the second argument must have enough
memory to store the last.

```language
var a = new i8[10]
var b = new i8[20]

memory_copy(a, b) // ok
memory_copy(b, a) // ko: not enough memory at runtime!
a = grow[20]
memory_copy(b, a) // ok: now we have enough

```

# Implementation notes

* All memory allocation will be hoisted, the first assignamente will be nullptr.

* Before each return we will add for each allocated memory not lend in that particular `return`

  if (var != nullptr) delete var


# Study

https://www.boost.org/doc/libs/1_78_0/libs/smart_ptr/doc/html/smart_ptr.html#intrusive_ptr
