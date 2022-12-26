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

> MAX

> MIN

> bytes

> bits

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

#### Properties / fields
<!--
  https://learn.microsoft.com/en-us/dotnet/api/system.double?view=net-7.0#fields
-->

Floating points has the same properties as integers with new aditions

> NaN

> INFINITY

> MINUS_INFINITY

> EPSILON
> Represents the smallest positive floating point value that is greater than zero. This field is constant.

> EQUAL_ENOUGH

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

#### `int`, `bool`

Type that holds the fastest integer in the target platform.

> size

Type that represent the maximum size of things.

Like array length, capacity.

<!--
  https://en.cppreference.com/w/cpp/types/size_t
-->

> ptrdiff

Type that can store the difference of two pointers.

Note that ptrdiff it's not templated, the original types are lost as they are not
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

void has two meanings:

First, you don't care about the type, for example in templates you just want
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

## Memory

### ptr

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
operator cast(ptr<$t>a) address { return &a; }

// this is under-review how to do it inside the language
// maybe there is a expressive way, otherwise will be in the compiler
operator .(ptr<$t>) $t {}
```

### vector

A vector is a pointer to an unbound memory range. It's unsafe by definition, and should
be used with caution, like in C/C++. It's mostly used to implement low level
staff and optimization.

If you want contiguous safe memory, use arrays.

Operators (same as ptr) plus:

```
operator =(vector<$t>, address) vector<$t> {} // move pointer
operator =(vector<$t>, ptr<$t>) vector<$t> {} // move pointer
operator =(vector<$t>, vector<$t>) vector<$t> {} // move pointer

operator + (vector<$t> v, size i) vector<$t> {} // move right
operator - (vector<$t> v, size i) vector<$t> {} // move left
operator [](vector<$t> v, size i) vector<$t> {} // get position
```

### flexible_vector

<!--
  https://en.wikipedia.org/wiki/Flexible_array_member
-->
Is a unbound vector at the end of a struct. That's the only place it can be
used. Nobody can declare a flexible_vector variable, use vector instead as
it will be implicit casted.

flexible_vector suffers the same problems vector has and
should be used with love.

It heavy used in core library for hardcore optimizations.


### sptr / shared_ptr

It's a shared pointer. shared pointers compose other type by prepending a
counter. If that counter reach zero, the shared_ptr will be released.

Pointers/vectors to any memoty owned by a shared pointer is forbidden.
To reference memory inside a shared_pointer use: `ref_ptr`.

### rptr / ref_ptr

It's a reference pointer.

It hold a reference inside a greater structure. That structure must be a
shared pointer and it's the owner real memory owner.

`ref_pointer` increment/decrement `shared_ptr` counter.

## Enumerated

The enumerated type is a set of names (identifiers) that represent a value of
a type. The type could be explicity declared.

In a example above, `string_encoding` the type is `size`.

We can rewrite the example to use `string` as type:

```
enum string_encoding_str {
  BIN = "Binary"
  ASCII = "Ascii"
  UTF_8 = "UTF-8"
  UTF_16 = "UTF-16"
  UTF_32 = "UTF-32"
  BASE64 = "BASE64"
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

*Semantics*

A struct is an aggregate type with contigous memory type which members can have distinct types.

*Constraints*

A struct can contain padding between members. Apply the same rules as
`c language` to keep compatibility.

<!--
  Thus, for example, structure assignment may be implemented element-at-a-time or via memcpy.
-->


```syntax
struct_properties_flags = (hoist | readonly ) struct_properties_flags
struct_properties_list = (struct_properties_flagsₒₚₜ type identifier | alias identifier identifier) ENDL struct_properties_list
struct_alignament = [align number]

```
<!--
struct identifier struct_alignamentₒₚₜ '{' struct_properties_list '}'

struct-or-union-specifier:
    struct identifier struct_alignamentₒₚₜ { struct-declaration-list }
-->
Examples:
```language
struct Vector2 {
  f32 x
  f32 y
}

struct Vector3 extends Vector2 {
  f32 z;
}

struct Quaternion extends Vector3 {
  f32 w;
}
```

### `hoist`

`hoist` makes structs properties access faster by making given name optional.

Examples:
```
struct Player {
  hoist Vector position;
}

p = Player()
p.y = 1 // hoisted property
p.position.x = 1 // still valid
```
### readonly

`readonly` properties need to be asigned at constructor level, and no more.

*NOTE*: `readonly` is only a compiler check, during runtime user can do
many types of trickeries with pointers to modify the value

### alias

`alias` a property with a new name and every original property flags will be
honored.

## extends

Inheritance

```language
struct A {
  int value
  constructor(_value) {
    value = _value
  }

  void print() {
    print("A.value = ", value)
  }
}

struct B extends A {
  int value2

  constructor(int _value, int _value2) {
    A(_value)
    value2 = _value2
  }

  void print2() {
    cast<A>(this).print()
    print("B.value2 = ", value2)
  }
}


var v = B(101, 100)
#assert v.value != 101
#assert v.value2 != 100


v.print() // works
cast<A>(v).print() // also, works
v.print2()
```

## composite

Compose two structs by appending one to the other.

Both keep total independence and both constructors must be called at creation time.

```language
struct A {
  int value
  constructor(_value) {
    value = _value
  }

  void print() {
    print("A.value = ", value)
  }
}

struct B composite A as a {
  int value2

  constructor(int _value2) {
    value2 = _value2
  }
}

// TODO -> alloc [B.sizeof(100) + A.sizeof(101)]
var v = B(100)(101)
#assert v.value2 != 100
#assert v.a.value != 101
#assert v.value != 101


v.print() // fail
cast<A>(v).print() // works
```


## Type aggregation

Type aggregation solve the use of a single array for multiple data layouts.

```
type Vectors = Vector2 | Vector3
array<Vectors> list(20);
```

## Type testing

Types can be tested at compile time and runtime because a `type` can be used as variable.

```
interface IA {}
interface IB {}

struct A implments IA {}
struct B implments IB {}

// compile time
template $t1
template $t2

function compare($t1 a, $t2 b) i32 {
  #if $t1 implements IA
    // execute this and evaluate
    return -1
  #else
    return 1
  #endif
}

var a_inst = A()
var b_inst = A()

compare(a_inst, b_inst) // return -1
compare(b_inst, a_inst) // return 1


// runtime time
function runtime_compare(type t, $t1 a, $t2 b) i32 {
  if t implements IA {
    //execute this and evaluate
    return -1
  } else {
    return 1
  }
}
runtime_compare(A, a_inst, b_inst) // return -1
runtime_compare(type(a_inst), a_inst, b_inst) // return 1

runtime_compare(B, b_inst, a_inst) // return 1
runtime_compare(type(b_inst), a_inst, b_inst) // return -1
```

## Type discrimination / tagged union (Safe unions)

```
enum EntityType {
  Chair = "Chair",
  Table = "Table",
}

struct Entity interface {
  readonly type: EntityType; // discriminators are readonly properties
}

struct Chair : extends BaseEntity {
  readonly type: EntityType = EntityType.Chair; // that are defaulted on childrens
  color: string;
}

struct Table : extends BaseEntity {
  readonly type: EntityType = EntityType.Table; // that are defaulted on childrens
  legs: u8;
  color: string;
}

type Furniture = Chair | Table;

function createFurniture(type: string): Furniture {
  switch (type) {
    case EntityType.Chair:
      return Chair()
    case EntityType.Table:
      return Table()
  }
}

function createFurniture2(type: string): Furniture {
  var f = new Furniture()

  switch (type) {
    case EntityType.Chair:
      Chair.constructor(f)
    case EntityType.Table:
      Table.constructor(f)
  }
  return f
}

function useFurniture(f: Furniture) {
  // f.legs - legs in not a property of Chair, guard the access
  switch (type) {
    case EntityType.Chair:
      // here f is a Chair, and no Furniture anymore
    case EntityType.Table:
      Table.constructor(f)
  }
  if (f.type == "Chair") {
    // inside this block the compiler should now f is type Chair
    // f.legs - gives an error
  }
}

var x = new array<Furniture>(10)

var f = Chair.constructor(x.push_back())
var f2 = Table.constructor(x.push_back())

```

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

## Array

see [array](type-array.md)

## Text / strings

see [rune](type-strings.md#rune)
see [string](type-strings.md#string)

## Dictionary

TODO

## time

TODO

## date

TODO
