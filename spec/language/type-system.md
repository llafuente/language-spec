# Type system

<!--
  https://en.wikipedia.org/wiki/Strong_and_weak_typing
-->

This language is:

* `weakly typed`
* `static typed`

The language is `weakly typed` because it has `unsafe_cast` and pointer
arithmetic. Any of those techniques allow to see a value in different and
maybe erroneous ways. But it's the developer the one that need to allow it.
There is no implicit conversions that allow this behavior, everything
must be marked with `unsafe_cast`.

It's also `static typed` so types will be evaluated at compile time and a
variable shall have only one type during it's life.

There is no runtime overhead for type safety everything it's check at compile
time with the exception of:
* `tagged unions`, the compiler require to honor the
guard property every time before accessing any value.
* `variant` a variant a a pointer with its `typeid` and can be in fact anything

Implicit conversion are disallowed if data precision will be lost or data
corruption may occur.
That means casting from `i8` to `i16` it's allowed, the other way around is not.
Also signed to unsigned casting is disallowed.

Types are built in functionality layers from *inmmutable* (`readonly`) to
*static* (mutable but can't grow) to *dynamic*.
A good example is `string` or `array` types both has the three layers.

The language also exposes a heavy type introspection, `types information` at runtime.
And it also generate a fair amount of function to manipulate types.
See: [Types at runtime](./introspection.md)

A variable or a type can have a static values as it's type. This is how we
support `tagged unions`.

```language
type chair = struct {
  "chair" kind
}
type table = struct {
  "table" kind
}
type ikea = chair | table;
```

*Syntax*

```syntax
primitive
  : 'self' | 'any' | 'type'
  ;

typeModifiers
  : 'readonly'
  | 'lend'
  | 'own'
  | 'uninitialized'
  ;

type
  : typeModifiers* (primitive | dollarIdentifier | identifier)
  ;

templateDefinition
  : '<' templateParameter (',' templateParameter)* '>'
  ;

templateId
  : '<' templateArgument (',' templateArgument)* '>'
  ;

templateArgument
  : typeDefinition
  | dollarIdentifier
  ;

// TODO semantic error if a tempalte is inside a template...
templateParameter
  : typeDefinition ( templateIs | templateExtends | templateImplements )*
  ;

templateIs
  : 'is' (typeDefinition | 'struct' | 'enum' | 'mask' | 'function')
  ;

templateExtends
  : 'extends' (primitive | identifier | templateTypeDef)
  ;

templateImplements
  : 'implements' (identifier | templateTypeDef)
  ;

typeDefinitionList
  : typeDefinition (',' typeDefinition)*
  ;

typeDefinition
  : typeModifiers* typeLocator ('?')?
  ;

typeLocator
  // | type ('.' (identifier | 'type'))* templateId? ('[' argumentExprList? ']')? '?'?
  : typeLocator (
    '.' (typeLocator | 'type')
    | templateId
    | '[' argumentExprList? ']'
  )
  | primitive
  | stringLiteral
  | type
  | identifier
  | dollarIdentifier
  ;


templateTypeDef
  : type templateId
  ;

aggregateTypeAndDecl
    :   typeDefinition (('&' | 'and') aggregateTypeAndDecl)*
    ;

aggregateTypeOrDecl
    :   aggregateTypeAndDecl (('|' |'or') aggregateTypeOrDecl)*
    ;

aggregateTypeDecl
  : aggregateTypeOrDecl
  ;

aliasTypeDecl
  : typeDefinition
  ;

// types that support templates
templateTypeDecl
  : 'type' identifier templateDefinition? '=' (structTypeDecl | interfaceTypeDecl | anonymousFunctionDef | aggregateTypeDecl | aliasTypeDecl)
  ;

// types that DON'T support templates
primitiveTypeDecl
  : 'type' identifier '=' (enumTypeDecl | maskTypeDecl)
  ;

typeDecl
  : templateTypeDecl
  | primitiveTypeDecl
  ;
```

<a name="type"></a>
# type

*Semantics*

`type` is used for all type definitions.

*Remarks*

`function` will declare a function an also define the type with the same name.

*Constraints*

1. A type name shall be unique in any given scope or a semantic-error shall raise

> duplicated name '?:name' '?:file?:line?:column' used at '?:file?:line?:column'

```language-semantic-error
function point() {
  print("point!")
}

type point = struct {
  float x
  float y
}
```

```language-semantic-error
type point = struct {
  float x
  float y
}
type point = struct {
  float z
}
```

<!--
  cpp 11.4.2.1 The this pointer [class.this]
-->
<a name="this"></a>
# this

*Semantics*

In the body of an object method is a pointer to the object for which the function is called.

*Semantics*

1. It shall be used only inside a method.

<a name="self"></a>
# `self`

*Semantics*

`self` will match the current type.

*Rationale*

* Fast copy&paste code
* Refactoring makes less changes to VC, no need of complex IDEs.
* Covariant result types.

*Constrains*

1. `self` shall be only inside interface or struct or a semantic-error shall raise

> self shall be used only in interfaces or structs.

```language-semantic-error
type point = struct {
  float x
  float y

  function dotProduct(ref<self> a, ref<self> b) {
    // ok!
  }
}

// this is not allowed, because it's outside the type definition.
// the compiler don't know what self means in this context
function dotProduct(ref<self> a, ref<self> b) {
  // ko!
}
```

2. When checking if a type fulfill the interface `self` points to the current type.

*Example*

```language
type plus_able = interface {
  operator + (ref<self> other) self
}

type point = struct implements plus_able {
  float x
  float y

  // this will implement: plus_able.operator +
  operator + (ref<point> other) point {
    x += other.x
    y += other.y
    return this
  }
}
```

```language
type point = struct {
  float x
  float y

  function copyTo(ref<self> other) {
    other.x = this.x
    other.y = this.y
  }
}
```

<a name="any"></a>
# Type: any

*Semantics*

`any` will match any type except void.

*Constrains*

1. `any` shall be used only inside interface or a semantic-error shall raise

> any shall be used only in interfaces.

2. When checking if a type fulfill an interface `any` matches any type except void.

*Examples*

Any can be used to duck-typing

```language
type Duck = struct {
  function swim() {
    print("Duck swimming")
  }

  function fly() {
    print("Duck flying")
  }
}

type Whale  = struct {
  function swim() {
    print("Whale swimming")
  }
}

type canSwin = interface {
  function swim()
}

type canFly = interface {
  function swim()
}
function main() {
  loop animal in [Duck(), Whale()] {
    if (animal implements canSwin) {
      animal.swin()
    }
    if (animal implements canFly) {
      animal.fly()
    }
  }
}
```


# typeof

<!--
  javascript
  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
  java
    instance.getClass()
  go
    reflect.TypeOf(instance)
    downcast to empty interface -> func typeof(v interface{}) string { v.(type) }
  rust
    std::intrinsics::type_name
    std::any::type_name
-->

*Semantics*

Returns the type of a variable, type or template

*constraints*

1. If the type can be determined at compile time, the call is replaced by the type.

```language-test
type point = struct {
  float x
  float y
}

function print_type<$t>($t input) {
  print($t)
  print(typeof(input))
}

function main() {
  var i8 a = 0

  #assert(typeof(a) == i8)
  #assert(typeof(i8) == i8)

  var point p()
  #assert(typeof(p) == point)
  #assert(typeof(point) == point)

  var p2 = new point()
  #assert(typeof(p2) == ref<point>)


  print_type(a) // i8

  #assert(typeof(i8).max == i8.max)
  #assert(typeof(typeof(i8)).max == i8.max)

}

```

*implementation*

```language
function typeof<$t>($t a) type {
  return $t
}
```

# type operators

## is

*Semantics*

Tests if both sides has the same exact type.

*Example*

```language
type a = struct {
  int a
}
type b = struct extends a {
  int a
}

function main() {
  var i8 i = 0
  #assert(i is i8)

  // you can use typed directly
  #assert(a is a)
  #assert(b is b)
  #assert(!(a is b))
  #assert(!(b is a))

  var a a_instance()
  #assert(a_instance is a)
  #assert(!(a_instance is b))

  var b b_instance()
  #assert(!(b_instance is a))
  #assert(b_instance is b)
}
```


## instanceof (isinstance)

<!--
  javascript and java - instanceof
  * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
  python: isinstance(?)

  cpp
  * compile time: std::is_base_of<Base, T>::value;
  * runtime: dynamic_cast

  rust - no inheritance means no need.
-->

*Semantics*

Checks if an object or type is an instance given type or extends that `struct`.

*constraints*

1. If the types can be determined at compile time, the call is replaced by a true/false literal.

*Example*

```language
type a = struct {
  int a
}
type b = struct extends a {
  int a
}

function main() {
  var i8 i = 0
  #assert(i instanceof i8)

  // you can use typed directly
  #assert(a instanceof a)
  #assert(a instanceof b)

  var a a_instance()
  #assert(a_instance instanceof a)
  #assert(!(a_instance instanceof b))

  var b b_instance()
  #assert(b_instance instanceof a)
  #assert(b_instance instanceof b)
}
```

*implementation*

TODO

## implements

*Semantics*

Checks if an object or type is an implements given interface

*Example*

```language
type hasLengthProperty = interface {
  get size length
}

function main() {
  #assert(array implements hasLengthProperty)
}
```

*implementation*

TODO
