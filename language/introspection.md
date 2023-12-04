# Introspection

<!--
  https://en.wikipedia.org/wiki/Type_introspection
-->

Introspection is the ability of a program to examine the type or fields of
an object at runtime.

Introspection is enabled by default, to disable:

```language
#set compiler.introspection false
```

Introspection will create a set of function for each type declared along an array
will all meta-data necessary.

## run-time type information (RTTI)

RTTI is a core package as described below. It's completed at compile time
with the information of your program types.

<!--
https://learn.microsoft.com/en-us/dotnet/api/system.type?view=net-7.0#properties
https://learn.microsoft.com/es-es/dotnet/api/system.reflection.fieldinfo?view=net-7.0
https://learn.microsoft.com/es-es/dotnet/api/system.reflection.membertypes?view=net-7.0
https://learn.microsoft.com/es-es/dotnet/api/system.reflection.parameterinfo?view=net-7.0#fields

https://docs.oracle.com/javase/8/docs/api/java/lang/Class.html
https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/Method.html
-->

```language
package rtti

enum type_primitives {
  i8
  i16
  i32
  i64
  u8
  u16
  u32
  u64
  f32
  f64
  f128

  // aliases but very special...
  int
  bool
  size
  ptrdiff
  address
  typeid
  // rune

  void
  ptr
  enum
  struct
  function
  callable // this is a pointer to function, but we may need to declare at this level

  // honorable mentions
  // rune is a struct
  // string is a struct
  // array is a struct
  // variant is a struct
}

struct type_field {
  string name
  type type
  // getter/setter has -1 offset
  i32 offset

  optional<variant> defaultValue

  optional<callable> getter
  optional<callable> setter
}

struct type_known_field<$struct_t, $field_t> extends struct_field_type {
  // TODO wonky syntax ?
  function (ptr<$struct_t> s) $field_t       get
  function (ptr<$struct_t> s, $field_t f)    set
}

struct type_template {
  string name
  typeid type

  // to what type do the Type is implemented
  resolutions array<type>
  // TODO restrictions
}

struct type_method {
  string name
  typeid type

  callable func

  function call(arguments args) variant {
    func.call(args)
  }
  alias invoke call
}

// TODO maybe Type should be an aggregated

struct type {
  // type name inside the language
  string name
  // namespace:xx
  // package: xx
  // file:/xx/xx
  string resolution

  optional<string>   _binaryName
  // name in the binary
  get string binaryName {
    // null means the same as name
    return _binaryName != null ? _binaryName : name
  }

  type_primitives type
  // sizeof
  i32 size

  // numbers
  bool signed

  // structs
  FieldType[] fields
  MethodType[] methods
  typeid extends

  typeid aliasOf

  // functions
  callable func
  alias arguments fields
  typeid return_type
  bool can_throw

  get isFunction() bool {
    return type == Primitives.function
  }
  get isNumeric() bool {
    return type in Primitives.i8 or Primitives.i16 Primitives.i32 or Primitives.i64 or Primitives.u8 or Primitives.u16 or Primitives.u32 or Primitives.u64 or Primitives.f32 or Primitives.f64 or Primitives.f128
  }
}


// this shall be populated by the compiler
global type[] types = []
```

## rtti.get_type_by_name(string type_name): typeid

```language
import rtti

struct ab {
  i32 a
  i32 b
}

// i8 it's the first declared type :)
#assert rtti.get_type_by_name("i8") == 0
#assert rtti.get_type_by_name("i8") == i8
#assert rtti.get_type_by_name("ab") != 0
#assert rtti.get_type_by_name("ab") != ab
```

## rtti.count_fields(typeid tid): i32
## rtti.count_arguments(typeid tid): i32

Returns how many fields / arguments the type has

```test
import rtti

struct ab {
  i32 a
  i32 b
}

#assert rtti.count_fields(i32) == 2
```

## rtti.get_fields(typeid tid): type_field[]
## rtti.get_arguments(typeid tid): type_field[]

Returns the list of fields / arguments the type has

*Example*

```test

struct ab {
  i32 a
  i32 b
}

#assert rtti.get_fields(i32) == null
#assert rtti.get_fields(ab) == ["a", "b"]
```

## rtti.get_methods_names(typeid tid) string[]

Returns the list of methods names

## rtti.get_method(typeid tid, string method_name) variant<callable>

Returns a callable with the method

## rtti.sizeof(typeid tid) i32

Returns the list of fields

*Example*

```test
import rtti

struct ab {
  i32 a
  i32 b
}

#assert rtti.sizeof(i32) == 8
#assert rtti.sizeof(i32) == i32.size
#assert rtti.sizeof(ab) == 16
```

## rtti.instance_of(typeid a, typeid b) bool

Returns true if `a` could be an instance of `b`.

*Example*
```language
struct v2 {
  f32 x
  f32 y
}
#assert rtti.instance_of(v2, string) == false
#assert rtti.instance_of(string, string) == true

var heap_vec = new v2(0, 0)
#assert rtti.instance_of(heap_vec, v2) == false
#assert rtti.instance_of(heap_vec, ref) == true

var stack_vec(0, 0)
#assert rtti.instance_of(stack_vec, v2) == true
#assert rtti.instance_of(stack_vec, ref) == false
```

## rtti.instance_of(variant a, typeid b) bool
## rtti.instance_of(typeif a, variant b) bool
## rtti.instance_of(variant a, variant b) bool
