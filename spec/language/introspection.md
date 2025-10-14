# Introspection

<!--
  https://en.wikipedia.org/wiki/Type_introspection
  https://pkg.go.dev/reflect
-->

Introspection is the ability of a program to examine the type or fields of
an object at runtime.

Introspection is enabled by default, to disable:

```language
#set rtti = false
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

```language-package
package rtti

type primitives = enum  {
  void

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

  ptr
  enum
  struct
  interface
  function
  callable // this is a pointer to function, but we may need to declare at this level

  // honorable mentions
  // rune is a struct
  // string is a struct
  // array is a struct
  // variant is a struct
}

type annotation = struct {
  string name
  variant value
}

type struct_field = struct  {
  string name
  type type

  string documentation
  // getter/setter has -1 offset
  i32 offset
  size position

  variant? defaultValue
  callable? setter
  callable? getter


  annotation[]? annotations

  annotation? get_annotation(name) {
    if (this.annotations) {
      foreach v in annotations {
        if (v.name == name) return v
      }
    }

    return null
  }
/*
  function set (variant value) {
    var i8p = unsafe_cast<ptr<i8>>(this)
    type.set(i8p + size, value)
  }

  function variant get() {
    var i8p = unsafe_cast<ptr<i8>>(this)
    return type.get(i8p + size)
  }
*/
}

type known_struct_field = struct <$struct_t, $field_t> extends struct_field {
  function get (ref $struct_t s) $field_t {}
  function set (ref $struct_t s, $field_t f) {}
}

type type_template = struct {
  string name
  typeid type

  // to what type do the Type is implemented
  resolutions array<type>
  // TODO restrictions
}

type type_method = struct {
  string name
  typeid type

  callable func

  function call(arguments args) variant {
    func.call(args)
  }
  alias invoke call
}

// base for all types
type base_type = struct {
  // type name inside the language
  typeid id
  string name
}

// user declared types
type decl_type = struct extends base_type {
  // namespace:xx
  // package: xx
  // file:/xx/xx
  string location
  
  optional<string>   _binaryName
  // name in the binary
  get string binaryName {
    // null means the same as name
    return _binaryName ?: name
  }
}

type numeric_type = struct extends decl_type {
  i32 size
  bool signed
  primitives type
}

type struct_type = struct extends decl_type {  
  // sizeof
  i32 size


  // structs
  struct_field[] fields
  struct_method[] methods

  typeid[]? extends
  typeid[]? aliasOf
}

type function_parameter = struct extends {
  i32 position
  string name
  type type

  optional<variant> defaultValue
}

type function_type = struct extends decl_type {
  // pointer to the function
  callable func

  function_parameter parameters

  typeid return_type
  bool can_throw
}

// REVIEW enum type is under-review as type, because can be implemented using struct maybe we can remove it
type enumerator = struct {
  string name
  variant value
}

type enum_type = struct extends decl_type {
  enumerator[] enumerators
  get length {
    return this.enumerator.length
  }

  typeid underlying_type
}

type T = struct_type | enum_type | function_type | primitive_type {
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

```language-test
import rtti

type ab = struct {
  i32 a
  i32 b
}
test "rtti usage" {
  // i8 it's the first declared type :)
  #assert rtti.get_type_by_name("i8") == 0
  #assert rtti.get_type_by_name("i8") == i8
  #assert rtti.get_type_by_name("ab") != 0
  #assert rtti.get_type_by_name("ab") != ab
}
```

## rtti.count_fields(typeid tid): i32
## rtti.count_arguments(typeid tid): i32

Returns how many fields / arguments the type has

```language-test
import rtti

type ab = struct {
  i32 a
  i32 b
}
test ab {
  #assert ab.fields.length == 2
  #assert rtti.count_fields(ab) == 2

}
```

## rtti.get_fields(typeid tid): struct_field[]
## rtti.get_arguments(typeid tid): struct_field[]

Returns the list of fields / arguments the type has

*Example*

```language-test
type ab = struct {
  i32 a
  i32 b
}
test ab {
  #assert rtti.get_fields(i32) == null
  #assert rtti.get_fields(ab) == ["a", "b"]
}
```

## rtti.get_methods_names(typeid tid) string[]

Returns the list of methods names

## rtti.get_method(typeid tid, string method_name) variant<callable>

Returns a callable with the method

## rtti.sizeof(typeid tid) i32

Returns the list of fields

*Example*

```language-test
import rtti

type ab = struct {
  i32 a
  i32 b
}
test ab {
  #assert rtti.sizeof(i32) == 8
  #assert rtti.sizeof(i32) == i32.size
  #assert rtti.sizeof(ab) == 16
}
```

## rtti.instance_of(typeid a, typeid b) bool

Returns true if `a` could be an instance of `b`.

*Example*
```language
type v2 = struct {
  f32 x
  f32 y
}

type v = struct {
  f32 x
  f32 y
  f32 z
}

type vx = v2 | v3

test vx {
  // p2 and p3 will be a variant ?
  var vx p2 = new v2(0, 0)
  var vx p3 = new v3(0, 0, 0)

  #assert rtti.instance_of(vx, v2) == false
  #assert rtti.instance_of(vx, v3) == false

  #assert rtti.instance_of(v, string) == false
  #assert rtti.instance_of(string, string) == true

  var heap_vec = new v2(0, 0)
  #assert rtti.instance_of(heap_vec, v2) == false
  #assert rtti.instance_of(heap_vec, ref) == true

  var stack_vec = v2(0, 0)
  #assert rtti.instance_of(stack_vec, v2) == true
  #assert rtti.instance_of(stack_vec, ref) == false
}
```

## rtti.instance_of(variant a, typeid b) bool
## rtti.instance_of(typeif a, variant b) bool
## rtti.instance_of(variant a, variant b) bool
