<!--
  6.7.2.1 Structureand union specifiers


  TODO support flexible array member?

-->
# Structured type (DRAFT 1)

*Syntax*

```syntax
structTypeDecl
  : ('noalign' | 'lean')* 'struct' (typeExtendsDecl | typeImplementsDecl)* '{' endOfStmt? structProperty* '}'
  ;

typeExtendsDecl
  : 'extends' typeDefinition
  ;

typeImplementsDecl
  : 'implements' typeDefinition
  ;

structProperty
  : structPropertyDecl endOfStmt
  | comments endOfStmt
  ;

structPropertyDecl
  : (structPropertyModifiers)* typeDefinition identifier ('=' (constant | arrayConstantInitializer | structConstantInitializer))?
  // TODO REVIEW aliasing operator?
  | propertyAlias
  | functionDef functionBody
  | memoryFunctionDecl
  | operatorFunctionDecl
  | structGetterDecl
  | structSetterDecl
  ;

// TODO do not repeat at parser level ?
structPropertyModifiers
  : 'own'
  | 'hoist'
  | 'readonly'
  | 'static'
  ;

propertyAlias
  : 'alias' identifier identifier
  ;

structGetterDecl
  : structGetterDef functionBody
  ;

structGetterDef
  : 'get' typeDefinition identifier
  ;

structSetterDecl
  : structSetterDef functionBody
  ;

structSetterDef
  : 'set' identifier '(' typeDefinition identifier ')'
  ;

structInitializer
  : typeDefinition? '{' structProperyInitializerList? '}' #    cStructInitializer
  | typeDefinition? '{' jsonInitializerList '}'                           # jsonStructInitializer
  ;

structProperyInitializerList
  : structProperyInitializer (',' structProperyInitializer)*
  ;

structProperyInitializer
  : identifier ('.' identifier)* ('='|':') rhsExpr       #   namedStructProperyInitializer
  | rhsExpr                                        # orderedStructProperyInitializer
  ;

jsonInitializerList
  : jsonInitializerPair (',' jsonInitializerPair)* ','?
  ;

jsonInitializerPair
  : stringLiteral ':' constant
  ;

// TODO
structConstantInitializer
  : '{' structProperyInitializerList? '}'
  ;
```

*Semantics*

1. A `struct` is an aggregate type with contiguous memory type which fields can have distinct types.

Used nomenclature:

* `fields`: Named values that are stored in memory
* `setters` and `getters`: Named values that aren't stored in memory (syntax sugar)
* `alias`: Name value that points directly to a field (syntax sugar)
* `methods`: named function that manipulates the struct
* `properties` are the set of `fields` + `aliases` + `getters` + `setters`
* `members` are the set of `fields` + `aliases` + `getters` + `setters` + `methods`.

*Constraints*

1. It shall have the same constrains as `c language`. With the addition
of two hidden fields:

* `type` a pointer to the type to support rtti
* `allocator` a pointer to the allocator so any memory allocated in the struct methods use the same allocator by default

When used `lean` modifier this two field are removed and struct is 100% c compatible.

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

2. A structure shall not contain a field with an incomplete type

```language-semantic-error
type A = struct {
  B b
}
type B = struct {
  A a
}
```

or an instance of itself

```language-semantic-error
type A = struct {
  A a
}
```

> mutually dependent types found: \['?'\[,]]

But using a ref is ok, because a pointer is always of the same size regarless the type it points.

```language-semantic-error
type A = struct {
  ref<B> b
}
type B = struct {
  ref<A> a
}
```

3. A structure property name shall be unique or a semantic-error shall raise

> property redefinition '?:name' at '?:file?:line?:column'


## Field declaration

*Semantics*

A `struct` field is a identifier that point to a defined offset/type in a struct.

*Constraints*

1. A field shall require a type that defines its size/offset based on c rules.

2. A field may have a default value.

3. A field name shall be unique or a semantic-error shall raise

> duplicated field '?' on type '?'

<!--

  https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/using-properties

-->
## Getters and Setters

*Semantics*

Getters and setters are just syntax sugar for field manipulation/validation.

They are struct properties that have no storage.

*Rationale*

* Setters allow field validation
* Getters expose fields in diferent representations
* Future change encapsulation
* Debuggin, the developercan change a field and intercept/debug each usage.

Syntax is split to support documentation of each part.

*Constraints*

1. A getter shall no modify struct memory or a semantic-error shall raise

> At type '?' Found a getter '?' that modify the type.

2. A setter shall have at least one code path that modify the struct memory or a semantic-error shall raise

> At type '?' Found a setter '?' that do not modify the type.

3. Getter/setter name shall no collide with fields

> duplicated field/property name '?' on type '?'

> duplicated field/property name '?' on type '?'.

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

## Decorators (EXPERIMENTAL)

<!--
  https://peps.python.org/pep-0318/

  STUDY: decorator may be part of meta-programming and be a compile-time feature, not a mix one like now?
-->

*syntax*

```todo-syntax
setDecoratorDecl
  : 'decorator' 'set' identifier '(' functionParameterList ')' typeDefinition functionBody
  ;

getDecoratorDecl
  : 'decorator' 'get' identifier '(' functionParameterList ')' functionBody
  ;

newDecoratorDecl
  : 'decorator' 'new' identifier '(' functionParameterList ')' functionBody
  ;

deleteDecoratorDecl
  : 'decorator' 'delete' identifier '(' functionParameterList ')' functionBody
  ;

functionDecoratorDecl
  : 'decorator' 'function' identifier '(' functionParameterList ')' typeDefinition functionBody
  ;
```


### Struct decorators

*Semantics*

Struct decorators allows validation, initialization, dependency injection, observation, etc. reusable.

*Constraints*
<!-- STUDY: function could be applied to all methods -->
<!-- STUDY: set/get could be applied to all fields -->
1. Only `new` and `delete` decorators can be applied to `struct`.

2. Apply the same constraints as function decorators.

3. `new decorator` and `delete decorator` shall have only one parameters a ref to a `struct`, `interface` or template.

3. `new decorator` will be applied after the constructor.

4. `delete decorator` will be applied before destructor.

```todo-language
decorator new log<$t>(ref<$t> this) {
  print(this)
}
decorator delete log<$t>(ref<$t> this) {
  print(this)
}

@log
type user = struct {
  own ref<string> name

  new () {
    print("new starts")
    this.name = "Jhon"
    print("new end")
  }

  delete() {
    print("delete starts")
    // ?
    print("delete end")
  }
}

function main() {
  var x = new user()
}

```

```language-compiled
type user = struct {
  string name
}
function new(ref<user> this) {
  print("new starts")
  this.name = "Jhon"
  print("new end")

  new_log(this)
}

function delete(ref<user> this) {
  delete_log(this)

  print("delete starts")
  // ?
  print("delete end")
}

function main() {
  var memory = allocate memory
  var x = user.new(memory)
  user.delete(memory)
  deallocate memory
}
```


### Function decorators

*Semantics*

Functions decorators encapsulate a function inside another.

1. Only `get` decorators can be applied to `parameters`.

2. First argument shall be a function type with the same singnature as the decorated function.

3. The rest of the parameters shall match the decorated function.

<!-- STUDY, at least once in each code path ? -->
4. First argument shall be called inside the body at least once

5. `function decorators` generates a modification of each decorated `function call`.

*Example*

```todo-language
var decorator_is_called = false
var decorated_is_called = false
type str_to_str = function (string) string
decorator function log(str_to_str f, string input) string {
  decorator_is_called = true
  log(input)
  output = f()
  log(output)

  return output
}

@log
function decorated(string s) string {
  decorated_is_called = true
  return s
}

function main() {
  #assert decorator_is_called == false
  #assert decorated_is_called == false
  var s = decorated(" x ")
  #assert decorated_is_called == true
  #assert decorator_is_called == true
}

```

```language-compiled
function main() {
  #assert decorator_is_called == false
  #assert decorated_is_called == false
  var s = log(decorated, " x "))
  #assert decorated_is_called == true
  #assert decorator_is_called == true
}
```


### Parameters decorators

*Semantics*

Parameters decorators makes an argument validation, transformation, observation, etc. reusable.

*Constraints*

1. Only `set` and `get` decorators can be applied to `parameters`.

2. A `set` or `get` decorator can be applied to a field if the first argument has the same type or a semantic-error shall raise:

3. When a decorator is applied to a parameter it will change to a function call at the start of the function.

3. 1. The compiler search for `get decorators` with given name and it will add a function call in visual order at the start of the function.

3. 2. The compiler search for `set decorators` with given name and it will add a function call in visual order at the start of the function.

*Example*

```todo-language
decorator set range(int x, int min, int max) int {
  return (x > max ? max : (x < min ? min : x))
}
decorator get log(int x) {
  print("get value = ", x)
  return x
}

function sum(
  @log @range(0, 100) i32 a,
  @range(0, 64) i32 b
) {
  return a + b
}

function main() {
  #assert sum(i32.max, i32.max) == 164
  #assert sum(-1, -1) == 0
  #assert sum(1, 1) == 2
}

```

```language-compiled
function sum(
  i32 a,
  i32 b
) {
  log(a)
  a = range(a, 0, 100)
  b = range(b, 0, 64)
  return a + b
}

function main() {
  #assert sum(i32.max, i32.max) == 164
  #assert sum(-1, -1) == 0
  #assert sum(1, 1) == 2
}
```


### Field decorators (aka observers)

*Semantics*

Field decorators makes a field validation, observation, etc. reusable.

*Constraints*

1. Only `set` and `get` decorators can be applied to `fields`.

2. A `set` or `get` decorator can be applied to a field if the first argument has the same type or a semantic-error shall raise:

> Applied a decorator but type don't match

> field type "?:field_type:"

> decorator first argument type "?:decorator_args_0:"

3. Apply same constraints to decorator arguments as any function arguments except all arguments shall be constant, global, file or static.

4. When a decorator is applied to a field it it will change to a setter/getter with the same name, the field will be renamed to a unique name in the same position.

4. 1. The compiler search for `get decorators` with given name and arguments and apply them in visual order inside the getter.

4. 2. The compiler search for `set decorators` with given name and arguments and apply them in visual order inside the setter.

5. set/get decorator shall not lend or own memory.

<!-- STUDY -->
6. set/get decorator shall not contains templates.

7. get decorators has implicit readonly parameters.

*Example*

```todo-language
decorator set range(int x, int min, int max) int {
  return (x > max ? max : (x < min ? min : x))
}

decorator set log(int x) int {
  print("set value = ", x)
  return x
}

decorator get log(int x) {
  print("get value = ", x)
  return x
}

type Person = struct {
  @range(0, 99)
  @log()
  int age
}

function main() {
  var p = Person()
  p.age = -1
  #assert p.age == 0
  p.age = 101
  #assert p.age == 99
}
```

```language-compiled
set decorator range(int x, int min, int max) int {
  return (x > max ? max : (x < min ? min : x))
}
get decorator log(int x) int {
  print("value = ", x)
  return x
}
type Person = struct {
  // 3
  int λage
  get int age {
    // 3.1
    this.λage = log(this.λage)
    return this.λage
  }
  set age(int a) {
    this.λage = a
    // 3.2
    this.λage = range(this.λage, 0, 99)
    this.λage = log(this.λage, 0, 99)

    return this.λage
  }

  @range(0, 99)

}

function main() {
  var p = Person()
  p.age = -1
  #assert p.age == 0
  p.age = 101
  #assert p.age == 99
}
```



<!--
  https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/reflection-and-attributes/

  https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/AnnotatedElement.html

-->
## Attributes / Annotations (EXPERIMENTAL)

*Syntax*

```todo-syntax
attribute
  : typeDefinition identifier

attributeList
  : attribute endOfStmt? attributeList?

attributeDecl
  : 'attribute' identifier '=' ('struct' | 'field' | 'function' | 'parameter') '{' attributeList? '}'
```

*Semantics*

It stores data into the type.

*Constraints*

1. Developer can declare attributes for structs, fields, methods and parameters.

*Example*

```todo-language
attribute field json = struct {
  string key
}

type JsonSerializable = interface {
  function to_json(string jsonstr) {
    var str = "{"

    // #foreach -> constexpr -> expand in compile time
    #foreach k, field in $t.get_fields() {
      var jsonKey = field.getAttribute<string>("json") || field.name
      str += json.encode<string>(jsonKey) + ":" + json.encode<field.type>(this[field.name])
    }

    str += "}"
    return str
  }

  function from_json(string jsonstr) {
    var hash = json.parse_hash(jsonstr)
    var $t ret()

    // #foreach -> constexpr -> expand in compile time
    #foreach k, field in $t.get_fields() {
      var jsonKey = field.getAttribute<string>("json") || field.name

      this[field.name] = hash.get<field.type>(jsonKey)
    }
  }
}


type point = struct extends JsonSerializable {
  [json("x")]
  float x
  [json("y")]
  float y
}
function main() {
  var str_json = "{\"x\": 0.0, \"y\": 1.1}"
  var p = fromJson<point>(str_json)

  #assert p.x == 0.0
  #assert p.y == 1.1
  #assert p.to_json() == str_json
}

```


<a name="constructors"></a>
## Constructors

<a name="default-constructor"></a>
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
function main () {
  var person p = new("John")
  var person p2 = new("John", 172)
  var p3 = new person("John", 172)
}
```

### Empty constructor

*Semantics*

The empty constructor is defined when for all fields have default values.

*Example*

```language
type vector2 = struct {
  float x = 0.0
  float y = 0.0
}

function main () {
  var x = new vector2()
  var vector2 x = new()
}
```

### User / Custom constructor

*Semantics*

Explicit defined constructor.

*Constraints*

1. A non optional `ref` need to be initialized.

*Example*

```language
type vector2 = struct {
  float x = 0.0
  float y = 0.0
}

function main () {
  var x = new vector2()
  var vector2 x = new()
}
```

<a name="object-initialization"></a>
## Object initialization

There are various ways to initialize an object.

### Braces Initializer

*Semantics*

Initialize an `struct` by setting it's fields instead of using the constructors.

*Constraints*

1. Only fields can be used or a semantic-error shall raise:

> Cannot find '?' as field of type '?'

2. If at least one constructor is defined by the developer, a constructor shall be used instead od default constructor.

If a valid constructor can't be found a semantic-error shall raise

> No constructor match given initializer

> Given: new(?, ?, ?)

> Available constructors

> [?:n] new(?, ?, ?)

<!-- this can happend ? find an example... -->
If more than one constructor is found

> Found '?' possible constructors. Disambiguation is needed

> Given: new(?, ?, ?)

> Found 'N': new(?, ?, ?)

<!-- test: struct.init.ordered -->
3. If fields names are omitted, use the default constructor.

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

function main () {
  // ordered initialization using the default constructor
  // left type inferred
  var vec0 = v2(0, 0)

  // braced ordered initialization
  var v2 vec01 = {0, 0}
  var vec02 = v2{0, 0}

  var l1 = line {{0, 0}, {10, 10}}
  var l2 = line {start.x = 0, start.y = 0, end.x = 10, end.y = 10}
  var l3 = line {start = {x = 0, y = 0}, end = {x = 10, y = 10}}
  var l4 = line {start = {0, 0}, end = {10, 10}}

  // braced ordered initialization with default values
  var person01 = person { "John", "Doe" }
  #assert person01.address ==  person.address.default
  #assert person01.born    ==  person.born.default

  var person02 = person { "John", "Doe", default, 2011 }
  #assert person02.address ==  person.address.default
  #assert person02.born    ==  2011

  // braced named initialization
  // full
  var v2 vec03 = {x = 0, y = 0}
  // braced named initialization (partial)
  var v2 vec04 = {x = 0, 0}
  var v2 vec05 = {0, y = 0}

  // JSON-like
  var v2 vec05 = {"x": 0, "y": 0}
  var vec06 = v2 {"x": 0, "y": 0}
}
```

## Default destructor

*Semantics*

The default destructor is defined as a function that will free the memory owned by the struct.

*Constrains*

1. Destruction order is the same as the fields are defined.

2. Delete all memory owned by the `struct`

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

An object method is a function declared inside a `struct` body that.

A function can be used as an object method but no the other way, because the methods are namespaced.

*Constraints*

1. The compiler will add a new paramter to the left of type `ref<self>` and name `this`.

```language
type user = struct {
  string name
  function toString() {
    return "name = " + this.name
  }
}
function main() {
  var john = new user("John")
  user.toString.call(john)
  john.toString()
}
```

```language-compiled
type user = struct {
  string name
}
// once the method leave the struct body: self shall be replaced by "user"
function prefix_toString(ref<self> this) {
  return "name = " + this.name
}

function main() {
  var john = new user("John")
  prefix_toString(john)
  prefix_toString(john)
}
```

2. A function can be used as a method if the first parameters is a reference to the type or the compiler can `autocast`.

```language-semantic-error
function fn_by_copy (i8 a, i8 b) {
  // ...
}
function fn_by_reference (ref<i8> a, i8 b) {
  // ...
}
function fn_invalid_cast (array<i8> a, i8 b) {
  // ...
}

function fn_autocast_point (array<i8> a, i8 b) {
  // ...
}
type point = struct { float x; float y; }
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

```language-semantic-error
type point = struct {
  function add(ref<point> b) {
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

1. Extends a `struct` will prepend the extended structure, with the hidden fields.

So two structures won't always have the same size when they have the same fields.

```language
type a = struct { float a; }
type b = struct extends a { float b; }
type ab = struct { float b; float a; }

function main() {
  #assert b.size != ab.size
  #assert b.size > ab.size
}
```

1. A property in derived struct shall not collide with base struct properties or a semantic error shall raise:

> property redefinition '?:name' at '?:struct ?:file?:line?:column'

2. A method in derived struct shall not collide with base struct method unless
`overwrite`/`override` modifier is used.

2. 1. If parent struct has default constructor/destructor, child may have constructor/destructor.

2. 2. If parent struct has a constructor/destructor, child shall have a constructor/destructor or a semantic error shall raise

> Child constructor shall be defined as parent defined a constructor.

> Child destructor shall be defined as parent defined a destructor.

```language
type A = struct {
  int value
  new(int _value) {
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

  override new(int _value, int _value2) {
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

function main () {
  var v = B(101, 100)
  #assert v.value != 101
  #assert v.value2 != 100


  v.print() // call B.print
  cast<A>(v).print() // call A.print
  v.print2() // call B.print2
}
```

*Example*

Memory layout example

```language
type start = struct {
  i8 a
  i8 b
}
type middle = struct extends start {
  i8 c
  i8 d
}
type end = struct extends middle {
  i8 e
  i8 f
}

function main () {
  var ref<end> value = new(1,2,3,4,5,6)
  // first position of the struct is the position of the first field
  #assert @value == @(value.a)
  // TODO keep in mind type/allocator ?!
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
}
```

## `noalign` (No memory alignament)

*Semantics*

Remove default alignament (zero padding).

*Constraints*

1. Same as `c language`, struct shall be 100% compatible.

*Examples*

```language
// packed
type x = noalign struct { // also known as packed
  bool a
  bool b
  bool c
}

type x2 = struct { // default alignament
  bool a
  bool b
  bool c
}

function main () {
  #assert x.sizeof == 1
  #assert x.a.offset == 0
  #assert x.b.offset == 1
  #assert x.c.offset == 2

  #assert x2.sizeof == 3
  #assert x2.a.offset == 0
  #assert x2.b.offset == 8
  #assert x2.c.offset == 16
}
```

## `lean` (No type / No allocator)

*Semantics*

Remove rtti and allocator information from the `struct`
thus making it 100% c compatible

*Constraints*

1. `lean` structures shall be allocated with default allocator
or a semantic-error shall raise

> struct '?:struct_name' has lean modifier cannot be allocated with '?:allocator_name'

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

```language-semantic-error
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

function main () {
  var p = Player()
  p.y = 1 // hoisted property
  p.position.x = 1 // still valid

  // It only expose properties, not methods.
  p.add(Vector3(10,11,12)) // fail, add is not a member of Player.
  p.position.add(Vector3(10,11,12)) // ok
}
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

function main () {
  var dbtable t("xxx-xxx-xxx", "yyy")
  // assignament error
  t.id = "zzz-zzz-zzz" // semantic error: id field is readonly
  t.name = "zzz-zzz-zzz" // ok

  // write-method call error
  // semantic error: called a method that modify a readonly field.
  t.id.grow(10)

  // read-method call ok
  var string part = t.id.substr(1, 5) // works, as slice will create a new string
}
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

function main () {
  var a = new vetor(0, 1)
  var b = new vetor(1, 0)

  #assert a.distance(b) ~= 1.414213
  // equivalen to
  #assert distance(a, b) ~= 1.414213
}
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
type stack = struct {
  // ...
  size length
  alias count length
}
function main () {
  var s = stack()

  #assert @(s.length) == @(s.count)
}
```
<a name="own"></a>
## `own`

*Semantics*

The field will hold memory.

This implies that the memory shall be freed at destructor.

*Constraints*

1. Memory shall be freed at destructor implicitly.

*Example*

```language
type holder = struct {
  own ref<i8> value
}

function main() {
  var before = core.heap.allocated
  {
    var user
    var address
    {
      var iptr = new i8()
      iptr = 101
      user = new holder(iptr)
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
    v2.clear() // Propossals: base.clear() | override
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
    return ##__FUNCTION__# + "{" + this.x + ", " + this.y + "}"
  }
}

type v3 = struct extends v2 {
  float z

  overwrite function toString() string {
    return ##__FUNCTION__# + "{" + this.x + ", " + this.y + ", " + this.z + "}"
  }
}
```
