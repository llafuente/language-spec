# types

<!--
  https://en.wikipedia.org/wiki/C_data_types
-->

The following data types are built-in

## Numeric / Arithmetic types

### Integers

| Signed integers | Unsigned integers |
| --------------- | ----------------- |
| i8              | u8                |
| i16             | u16               |
| i32             | u32               |
| i64             | u64               |

#### Properties
<!--
  https://learn.microsoft.com/en-us/dotnet/api/system.int32?view=net-7.0#fields
-->
All numeric types has common properties to found the limits of each
representation.

> <type>.MAX

> <type>.MIN

> <type>.bytes

> <type>.bits

Example:

```
  print(i8.MAX) // 128
  print(i8.MIN) // -127
  print(i8.bytes) // 1
  print(i8.bits) // 8
```


### Floating point

| Full name         | Shortname       |
| ----------------- | --------------- |
| half              | f16             |
| float             | f32             |
| double            | f64             |

#### Properties
<!--
  https://learn.microsoft.com/en-us/dotnet/api/system.double?view=net-7.0#fields
-->

Floating points has the same properties as integers with new aditions

> <type>.NaN

> <type>.INFINITY

> <type>.MINUS_INFINITY

Example:

```
print(float.NaN) // NaN
print(float.INFINITY) // Infinity
print(float.MINUS_INFINITY) // -Infinity
print(float.bytes) // 4
```

### Other numbers

The language has some advanced types to handle very specific arithmetic,
like memory math.

We do not allow implicit downcasts and/or some operations are not allowed.

> fastest_int, bool

Type that holds the fastest integer in the current target platform.

`bool` is an alias of `fastest_int`.

> size

Type that represent the maximum size of things.

Like array length, capacity.

<!--
  https://en.cppreference.com/w/cpp/types/size_t
-->

> ptrdiff

Type that can store the difference of two pointers.

Note that ptrdiff it's not templated, original types are lost as they are not
needed for math.

<!--
  https://en.cppreference.com/w/cpp/types/ptrdiff_t
-->

> address

It holds the value of the pointer address.

It needed because we auto-de-ref pointers

```
int a = 0;
ptr<int> b = &b;
print(b) // 0
print((address) b) // 0x????????
```

> void

void has two meanings.

First you don't care about the type, for example in templates you just want
to "talk" to the base struct.

Second you dont want to return anything in your functions.

We will expand the first case as it's complicated and could generate compiler
errors.

```
struct my_static_array<$t> {
  values $t[10] // this is the important part, this will be void
  size length // and void makes this invalid, because now the compiler cannot tell the offset
}

var array<i8> ar = new i8[10]
print(ar.length) // ok

var my_static_array<i8> msar = new i8[10]
print(msar.length) // ok

var array<void> void_ar = ar
print(ar.length) // ok
ar.push(void) // ko, void cannot be an argument, nothing is of type void
ar.pop() // ok, because it just operate with length
ar.grow(15) // ko, because you cannot new void type, as void does not have size
ar.swap(1, 2) // ko, because something of type void cannot be assigned

var my_static_array<void> = msar
print(msar.length) // KO, because it cannot determine offset



void_ar
void_sar

```

<!--

-->


#### under study

##### decimal<precision,precision>

Precise decimal number.

We plan to solve all those precision problem raising from float number like:

> 0.01 + 0.0221 = 0.032100000000000004

##### bigint

##### complex

### Memory

#### ptr

A pointer is a variable whose value is the address of another variable.

It's inmutable, so the target cannot assigned after the initial assignament.

Operators
```
operator >(ptr<$t>) bool {}
operator <(ptr<$t>) bool {}
operator =>(ptr<$t>) bool {}
operator <=(ptr<$t>) bool {}
operator == (ptr<$t>) bool {}
operator !=(ptr<$t>) bool {}

operator -(ptr<$t>, ptr<$t>) ptrdiff {}
operator +(ptr<$t>, ptr<$t>) ptrdiff {}

operator &(ptr<$t>) address {}

operator .(ptr<$t>) $t {} // access operator, only valid if $T has accesss operator
```

#### sptr

It's a shared pointer.

Pointers to shared pointer is forbidden.

#### rptr

it's a reference pointer.

It hold a reference inside a greater structure. That structure must be a shared pointer.

#### vector

A vector is a pointer to a memory range. It's unsafe by definition, and should
be used with caution, like in C/C++. It's mostly used to implement array.

If you want contiguous safe memory, use arrays.

Operators (same as ptr) plus:

```
operator =(ptr<$t>, address) ptr<$t> {} // move pointer
operator =(ptr<$t>, ptr<$t>) ptr<$t> {} // move pointer

operator + (vector<$t> v, size i) vector<$t> {}
operator - (vector<$t> v, size i) vector<$t> {}
operator [](vector<$t> v, size i) vector<$t> {}
```

#### Array

An array it a contiguous memory you can deref safely.

No overflow could happen.


```
interface SizeIterator<$t> {
  get size length;
  iterate(size index, ptr<bool> valid) ptr<$T> out
}

// a virtual struct is a type that is not itself
// when you alloc memory for a point,
struct array<$t> implements SizeIterator {
  size length
  alias len length

  size capacity
  alias cap capacity

  // Type type // STUDY: maybe ?

  vector<$t> self

  operator new (size cap) address {
    ptr<array<$t>> x = unsafe_cast<ptr<array<$t>>> libc_malloc(@sizeof(this) + @sizeof($t) * cap)

    x.type = @typeof($t)
    x.len = 0
    x.capacity = cap

    return &x
  }

  operator delete () {
    libc_free(this)
  }

  operator[](size i) $t {
    #if DEBUG
      if (i > capacity) {
        throw error("out of bounds")
      }
    #endif

    return self + sizeof(u32) +  sizeof(u32) + i * sizeof(T)
  }

  iterate(size index, ptr<bool> valid) ptr<$T> out {
    valid = length < index;
    if (valid) {
      return self[index]
    } else {
      return null
    }
  }
  // end of iterator implementation

  push($t value) {
    ptr[length++] = value

    return this
  }
  // ...
}

```

Usage example:

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

### Text

#### Rune

The Rune represent a single character (possible multibyte) in a given enconding.

```
enum string_encoding {
  BIN
  ASCII,
  UTF_8,
  UTF_16,
  UTF_32,
  BASE64,
}

struct rune {
  size capacity;
  string_encoding encoding;
  range<u8> value;
}
rune.capactity = 7 // max character for utf8 is 6, one more for \0
rune.encoding
rune.value
```

<!--
TODO Study
Little endian / Big endian
https://en.wikipedia.org/wiki/Comparison_of_Unicode_encodings
-->

#### String

Represent a list of characters.

```
struct string {
  size length // length in runes/characters
  size blength // bytes used
  size capacity
  encodings encoding
  ptr<u8> value
}
```

Operators
```
operator[](size position) rune {} // get
operator[](size position, rune) rune {} // assignament

operator+(string) {}
operator+(rune) {}
operator+(i8) {}
operator+(i16) {}
operator+(i32) {}
operator+(i64) {}
operator+(u8) {}
operator+(u16) {}
operator+(u32) {}
operator+(u64) {}
operator+(float) {}
operator+(double) {}
operator+(...) {}
```

## Enumerated

The enumerated type is a set of names (identifiers) that represent a value of
a type. The type could be explicity declared.

In a example above, `string_encoding` the type is `size`.

We can rewrite the example to use `string` as type:

```
enum string_encoding_str {
  BIN = "Binary",
  ASCII = "Ascii",
  UTF_8 = "UTF-8",
  UTF_16 = "UTF-16",
  UTF_32 = "UTF-32",
  BASE64 = "BASE64",
}

enum string_encoding_str2 {
  BIN = "Binary"
}

var s = string_encoding_str.BIN
string_encoding_str2 s2 = string_encoding_str2[0]

// this will result in a compiler error
// even when the final representation is the same the compiler won't allow it
if (s == s2) {

}
// but this will be allowed
// this is because both will be translated to "Binary" as string
if (string_encoding_str.BIN == string_encoding_str2.BIN) {

}
```

* NOTE: If no values is defined, it will start at 0 and type will be size.

* ERROR: If one value is defined, the rest must be defined.

* ERROR: Identifiers must be upercased.

  REASON: This avoid collision with type properties.

<!--
  https://en.wikipedia.org/wiki/Enumerated_type
-->
### Properties

enum.length - how many elements are defined

enum.values - Array with all the values

enum.identifiers - Array with all identifiers name

enum.type - Type representation

### Operator

```
operator [](size position) // It will return the value of the identifier at given position
```

## Structured

```
struct Vector2 {
  f32 x;
  f32 y;
}

struct Vector3 extends Vector2 {
  f32 z;
}

struct Quaternion extends Vector3 {
  rename x as x2; // STUDY

  f32 w;
}

struct Player {
  hoist Vector position;
}

p = Player()
p.position.x = 1;
p.y = 1;

```

* readonly properties need to be asigned at constructor level, and no more.

## Type aggregation

Type aggregation solve the use of a single array for multiple data layouts.

```
type Vectors = Vector2 | Vector3
array<Vectors> list(20);
```

## Type testing

```
interface IA {}
interface IB {}

// compile time
sort($t a, $t b) i32 {
  #if $t implements IA
  execute this and evaluate
  #else

  #endif
}

// runtime time
sort(type t, $t a, $t b) i32 {
  #if t implements IA
  execute this and evaluate
  #else

  #endif
}


```

## Type discrimination / tagged union (Safe unions)

```
enum EntityType {
  House = "House",
  Table = "Table",
}

struct Entity {
  readonly type: EntityType; // discriminators are readonly properties

  constructor(type) {
    this.type = type;
  }
}

//Entity.constructor(Entity* this, )

struct Chair : extends BaseEntity {
  readonly type: EntityType = EntityType.House; // that are defaulted on childrens
  color: string;
}

struct Table : extends BaseEntity {
  readonly type: EntityType = EntityType.Table; // that are defaulted on childrens
  legs: u8;
  color: string;
}

type Furniture = Chair | Table;

function createFurniture(type: string): Furniture {
  new Furniture(type)
}

function useFurniture(f: Furniture) {
  // f.legs - legs in not a property of Chair, guard the access
  if (f.type == "Chair") {
    // inside this block the compiler should now f is type Chair
    // f.legs - gives an error
  }
}


```

## Dictionaries

## Functions

## Templates

All templates starts with `$`


## Code generation

```
struct x {
  i8 a;
  i8 b;
}
```

```
# global variable ?
definition_type_x = {
  kind: STRUCT,
  name: "x",
  bits: sizeof(x),
  is_signed: false,
  bool pointer;
  uint8_t size;

  lang_type_t* children;
};

function print (x value) {
  print("{ a ")
  print(x.a)
  print(", ")
  print(x.b)
  print("}")
}

function typeof(x value) {
  return "x"
}

operator clone(x value): x {
  return x(x.a, x.b);
}

operator clone_deep(x value): x {
  return x(clone(value.a), clone(value.b));
}

operator ==(x a, x b): bool {
  return a.x == b.x && a.y == b.y;
}
operator !==(x a, x b): bool {
  return a.x == b.x && a.y == b.y;
}
```


## Arrays of structs (AOS) vs Struct of arrays (SOA)

Compile should be able to resolve both cases. Even: AOS with pointers.

```
struct Vector2 {
  f32 x;
  f32 y;
}

type aos_vector_list = array<Vector2>;
type soa_vector_list = soa_array<Vector2>;

function fill($t vectors) {
  for (i = 0; i < x.length; ++i) {
    res.x += random();
    res.y += random();
  }
}

function sumarize($t vectors): Vector2 {
  Vector2 res;
  for (i = 0; i < x.length; ++i) {
    res.x += vectors[i].x
    res.y += vectors[i].y
  }

  return res;
}

laos: aos_vector_list = new(20);
lsoa: soa_vector_list = new(20);

print(sumarize(laos))
print(sumarize(lsoa))


```


# Convenience types

## time

TODO

## date

TODO
