<!--

  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface
  https://peps.python.org/pep-3119/
-->
# interfaces

*Syntax*

```syntax
interfaceTypeDecl
  : 'interface' (typeExtendsDecl)* '{' endOfStmt? interfaceProperty* '}'
  ;

interfacePropertyDecl
  // TODO keep assignament ? it clash with the redefined one ?
  // TODO constrains to not initialize again ?
  : (structPropertyModifiers)* typeDefinition identifier ('=' (constant | arrayConstantInitializer | structConstantInitializer))?
  | propertyAlias
  | functionDef
  | memoryFunctionDef
  | operatorFunctionDef
  | structGetterDef
  | structSetterDef
  ;

interfaceProperty
  : interfacePropertyDecl endOfStmt
  | comments endOfStmt
  ;
```

*Semantics*

Interfaces defines contract a `struct` shall implement: properties, getter, setters and methods

*Remarks*

`implements` is not required to match an interface it just tells the compiler to report errors if something is missing.

*Constraints*

<!--
  Empty interface is used:
  * for generics in some languages
  * any type
  mostly is a hack
-->
1. Empty interface shall raise a semantic-error

> At least one property or method is required.

2. `interface` shall no contains aliases a syntax-error shall raise

<!-- CS0144 -->
3. instancing an interface shall raise a semantic-error

> Cannot create an instance of an interface '?:interface_name'

## implements (Explicit Interface Implementation)

*Semantics*

`implements` instructs the compiler the developer want to fulfill the `interface` so errors shall be reported if not fulfilled.

*Constraints*

1. To match an `interface` a `struct` shall defined all the members defined at the `interface`.

1. 1. Match field by name. The child shall have: a `field`, a `getter` and `setter`, or an `alias` with the same name or a semantic error shall raise:

> Missing field '?:interface_field_name' of type '?:interface_field_type' at struct '?:struct_name' that implements interface '?:interface_name'

```language-semantic-error
type iterator = interface {
  size length
}

type myarray = struct implements iterator {
}
```

1. 2. Match field by type, same rules as 1.1 for name now match the type aplying `self` and `any` rules.

> Expected type '?:interface_field_type' for field '?:interface_field_name' of type '?:struct_field_type' at struct '?:struct_name' that implements interface '?:interface_name'

```language-semantic-error
type iterator = interface {
  size length
}

type myarray = struct implements iterator {
  ref<size> length
}
```

1. 3. Match getter/setter by name. The child shall have: a field, a getter/setter or an `alias` with the same name or a semantic error shall raise:

> Missing getter '?:interface_getter_name' of type '?:interface_getter_type' at struct '?:struct_name' that implements interface '?:interface_name'

> Missing setter '?:interface_setter_name' of type '?:interface_setter_type' at struct '?:struct_name' that implements interface '?:interface_name'

1. 4. Match getters/setter by type, same rules as 1.3 for name now match the type aplying `self` and `any` rules.

> Expected type '?:interface_getter_type' for getter '?:interface_getter_name' of type '?:struct_field_type' at struct '?:struct_name' that implements interface '?:interface_name'

> Expected type '?:interface_getter_type' for setter '?:interface_setter_name' of type '?:struct_field_type' at struct '?:struct_name' that implements interface '?:interface_name'

1. 5. Match method by name

> Missing method '?:interface_method_name' of type '?:interface_method_type' at struct '?:struct_name' that implements interface '?:interface_name'

1. 6. Match method by type

> Expected type '?:interface_method_type' for method '?:interface_method_name' of type '?:struct_field_type' at struct '?:struct_name' that implements interface '?:interface_name'

*Examples*

Alias can be used to match interfaces

```language
type has_length = interface {
  get size length
  get size capacity
}

type xxx = struct implements has_length {
  size len
  size cap
  alias length len
  alias capacity cap
}
```

```language
type index_iterator<$t> = interface {
  size length
  operator [](size i) $t
}

type marray<$t> = struct implements index_iterator<$t> {
  size length = 0
  vector<$t> list

  operator [](size i) $t {
    return list[i]
  }
}
```



## Multiple interfaces

To compose multiple interfaces into one, just create a type with all interfaces and the desired operator.

```language
type printer = interface {
    function print()
}

type scanner = interface {
    function scan()
}

type Printer_AND_Scanner = Printer & Scanner
type Printer_OR_Scanner = Printer | Scanner
```
