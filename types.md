# types

<!--
  https://en.wikipedia.org/wiki/C_data_types
-->

The following data types are built-in / primitives

<!--

-->

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
