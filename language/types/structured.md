# Structured

*Semantics*

A `struct` is an aggregate type with contiguous memory type which members can have distinct types.

*Constraints*

A struct can contain padding between members. Apply the same rules as
`c language` to keep compatibility.

<!--
  Thus, for example, structure assignment may be implemented element-at-a-time or via memcpy.
-->


```syntax
struct_properties_flags =
  hoist struct_properties_flags
  readonly struct_properties_flags

struct_properties_list =
  alias identifier identifier ENDL struct_properties_list
  struct_properties_flagsₒₚₜ type identifier ENDL struct_properties_list

struct_alignament =
  align literal_integer

struct_extends =
  extends identifier

struct_declaration =
  struct identifier struct_alignamentₒₚₜ struct_extendsₒₚₜ '{' struct_properties_list '}'

```

*Example*

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

## `hoist` property modifier

*Semantics*

`hoist` makes structs properties access faster by making given name optional.

*Constraints*

1. `hoist` shall not be applied to setters or getters.

*Example*

```language
struct Player {
  hoist Vector position;
}

p = Player()
p.y = 1 // hoisted property
p.position.x = 1 // still valid
```

## `readonly` property modifier

*Semantics*

`readonly` properties cannot be modified outside the constructor.

*Constraints*

1. `readonly` shall not be applied to setters or getters.

2. If a `struct` has `readonly` properties a constructor must be defined.

## `alias`: property modifier

*Semantics*

An `alias` is just a compiler construct. An alias won't occupy memory.
It just give a new name to access the original property.

*Constraints*

1. Aliased property modifiers shall be honored.

## Inheritance: `extends`: struct modifier

*Semantics*

`extends` enables you to create new classes that reuse, extend, and modify
the behavior defined in other classes.

*Constraints*

1. A derived struct shall not have properties with the same name as base struct.

2. Derived struct constructor must call base struct constructor.


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

  void print() {
    cast<A>(this).print()
    print("B.value2 = ", value2)
  }

  void print2() {
    print("B.value2 = ", value2)
  }
}


var v = B(101, 100)
#assert v.value != 101
#assert v.value2 != 100


v.print() // call B.print
cast<A>(v).print() // call A.print
v.print2() // call B.print2
```


## `override` modifier

<!--
  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override
-->

*Semantics*

Extends an inherited method.

*Constraints*

1. `override` method must call inherited method.

2. `override` modifier shall be applied only to methods.

3. `overwrite` and `override` shall be mutually exclusives

## `overwrite`

*Semantics*

Replace an inherited method.

*Constraints*

1. `overwrite` modifier shall be applied only to named functions and methods.

2. `overwrite` and `override` shall be mutually exclusives


# `class`

`class` is an alias of `struct`.
