<!--
  https://www.boost.org/doc/libs/1_78_0/libs/smart_ptr/doc/html/smart_ptr.html#intrusive_ptr
-->

# Memory management

Language implements an Automatic memory management based on static annotation of
the memory. With just one premise: Memory must be owned by `one` in all moment,
that implies a few limitations to avoid the usage of garbage collector.

<a name="new"></a>
## `new`
<!--
  https://cplusplus.com/reference/new/operator%20new/
-->

*Syntax*

```syntax
allocator
  : 'at' identifier
  ;

typeNewExpression
  : 'new' typeDefinition? ('(' argumentExprList? ')')+ (allocator)?
  ;

arrayNewExpression
  : 'new' typeDefinition? ('[' rhsExpr ']')+ ('(' argumentExprList? ')')? (allocator)?
  ;

unaryNewExpression: typeNewExpression | arrayNewExpression;
```

*Semantics*

Dynamically allocate and initialize memory in the heap.

`new` will [`lend`](#lend) memory to the caller that will own the memory,
so the memory will have the same life-cycle as the variable/field.

It also allocates memory from a custom [memory-pool](#memory-pool).


*Constraints*

1. Allocated memory shall be contiguous and 32bit aligned (If target architecture)

2. Allocating zero memory shall raise runtime error.

3. The `new` expression has type

  * `lend ref<type>` for type `typeNewExpression`
  * `lend static_array<type>` for `arrayNewExpression` with length
  * `lend array<type>` for `arrayNewExpression` without length

```test
type point = struct {
  float x
  float y
}

function main() {
  var sarr = new point[10]
  var arr = new point[](10)

  #assert sarr.length == 10
  #assert sarr.capacity == 10
  #assert arr.length == 0
  #assert arr.capacity == 10

  arr.grow(20)
  #assert arr.capacity == 20

  arr.push_back()(10, 11)
  #assert arr.length == 1
  #assert arr[0].x == 10
  #assert arr[0].y == 11
}
```

4. If a constructor return uninitialized memory user shall call given
constructor again, until all memory is initialized.

  ```test
type b = struct {
  int value
  new (int v) {
    this.value = v
  }
}
type a = struct {
  ref<b> b
  new () uninitilized ref<b> {
    this.b = new b
    return b
  }
}

function main() {
  var var_b = new b(11)
  var var_a = new a()(10)

  #assert var_b.value == 11
  #assert var_a.b != null
  #assert var_a.b.value == 10
}
  ```

  ```language
function main() {
  var a = new i8()
}
  ```

  ```compiled
function main() {
  var ref<i8> a = global_alocator.calloca(i8.sizeof)
  a = 0 // <-- constructor call, optional as the memory is zero-allocated
}
  ```

5. If during constructor an exception is thrown the variable shall be deleted.


*Implementation details*

Because point constructor can throw, the compiler shall generate the
`catch` code, this will ensure that `p` will be out of scope and will be deleted.

```language
type point = struct {
  float x
  float y
  new () {
    throw "exception"
  }
}
function main() {
  var p = new point()
}
```

```compiled
//...

function main() {
  var ref<point> p = libc.calloc(point.sizeof)
  // TODO how we check if calloc fail here ? -> exception
  point_new(p)
  if (λ_exception_value != null) {
    // function-exit, free all own memory
    point_delete(p)
    return self.return_type.default
  }

  // function-exit, free all own memory
  point_delete(p)
  return self.return_type.default
}
```

### User defined / Customs allocators

*Semantics*

Custom allocators allow you to control how memory is allocated and deallocated.

Unlike built-in allocator, custom allocators may not deallocate memory in time.

*Constraints*

* A custom allocator shall implement `type allocator`.

<!--
## `grow`: reallocate memory

*Semantics*

Allocate memory and copy its contents.

*Constrains*

1. Only `shared pointers` can grow.

`grow` will check those conditions at runtime, and it will throw an error if it's not possible to grow.

It checks if the shared_pointer is unique, grow can only be used on shared_pointers.
-->

## `delete`: deallocate memory

*Semantics*

Deallocate memory.

You can deallocate only those variables that owns memory.

*Syntax*

```syntax
unaryDeleteExpression
  : 'delete' postfix_expr
  ;
```

## Memory annotation

### `lend`

*Semantics*

Transfer memory ownage to.

`lend` is only available as type modifier of function parameter and return type.

See [function.lend](./language/functions.md#lend)

*Constraints*

1. Only function parameters and return type shall have `lend` modifier.

### `uninitilized`

*Semantics*

The memory is not initialized (just zeroed). The memory shall be sent to a
constructor before assigned to a variable of any type.

*Constraints*

1. `uninitilized` memory cannot be assigned. The user shall call the constructor in place

  > uninitilized memory shall not be assigned.

```language-error
function allocate_raw() lend uninitilized ref<i8>{
  return libc.malloc<i8>(10)
}
function main() {
  var ri8_a = allocate_raw() // error
  var ri8_b = allocate_raw()(101) // ok
}
```

2. If a cycle is detected the compiler shall raise a semantic-error

  > Cycle found at the following type constructors.

  > '?type' at '?file:?line:?colum'


### `own`

*Semantics*

`own` holds memory while variable is alive. If the variable get out of scope it
will be freed.

See [function.own](./language/functions.md#own)

See [structured.own](./language/types/structured.md#own)

*Constraints*

1. No variable can be declared with `own` modifier.

2. A `struct` field can own memory.

3. When a variable will be initialized with `lend` modifier, the compiler
shall mark it with a flag, that will free the memory we it's out of scope or
do not lend the memory in the `return` statement.

4. Variable assignament while holding memory, it will free the memory before assignament,
then proceed as point 3.

5. If a structure returned by copy own memory it shall be assigned at call site.

  > '?struct' holds memory but it's not assigned at call '?file:?line:?column'

*Example*

```language
function new_and_delete() {
  // memory is owned by x so the memory will be deleted
  // at the end of the function block
  var x = new i8[25]
}

function new_and_lend() lend i8[25] {
  // memory is owned by x
  var x = new i8[25]
  // memory will be lend so do not delete here
  return x;
}


function new_and_lend2(bool a) lend i8[25] {
  // memory is owned by x
  var x = new i8[25]
  if (a) {
    // memory will be lend so do not delete here
    return x
  }

  // memory is owned by y
  var y = new i8[25]
  // memory will be lend so do not delete here
  // don't forget, a, it wil be deleted here!
  return b // and now the memory will be lend
}

function borrow() {
  // new_and_lend lend memory to x, that own it
  var x = new_and_lend()

  // x will be deleted at is out of scope here and it do not lend
}

function borrow2() lend i8[25] {
  // new_and_lend lend memory to x, that own it
  var x = new_and_lend()

  // memory will be lend so do not delete here
  return x;
}

type slist = struct {
  own ptr<i8[25]>? list = null
}

function borrow3() slist {
  var slist s() // create slist calling default constructor.
  s.list = new_and_lend(); // transfer memory ownage
  // s destructor is not called because it will be copied
  return s
}

function borrow3_usage() {
  // compiler shall complaint as slist need to be handled.
  borrow3()
  var s = borrow3()
  // s destructor will be called -> list will be freed.
}

function borrow4() slist {
  var slist s() // create slist calling default constructor.
  s.list = new_and_lend(); // transfer memory ownage
  s.list = new_and_lend(); // delete and transfer memory ownage
  s.list = new_and_lend(); // delete and transfer memory ownage
  // s destructor will be called
}



// compile error: you can't lend and own at the same time.
function borrow_error() lend i8[25] {
  var s = slist() // autogenerate: defer delete s
  s.list = new_and_lend(); // do not autogenerate, because menory is lend
  return x;
}
```

## utils

### memory_set<$t>(vector<$t> dest, $t value, size count)

Copies value into each of the first count positions of the object pointed to by dest.

### memory_default<$t>(vector<$t> dest, size count)

It will default each object in the first count positions of the object pointed to by dest.

```language
type point = struct {
  float x = 10.5
  float y = 15.5
}

function main() {
  var p = new point()
  #assert p.x ~= point.x.default
  #assert p.y ~= point.y.default

  p.x = point.x.default + 1
  memory_default(a, 1) // TODO maybe we need to cast ? -> unsafe
  #assert p.x ~= point.x.default
  #assert p.y ~= point.y.default
}
```

<!-- https://clc-wiki.net/wiki/memmove -->
### memory_copy<$t>(vector<$t> dest, vector<$t> src, size count)

Copies count objects from src into dest.

* If memory overlap it will copy backwards
* If memory can be copied in bigger chunks (2/4/8 bytes) it will do it
* It won't check if dest has enough memory (vector is unbound)
* It won't check if src has enough memory (vector is unbound)


### memcmp<$t>(vector<$t> s1, vector<$t> s2, size_t n) int
<!-- https://clc-wiki.net/wiki/memcmp -->

Compares the memory byte by byte and returns an integer:

* greater than zero, if s1 is greater than s2
* zero, if s1 is equal to s2
* less than zero, if s1 is less than s2


```language
// initialize here some values
function main() {
  var a = libc.calloc(10)
  var b = libc.calloc(10)

  a.random()
  memory_copy(a, b, 10)
  #assert memory_cmp(a, b, 10) == 0

  a[9] = 0
  b[9] = 1
  #assert memory_cmp(a, b, 10) == -1

  a[9] = 1
  b[9] = 0
  #assert memory_cmp(a, b, 10) == 1

  a = memory_clear(a, 10)
  b = memory_clear(a, 10)
  #assert memory_cmp(a, b, 10) == 0
}
```





