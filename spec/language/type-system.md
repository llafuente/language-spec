# Type system

<!--
  https://en.wikipedia.org/wiki/Strong_and_weak_typing
-->

This language is:

* `weakly typed`
* `static typed`

The language is `weakly typed` because it has `unsafe_cast` and pointer
arithmetic. Any of those techniques allow to see a value in different and
maybe erroneous ways. But it's the programmer the one that need to allow it.
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

Some types are immutable (readonly), that means that it's memory won't change after the
first initialization. Those type creates a foundation to build those that can
be muted. A good example are: `istring` or `iarray`.

The language also exposes a heavy type introspection `types information` at runtime.
And it also generate a fair amount of function to manipulate types.
See: [Types at runtime](./introspection.md)

A variable or a type can have a static value as it's type. This is how we
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

<!--
Most of the types start as Inmutables like
`static_array`, this array cannot grow. `static_string`
-->

```syntax
primitive
  : 'i8' | 'i16' | 'i32' | 'i64' | 'u8' | 'u16' | 'u32' | 'u64' | 'f32' | 'f64' | 'float' | 'int' | 'size' | 'bool' | 'ptrdiff' | 'ptraddr' | 'void' | 'self' | 'any';

typeModifiers
  : 'readonly'
  ;

type
  : typeModifiers? (primitive | dollarIdentifier | identifier);

functionParametersTypeModifiers
  : 'lend'
  | 'own'
  | 'uninitialized' // why ? <-- real usage ?
  | 'autocast'
  | 'out'
  ;

functionReturnTypeModifiers
  : 'lend'
  | 'own'
  | 'uninitialized'
  ;

templateDefinition
  : '<' templateParameter (',' templateParameter)* '>'
  ;

templateId
  : '<' templateArgument (',' templateArgument)* '>'
  ;

templateArgument
  : typeDefinition
  ;

// TODO semantic error if a tempalte is inside a template...
templateParameter
  : typeDefinition ( templateIs | templateExtends | templateImplements )*
  ;

templateIs
  : 'is' (typeDefinition | 'struct' | 'enum')
  ;

templateExtends
  : 'extends' (primitive | identifier | templateTypeDef)
  ;

templateImplements
  : 'implements' (identifier | templateTypeDef)
  ;

// REVIEW typeDefinitionList ?
typeDefinition
  : stringLiteral                                           # fixedStringType
  | templateTypeDef '?'?                                    #   templatedType
  | type '[' ']'                                            #       arrayType
  | type ('.' identifier)* '?'?                             #      singleType
  ;

templateTypeDef
  : type templateId
  ;

typeExtendsDecl
  : 'extends' typeDefinition
  ;

typeImplementsDecl
  : 'implements' typeDefinition
  ;

structTypeDecl
  : ('noalign' | 'lean')* 'struct' (typeExtendsDecl | typeImplementsDecl)* '{' endOfStmt? structProperty* '}'
  ;

interfaceTypeDecl
  : 'interface' (typeExtendsDecl)* '{' endOfStmt? interfaceProperty* '}'
  ;

aggregateTypeDecl
  : typeDefinition ('|' typeDefinition)+
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

// TODO do not repeat at parser level ?
structPropertyModifiers
  : 'own'
  | 'hoist'
  | 'readonly'
  ;

structPropertyDecl
  // TODO anonymousFunction
  : (structPropertyModifiers)* typeDefinition identifier ('=' (constant | arrayConstantInitializer | structConstantInitializer))?
  // TODO REVIEW aliasing operator?
  | propertyAlias
  // Notice: do not support anonymous function
  | functionDef functionBody
  | memoryFunctionDecl
  | operatorFunctionDecl
  | structGetterDecl
  | structSetterDecl
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

structProperty
  : structPropertyDecl endOfStmt
  | comments endOfStmt
  ;

interfaceProperty
  : interfacePropertyDecl endOfStmt
  | comments endOfStmt
  ;

structProperyInitializer
  // REVIEW json support is ok, '=' maybe the best as function arguments
  : identifier ('.' identifier)* ':' rhsExpr       # namedStructProperyInitializer
  | rhsExpr                                        # orderStructProperyInitializer
  ;

structProperyInitializerList
  : structProperyInitializer (',' structProperyInitializer)*
  ;

structInitializer
  : typeDefinition '{' structProperyInitializerList? '}' # implicitStructInitializer
  | '{' structProperyInitializerList? '}'                # inferenceStructInitializer
  ;

// TODO
structConstantInitializer
  : '{' structProperyInitializerList? '}'
  ;
```

