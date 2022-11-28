# Memory management

Language implements a Automatic memory management based on static anotation of
the memory. With just one premise: Memory must be owned by `one` in all moment.
And a few limitation we can get rid of memory leaks.

We will explain the operator and memory annotations.

## new
<!--
  https://cplusplus.com/reference/new/operator%20new/
  -->

Dynamically allocate memory on Heap.

* Memory is contiguous.
* If target machine allowed, 32bit aligned.

`new` will transfer memory ownage to the local variable or a
[memory-pool](#memory-pool).


or by a local variable.
If that variable is the result of the function (return) the return type of that
function will be mark a `lend`, because it will `lend` the memory.

Memory allocated inside a function that won't be lended, it will be deleted (freed).

syntax:

> new \[type] \[\[ expression]]

> new \[type] \[ \[\[ expression]] @ identifier]

> new shared type \[\[ expression]]

The first one will create a pointer to that memory. Memory will be own by a local variable
The second one will create a pointer to that memory. Memory will be own by a memory pool.
The third one will create a shared pointer to that memory. Memory will be own by all instances of the shared pointer at the same time.

## grow

Reallocate memory.

## delete

Deallocate memory.

The first rule is you can't delete what you don't own.

`delete` memory from a pool is forbidden, you must `delete` the pool.

## lend

* Transfer memory ownage to the caller
* Memory lended must be from a unique source. The same function can't return memory from heap and memory-pools at the same time.

## memory block

* Es el estado inicial de la memoria creada por new
* Si nadie toma el control de esa memoria, se borra al final del bloque

# Example

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
  // Memory was lended to me, but i do not lend it to anyone
  var x = new_and_lend();
}

function borrow2() lend i8[25] {
  var x = new_and_lend(); // do not autogenerate, because menory is lend
  return x;
}

struct slist {
  own list ptr<i8[25]>;
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
# Memory pools

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
  var x = new i8[10] @beach; // memory is owned by a pool of memory
}

func main() {

  pepe = new

  loop 10 {
    use_pool()
  }

  // pool can be released anytime
  delete pepe

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
