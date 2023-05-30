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

enum TypeKind {
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
  rune

  void
  // TODO add pointer-like
  enum
  struct
  function
  callable // this is a pointer to function, but we may need to declare at this level

  // honorable mentions
  // string is a struct
  // array is a struct
}

struct FieldType {
  string name
  TypeKind type
  // getter/setter has -1 offset
  i32 offset

  optional<variant> defaultValue

  optional<callable> getter
  optional<callable> setter
}

struct TemplateType {
  string name
  typeid type

  // TODO restrictions
}

struct MethodType {
  string name
  typeid type

  callable func

  function call(arguments args) variant {
    func()
  }
  alias invoke call
}

// TODO maybe Type should be an aggregated

struct Type {
  // type name inside the language
  string name
  // namespace / package / path
  string namespace
  // name in the binary
  get string binaryName {
    // null means the same as name
    return _binaryName != null ? _binaryName : name
  }
  optional<string>   _binaryName

  TypeKind type
  // sizeof
  i32 size

  // structs
  FieldType[] fields // structs only
  MethodType[] methods // structs only

  typeid aliasOf
  typeid extends // struct only

  // functions
  callable func
  alias arguments fields
  typeid returnType
  bool canThrow

  get isFunction() bool {
    return type == TypeKind.function
  }
  get isNumeric() bool {
    return type in TypeKind.i8 or TypeKind.i16 TypeKind.i32 or TypeKind.i64 or TypeKind.u8 or TypeKind.u16 or TypeKind.u32 or TypeKind.u64 or TypeKind.f32 or TypeKind.f64 or TypeKind.f128
  }
}


// this shall be populated by the compiler
global Type[] types
```

## rtti.get_type_by_name(string type_name): typeid

```language
struct ab {
  i32 a
  i32 b
}

// i8 it's the first declared type :)
#assert rtti.get_type_by_name("i8") == 0
#assert rtti.get_type_by_name("ab") != 0
```

## rtti.count_fields(typeid tid): i32
## rtti.count_arguments(typeid tid): i32

Returns how many fields / arguments the type has

```test

struct ab {
  i32 a
  i32 b
}

#assert rtti.count_fields(i32) == 2
```


## rtti.get_fields(typeid tid): FieldType[]
## rtti.get_arguments(typeid tid): FieldType[]

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

## rtti.size_of(typeid tid) i32

Returns the list of fields

*Example*

```test

struct ab {
  i32 a
  i32 b
}

#assert get_fields(i32) == null
#assert get_fields(ab) == ["a", "b"]
```
## rtti.instance_of(typeid a, typeid b) bool

Returns true if `a` is an instance of the given class `b`.

*Example*
```language
struct v2 {
  f32 x
  f32 y
}
#assert rtti.instance_of(v2, string) == false
#assert rtti.instance_of(string, string) == false

var vec = new v2
#assert rtti.instance_of(vec, v2) == false
```

## rtti.instance_of(variant a, typeid b) bool
## rtti.instance_of(typeif a, variant b) bool
## rtti.instance_of(variant a, variant b) bool
