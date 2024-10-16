# Structured type (DRAFT 1)

*Semantics*

1. A `struct` is an aggregate type with contiguous memory type which fields can have distinct types.

A struct is composed of:

* fields: named value that occupy memory
* getter/setters: named value that don't occupy memory (syntax sugar)
* methods: named function that has the type as first parameter

`properties` are the set of fields + getters + setters

`members` are the set of fields + getters + setters + methods.

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

2. A structure shall not contain a field with incomplete

Error

```error
type A = struct {
  B b
}
type B = struct {
  A a
}
```

> mutually dependent types found: \['?'\[,]]

But using a ref is ok, because a pointer is always of the same size regarless the type it points.

```error
type A = struct {
  ref<B> b
}
type B = struct {
  ref<A> a
}
```

3. A structure shall field name shall be unique, shall not contain a field with same name
as a getter or a setter or a method or another field. A semantic-error shall raise

> redefinition of field '?' at '?'


## Field declaration

*Semantics*

A `struct` field is a identifier that point to a defined offset/type in a struct.

*Constraints*

1. A field shall require a type that defines its size/offset based on c rules.

2. A field may have a default value.

3. A field name shall be unique or a semantic-error shall raise

> duplicated field '?' on type '?'


## Getters and Setters

*Semantics*

Getters and setters are just syntax sugar for field manipulation/validation. Do not occupy memory.

*Constraints*

1. A getter shall no modify struct memory or a semantic-error shall raise

> At type '?' Found a getter '?' that modify the type.

2. A setter shall have at least one code path that modify the struct memory or a semantic-error shall raise

> At type '?' Found a setter '?' that do not modify the type.

3. Getter/setter name shall no collide with fields

> duplicated getter name '?' on type '?'

> duplicated setter name '?' on type '?'.

*Example*

```language
type Person = struct {
  string _name
  string surname
  string? lastname
  int postalCode


  get string fullName {
    return _name + " " + surname + (lastname != null ? " " + lastname : "")
  }

  get bool isValid {
    return name.length > 1
  }

  set name(string value) {
    _name = value.ucase()
  }

  set address(string value) {
    postalcode = cast<string>(value.split(",")[1])
  }
}
```

*Error*

```language
type Person = struct {
  string _name

  set name(string value) {
    print(value)
  }
}
```

> At type 'Person' Found a setter 'name' that do not modify the type.


## Object initialization

There are various ways to initialize an object.


### Default constructor

*Semantics*

The default constructor is defined as a function that has as many parameters as fields has the structure in the same order, type and default value.

*Constraints*

1. A default constructor shall be defined by compiler if no other constructor is present.

*Example*

```language
type person = struct {
  string name
  float height = 0.0

  get float zp1 {
    return z + 1
  }

  /*
  default constructor:
  zp1 is not part of the constructor because it's a property not a field
  new(string name, float height =  0.0) {
    this.y = y
    this.z = z
  }
  */
}

var person p = new("John")
var person p2 = new("John", 172)
var p3 = new person("John", 172)
```

### Empty constructor

*Semantics*

There is no empty constructor, if a developer need it, declare a default value for all fields.

*Example*

```language
type vector2 = struct {
  float x = 0.0
  float y = 0.0
}

var x = new vector2()
var vector2 x = new()
```

### Braces Initializer (JS Object)

*Semantics*

Initialize an `struct` by setting it's fields instead of using the constructors (syntax similar to C/Javascript/JSON).

*Constraints*

1. Only fields can be used or a semantic-error shall raise:

> Cannot find '?' as field of type '?'

2. Constructor resolution has the same resolution algorithm as function call with named parameters against all constructors.

If a valid constructor can't be not found a semantic-error shall raise

> No constructor match given initializer

> expected 'N': new(?, ?, ?)

> Found:    new(?, ?, ?)

If more than one constructor is found

> Found '?' possible constructors. Disambiguation is needed

> Found 'N': new(?, ?, ?)

<!-- test: struct.init.ordered -->
3. If fields names are omitted, the order shall be the same as declared.

4. JS Object initialization shall be used only if default constructor is defined or a semantic-error shall raise:

> A custom constructor is defined, use it instead.

*Example*

```language
type v2 = struct {
  float x
  float y
}
type line = struct {
  v2 start
  v2 end
}
type person = struct {
  string name
  string surname
  string? address = null
  size born = 1900
}
// ordered initialization using the default constructor
// left type inferred
var vec0 = v2(0, 0)

// braced ordered initialization
var v2 vec01 = {0, 0}
var vec02 = v2{0, 0}

var l1 = line {{0, 0}, {10, 10}}
var l2 = line {start.x : 0, start.y: 0, end.x: 10, end.y: 10}
var l3 = line {start: {x : 0, y: 0}, end: {x: 10, y: 10}}
var l4 = line {start: {0, 0}, end: {10, 10}}

// braced ordered initialization with default values
var person01 = person { "John", "Doe" }
#assert person01.address ==  person.address.default
#assert person01.born    ==  person.born.default

var person02 = person { "John", "Doe", default, 2011 }
#assert person02.address ==  person.address.default
#assert person02.born    ==  2011

// braced named initialization / JS Object
// full
var v2 vec03 = {x: 0, y: 0}
// partial
var v2 vec04 = {x: 0, 0}
var v2 vec05 = {0, y: 0}

// single/double quotes are not necessary, as fields names are identifiers
var v2 vec05 = {"x": 0, "y": 0}
var vec06 = v2 {"x": 0, "y": 0}
var v2 vec07 = {'x': 0, 'y': 0}
var vec08 = v2 {'x': 0, 'y': 0}
```

## Default destructor

*Semantics*

The default destructor is defined as a function that will free the memory owned by the struct.

*Constrains*

1. Destruction order is the same as the fields are defined.

*Example*

```language
type a = struct {
  own ref<string> pstr
  ref<string> pstr2
  i8 num

  /*
  default destructor:
  delete () {
    delete this.pstr
    // do not delete pstr2, as we don't own it
    // do not delete num, as it does not holds heap memory
    delete this
  }
  */
}
```

## structure/object methods

*Semantics*

An object method is a function declared inside its body that operates with the structure (specially the first parameter is `ref<?> this`)

A function can be used as an object method but no the other way, because the methods are namespaced.

*Constraints*

1. A function can be used as a method if the compiler can cast the object as first argument.

```error
function fn_by_copy (i8 a, i8b) {
  // ...
}
function fn_by_reference (ref<i8> a, i8b) {
  // ...
}
function fn_invalid_cast (array<i8> a, i8b) {
  // ...
}

function fn_autocast_point (array<i8> a, i8b) {
  // ...
}
type point = struct { float x; float y }
function autocast(i8 a) point {
  return point(a, 0)
}

function main() {
  var i8 a = 1
  var i8 b = 2

  a.fn_by_copy(b) // valid, 'a' will be copied
  a.fn_by_reference(b) // valid, 'a' will be referenced (implicit autocast by the compiler)
  a.fn_invalid_cast(b) // invalid as 'a' can't be casted to array
  a.fn_autocast_point(b) // valid, as the compiler found way to cast: autocast(i8) -> point
}
```


*Example*

```error
type point = struct {
  add(ref<point> b) {
    // ...
  }
}

function sub(ref<point> a, ref<point> b) {
  // ...
}

function main() {
  var p1 = point{}
  var p2 = point{}
  
  p.add(p2)  // valid
  add(p1, p2) // <-- Semantic-error: can't find add
  point.add(p1, p2) // <-- valid

  sub(p1, p2)  // valid
  p1.sub(p2)   // valid

  print(typeof(add))        // Semantic-error: can't find add
  print(typeof(point.add))  // valid: function...
  print(typeof(sub))        // valid: function...
}
```

## structure/object operators (operator overloading)

Read more at [expressions](../expressions.md#operator-overloading)

## struct modifiers

### `extends` (Inheritance)

*Semantics*

`extends` creates new `struct` with all the previous fields, properties and methods at the beginings of the current.

*Constraints*

1. A property or fields in derived struct shall not collide with base struct properties.

2. A method in derived struct shall not collide with base struct method unless
`overwrite`/`override` is used.

2. 1. If parent struct has default constructor/destructor, child may have constructor/destructor.

2. 2. If parent struct has a constructor/destructor, child shall have a constructor/destructor or a semantic error shall raise

> Child constructor shall be defined as parent defined a constructor.

> Child destructor shall be defined as parent defined a destructor.

```language
type A = struct {
  int value
  new(int _value) void {
    value = _value
  }

  function print() void {
    print("print: A.value = ", value)
  }

  function print2() void {
    print("print2: A.value = ", value)
  }
}

type B = struct extends A {
  int value2

  override function new(int _value, int _value2) {
    overriden(_value)
    value2 = _value2
  }

  override function print() void {
    overriden()
    print("B.value2 = ", value2)
  }

  overwrite function print2() void {
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

*Example*

Memory layout example

```language
type start {
  i8 a
  i8 b
}
type middle = struct extend start {
  i8 c
  i8 d
}
type end = struct extend middle {
  i8 e
  i8 f
}

var ref<end> value = new {1,2,3,4,5,6}
// first position of the struct is the position of the first field
#assert @value == @(value.a)
#assert @value + 1 == @(value.b)
#assert @value + 2 == @(value.c)
#assert @value + 3 == @(value.d)
#assert @value + 4 == @(value.e)
#assert @value + 5 == @(value.f)

var ref<middle> value2 = cast value
#assert @(value2) == @(value2.c)
#assert @(value2) + 1 == @(value2.d)

var ref<end> value3 = cast value
#assert @(value3) == @(value3.e)
#assert @(value3) + 1 == @(value3.f)

```

## `align` (memory alignament)

*Semantics*

Align `struct` properties to given value.

*Constraints*

1. Same as `c language`, struct shall be 100% compatible.

*Examples*

```
# packed
type x = struct align 0 { // also known as packed
  bool a
  bool b
  bool c
}

#assert x.sizeof == 1
#assert x.a.offset == 0
#assert x.b.offset == 1
#assert x.c.offset == 2

type x2 = struct align 4 { // force alignment to 4
  bool a
  bool b
  bool c
}
#assert x.sizeof == 3
#assert x.a.offset == 0
#assert x.b.offset == 4
#assert x.c.offset == 8
```

# Properties modifiers

## `hoist`

*Semantics*

`hoist` modifier makes a field access name optional.

This ease composition patterns.

*Remarks*: Only exposes struct properties but no methods.

*Constraints*

1. `hoist` shall be applied only to fields or a semantic-error shall raise:

> hoist shall be applied only to struct fields.

2. The compiler shall check for no collisions in self property names or other hoist or a semantic errror shall raise

> On type '?' field '?' collide with hoist field '?'. '?' type constains '?'.

> On type '?' getter '?' collide with hoist field '?'. '?' type constains '?'.

> On type '?' setter '?' collide with hoist field '?'. '?' type constains '?'.

> On type '?' function '?' collide with hoist field '?'. '?' type constains '?'.

> On type '?' hoisted field '?' collide with '?'

*Error*

```language-error
type abc = struct {
  i32 a
  i32 b
  i32 c
}
// On type 't1' field 'a' collide with hoist field 'x'. 'abc' type constains 'a'.
type t1 = struct {
  hoist abc x
  i32 a
}
// On type 't2' hoisted field 'y' collide with 'x'. 'abc' type constains 'a'.
type t2 = struct {
  hoist abc x
  hoist abc y
}
// On type 't3' getter 'a' collide with hoist field 'x'. 'abc' type constains 'a'.
type t3 = struct {
  hoist abc x
  get i32 a { return 0; }
}
// On type 't4' function 'a' collide with hoist field 'x'. 'abc' type constains 'a'.
type t4 = struct {
  hoist abc x
  function a() int { return 0; }
}
// On type 't5' hoisted field 'a' collide with 'a'
type t5 = struct {
  function a() int { return 0; }
  hoist abc x
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

var p = Player()
p.y = 1 // hoisted property
p.position.x = 1 // still valid

// It only expose properties, not methods.
p.add(Vector3(10,11,12)) // fail, add is not a member of Player.
p.position.add(Vector3(10,11,12)) // ok
```

## `readonly` field/function modifier

*Semantics*

Mark the property as `readonly` outside the constructor, so nobody can modify
it's value.

*Remarks*: This means no modifications to all the memory, including calling function that modify internal memory

*Constraints*

1. `readonly` shall be applied only to fields or a semantic-error shall raise:

> readonly shall be applied only to struct fields.

2. If a `struct` has `readonly` fields without default value a constructor
shall be defined or a semantic-error shall raise

> Found a non-default readonly property and no constructor.

3. Disallow calling any function that it's parameter don't have readonly modifier or a semantic-error shall raise:

> Try to call a function that modify a readonly property

> Try to assign a readonly property

> Try to remove readonly modifier at cast

> Try to remove readonly modifier at unsafe_cast

*Example*

```language
type dbtable = struct {
  readonly string id
  string name

  new (string _id, string _name) {
    id = _id
    name = _name
  }
}

var dbtable t("xxx-xxx-xxx", "yyy")
// assignament error
t.id = "zzz-zzz-zzz" // semantic error: id field is readonly
t.name = "zzz-zzz-zzz" // ok

// write-method call error
// semantic error: called a method that modify a readonly field.
t.id.grow(10)

// read-method call ok
var string part = t.id.substr(1, 5) // works, as slice will create a new string
```

*Example*

`readonly` on method forbid "this" modifications.

```language

type point = struct {
  float x
  float y

  readonly function distance(readonly ref<point> b) float {
    return sqrt(pow2(b.x - x) + pow2(b.y - y))
  }
}

// equivalent to
function distance(readonly ref<point> a, readonly ref<point> b) float {
  return sqrt(pow2(b.x - a.x) + pow2(b.y - a.y))
}


var a = new vetor(0, 1)
var b = new vetor(1, 0)

#assert a.distance(b) ~== 1.414213
//equivalen to
#assert distance(a, b) ~== 1.414213

```

## `alias`

*Semantics*

Creates an `alias` name for given property.

An alias won't occupy memory as it's just a syntax sugar.

*Constraints*

1. Aliased property modifiers shall be honored.

2. Alias shall not collide with other name properties.

3. Alias shall not be used/exported to rtti (under consideration)

*Example*

```language
type stack {
  // ...
  size length
  alias count length
}

var s = stack()

#assert @(s.length) == @(s.count)
```

## `own`

*Semantics*

Mark the field as memory owner. This implies that the memory will be freed
at destructor.

*Constraints*

1. Memory shall be freed at destructor implicitly.

*Example*

```language
type Holder = struct {
  own ref<i8> value
}

function main() {
  var before = core.heap.allocated
  {
    var user
    var address
    {
      var iptr = new i8
      iptr = 101
      user = new Holder(iptr)
      address = @iptr
    }
    // same address
    #assert @(user.value) == address
    // and same value
    #assert user.value == 101
  }

  #assert heap.allocated == core.heap.allocated
}

```

## `override` modifier

<!--
  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override
-->

*Semantics*

Replaces an inherited method with a new implementation. The overridden method shall be called inside function body.

*Constraints*

1. At `override` function body there must be a call to the overriden method or a semantic error shall raise

> override modifier is applied to function '?' but the overriden method is not called. Use overwrite instead ?

2. `override` modifier shall be applied only to methods.

3. `overwrite` and `override` shall be mutually exclusives or a semantic error shall raise

> overwrite and override are mutually exclusives function modifiers.

*Example*

```language
type v2 = struct {
  float x
  float y
  new(float x, float y) {
    this.x = x
    this.y = y
  }

  function clear() {
    this.x = 0
    this.y = 0
  }
}

type v3 = struct extends v2 {
  float z

  new(float x, float y, float z) {
    v2.new(x, y) // Propossals/TODO: study base.new: base as generic name to point the first extension
    this.z = z
  }

  override function clear() {
    override() // Propossals: base.clear() | v2.clear()
    this.z = 0
  }
}
```

## `overwrite`

*Semantics*

Replaces an inherited method with a new implementation.

*Constraints*

1. At `overwrite` function body a to the overriden method shall be forbidden, a semantic error shall raise

> overwrite modifier is applied to function '?' but the overwrittern method is called. Use override instead ?

2. `overwrite` modifier shall be applied only to methods.

3. `overwrite` and `override` shall be mutually exclusives or a semantic error shall raise

> overwrite and override are mutually exclusives function modifiers.



*Example*

```language
type v2 = struct {
  float x
  float y

  function toString() string {
    return ##function# + "{" + this.x + ", " + this.y + "}"
  }
}

type v3 = struct extends v2 {
  float z

  overwrite function toString() string {
    return ##function# + "{" + this.x + ", " + this.y + ", " + this.z + "}"
  }
}
```
