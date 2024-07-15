<!--

  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface

-->
# interface

*Semantics*

Interfaces defines contract a `struct` shall define: properties, getter, setters and methods

*Remarks*: `implements` is not required to match an interface it just tells the compiler to report errors if something is missing.

*Constraints*

<!--
  Empty interface is used:
  * for generics in some languages
  * any type
  mostly is a hack
-->
1. Empty interface shall raise a semantic-error

> At least one property or method is required.

2. To match an interface a `struct` shall match the properties and methods defined.

3. `interface` shall no contains aliases

> An alias found at interface '?'

4. Alias can be used to match an interface property or getter

```language
type has_length = interface {
  size length
}

type xxx = struct {
  size len
  alias length len
}
```

<!-- CS0144 -->
5. instancing an interface shall raise a semantic-error

> Cannot create an instance of the interface '?'

# implements (Explicit Interface Implementation)

*Semantics*

`implements` instructs the compiler the developer want to fulfill the `interface` so errors shall be reported if not fulfilled.

*Constraints*

1. To match an `interface` a `struct` shall defined all the properties, getter, setters, and methods defined at the `interface`.

> Missing property '?' of type '?' at struct '?' that implements interface '?'

> Missing getter '?' of type '?' at struct '?' that implements interface '?'

> Missing setter '?' of type '?' at struct '?' that implements interface '?'

> Missing method '?' of type '?' at struct '?' that implements interface '?'

*Examples*

```language
type index_iterator<template $t> = interface {
  size length
  function operator[](size i) $t
}

type marray<$t> = struct implements index_iterator<$t> {
  size length = 0
  vector<$t> list

  function operator[](size i) $t {
    return list[i]
  }
}
```

## Type: self

*Semantics*

`self` will match the current type name.

*Remarks*: Self enable covariant result types.

*Constrains*

1. `self` shall be only inside interface or a semantic-error shall raise

> self shall be used only in interfaces.

2. When checking if a type fulfill the interface `self` points to the current type.

*Example*

```language
type plus_able = interface {
  operator + (self other) self
}

type point = struct extends plus_able {
  float x
  float y

  // this will implement: plus_able.operator +
  operator + (point other) point {
    x += other.x
    y += other.y
    return this
  }
}
```

## Type: any

*Semantics*

`any` will match any type except void.

*Constrains*

1. `any` shall be only inside interface or a semantic-error shall raise

> any shall be used only in interfaces.

1. `any` is ? if ? is not void


## multiple interfaces

To compose multiple interfaces into one, just create a type with all interfaces and the desired operator.

```language
type Printer = interface {
    Print()
}

type Scanner = interface {
    Scan()
}

type Printer_AND_Scanner = Printer & Scanner
type Printer_OR_Scanner = Printer | Scanner
```