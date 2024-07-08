# Structured

*Semantics*

1. A `struct` is an aggregate type with contiguous memory type which members can have distinct types.

*Constraints*

1. Same as `c language`, struct shall be 100% compatible.

*Example*

```language
type Vector2 = struct {
  f32 x
  f32 y
}

type Vector3 = struct extends Vector2 {
  f32 z
}

type Quaternion = struct extends Vector3 {
  f32 w
}
```

# default constructor

*Semantics*

A default constructor is defined with all the properties in order.

*Constraints*

1. A default constructor shall be define by compiler if no other constructor is present.

*Example*

```language
type a = struct {
  $t y
  float z
  /*
  default constructor:
  new($t y, float z) {
    this.y = y
    this.z = z
  }
  */
}
```

# Initialization

## JS Object initialization

*Example*

```language
type v2 = struct {
  float x
  float y
}
// ordered initialization using the default constructor
// type not required
var vec0 = v2(0, 0)

// ordered initialization as JS Object
var v2 vec1a = {0, 0}
var vec1b = v2{0, 0}

// named initialization as JS Object
var v2 vec2a = {x: 0, y: 0}
var vec2b = v2 {x: 0, y: 0}

// Property Init Shorthand
var float x = 100
var v2 vec3a = {x, y: 0}
var vec3b = v2 {x, y: 0}

// named initialization as JS Object not literal
var v2 vec3c = {x: x, y: 0}
```

# Default destructor

*Semantics*

A default destructor is defined and will free the memory of all properties
that `own` memory.

```language
type a = struct {
  own ref<string> pstr
  sref<string> pstr2

  /*
  default destructor:
  function () {
    delete this.pstr
    // do not delete
  }
  */
}
```


# struct modifiers

## `extends` (Inheritance)

*Semantics*

`extends` creates new `struct` with all the previous properties and methods.

*Constraints*

1. A property in derived struct shall not collide with base struct properties.

2. A method in derived struct shall not collide with base struct method unless
overwrite/override is used. This includes the constructor.

```language
struct A {
  int value
  new(_value) void {
    value = _value
  }

  function print() void {
    print("A.value = ", value)
  }
}

struct B extends A {
  int value2

  override function new(int _value, int _value2) {
    override(_value)
    value2 = _value2
  }

  override function print() void {
    override()
    print("B.value2 = ", value2)
  }

  function print2() void {
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

## `align` (memory alignament)

*Semantics*

Align `struct` properties to given value.

*Constraints*

1. Same as `c language`, struct shall be 100% compatible.

# Properties modifiers

## `hoist`

*Semantics*

`hoist` modifier makes property name optional so the access fells like extends.

This ease composition patterns.

*Remarks*: Only exposes properties and no methods.

*Constraints*

1. `hoist` shall be applied only to properties or a semantic-error shall raise:

> hoist shall be applied only to struct properties.

2. The compiler shall check for no collisions in self property names or other hoist.

*Collisions examples*
```language-error
type abc = struct {
  i32 a
  i32 b
  i32 c
}
// "abc" hoist collide "a" property
type y = struct {
  hoist x x
  i32 a
}
// "hoist abc y" collide "hoist abc x" as both declared the same properties
type y = struct {
  hoist x x
  hoist x y
}
// "abc.a" collide with a getter
type y = struct {
  hoist x x
  get i32 a { return 0; }
}
// "abc.a" collide with a function
type y = struct {
  hoist x x
  function a() int { return 0; }
}
```

*Example*

```language
type Vector3 = struct {
  float x
  float y
  float z

  function add(Vector3 b) {
    x += b.x
    y += b.y
    z += b.z
  }
}
type Player = struct {
  hoist Vector3 position
}

p = Player()
p.y = 1 // hoisted property
p.position.x = 1 // still valid

// It only expose properties, not methods.
p.add(Vector3(10,11,12)) // fail, add is not a member of Player.
p.position.add(Vector3(10,11,12)) // ok
```

## `readonly` property modifier

*Semantics*

Mark the property as `readonly` outside the constructor, so nobody can modify
it's value.

*Remarks*: This means no modifications to all the memory, including calling function that modify internal memory

*Constraints*

1. `readonly` shall be applied only to properties or a semantic-error shall raise:

> readonly shall be applied only to struct properties.

2. If a `struct` has `readonly` properties without default value a constructor
shall be defined or a semantic-error shall raise

> Found a non-default readonly property and no constructor.

3. Disallow calling any function that it's parameter don't have readonly modifier or a semantic-error shall raise:

> Try to call a function that modify a readonly property

> Try to assign a readonly property

> Try to remove readonly modifier at cast

> Try to remove readonly modifier at unsafe_cast

*Example*

```language
struct dbtable {
  readonly string id
  string name

  new (string _id, string _name) {
    id = _id
    name = _name
  }
}

var dbtable t("xxx-xxx-xxx", "yyy")
t.id = "zzz-zzz-zzz" // semantic error: id property is readonly
t.name = "zzz-zzz-zzz" // ok

t.id.grow(10) // it will also fail, as grow modify id
var string part = t.id.substr(1, 5) // works, as slice will create a new string
```

## `alias`

*Semantics*

Creates an `alias` name for given property.

An alias won't occupy memory as it's just a syntax sugar.

*Constraints*

1. Aliased property modifiers shall be honored.

2. Alias shall not collide with other name properties.

3. Alias shall not be used/exported to rtti (under consideration)


## `own`

*Semantics*

Mark the property as memory owner. This implies that the memory will be freed
at destruction.

*Constraints*

1. Memory shall be freed at destructor

*Example*

```language
type User {
  own ref<string> name
}

{
  new User("xxxx")
}

```

## `override` modifier

<!--
  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override
-->

*Semantics*

Replace a inherited method but the overridden method shall be call in function body.

*Constraints*

1. At `override` function body there must be a call to inherited method.

2. `override` modifier shall be applied only to methods.

3. `overwrite` and `override` shall be mutually exclusives

*Example*

```language
type v2 = struct {
  float x
  float y
  constructor(float x, float y) {
    this.x = x
    this.y = y
  }
}

type v3 struct extends v2 {
  float z

  override constructor(float x, float y, float z) {
    override(x, y)
    this.z = z
  }
}
```

## `overwrite`

*Semantics*

Replace an inherited method.

*Constraints*

1. `overwrite` modifier shall be applied only to named functions and methods.

2. `overwrite` and `override` shall be mutually exclusives.


*Example*

```language
struct v2 {
  float x
  float y

  function toString() string {
    return ##function# + "{" + this.x + ", " + this.y + "}"
  }
}

struct v3 extends v2 {
  float z

  overwrite function toString() string {
    return ##function# + "{" + this.x + ", " + this.y + ", " + this.z + "}"
  }
}
```

<!--


## `covers` EXPERIMENTAL

*Semantics*

It covers a type so every operator will be fowarded unless `!.` is used.

*Constraints*

1. If `covers` is used `extends` shall be forbidden

2. `overwrite` and `override` shall be mutually exclusives.


*Example*

```language
type shared_pointer<$t> = struct covers $t {
  ref<shared_pointer_data<$t>>

  function toString() string {
    return ##function# + "{" + this.x + ", " + this.y + "}"
  }

  // forward
  operator . ($any v) {
    return pointer.data.operator.(v)
  } 
}
```


-->