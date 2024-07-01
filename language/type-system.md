# Type system

<!--
  https://en.wikipedia.org/wiki/Strong_and_weak_typing
-->

The language is `weakly typed` because it has `unsafe_cast` and pointer
arithmetic. Any of those techniques allow to see a value in different and
maybe erroneous ways. But it's the programmer the one that need to allow it.
There is no implicit conversions that allow this behavior, everything
must be marked with `unsafe_cast`.

It's also `static typed`, a variable must have only one type during it's life.

There is no runtime overhead for type safety everything it's check at compile
time with the exception of:
* `tagged unions`, the compiler require to honor the
guard property every time before accessing any value.
* `variant` a variant a a pointer with its `typeid`

Implicit conversion are disallowed if data precision will be lost or data
corruption may occur.
That means casting from `i8` to `i16` it's allowed, the other way around is not.
Also signed to unsigned, and the other way around, is disallowed and must
be explicit cast.

Some types are immutable, that means that it's memory won't change after the
first initialization. Those type creates a foundation to build those that can
be muted. A good example are: `istring` or `iarray`.

The language also exposes a heavy type introspection `types information` at runtime.
And it also generate a fair amount of function to manipulate types.
See: [Types at runtime](./introspection.md)

A variable or a type can have a static value as it's type. This is how we
support `tagged unions`.

```language
type chair = struct {
  "chair" type
}
type table = struct {
  "table" type
}
type ikea = chair | table;
```

<!--
Most of the types start as Inmutables like
`static_array`, this array cannot grow. `static_string`
-->

```syntax
type_identifier
  : identifier ('<' dollarIdentifierList '>')?
  ;

primitive
  : I8_TK | I16_TK | I32_TK | I64_TK | U8_TK | U16_TK | U32_TK | U64_TK | F32_TK | F64_TK | FLOAT_TK | INT_TK | SIZE_TK | BOOL_TK | PTRDIFF_TK | ADDRESS_TK | VOID_TK;

type
  : primitive
  | dollarIdentifier
  | identifier;

typeModifiers
  : 'lend'
  | 'own'
  | 'uninitialized'
  ;


// REVIEW typeDefinitionList ?
typeDefinition
  : typeModifiers* type '[' ']'                                       #     arrayType
  | typeModifiers* type '?'                                           #  nullableType
  | typeModifiers* type '<' typeDefinition (',' typeDefinition)* '>'  # templatedType
  | typeModifiers* type                                               #    singleType
  ;

typeDecl
  // aliasing existing type
  : 'type' type_identifier '=' 'struct' ('extends' typeDefinition)* '{' end_of_statement? structProperty* '}'             #    structTypeDecl
  | 'type' type_identifier '=' 'interface' ('extends' typeDefinition)* '{' end_of_statement? interfaceProperty* '}'       # interfaceTypeDecl
  | 'type' type_identifier '=' 'enum' '{' end_of_statement? enumeratorList? '}'                                           #      enumTypeDecl
  | 'type' type_identifier '=' (typeDefinition ('|' typeDefinition)+)                                                     # aggregateTypeDecl
  | 'type' type_identifier '=' typeDefinition                                                                             #     aliasTypeDecl
  ;

// TODO do not repeat at parser level ?
structPropertyModifiers
  : 'hoist'
  | 'readonly'
  | 'own'
  ;

structPropertyDecl
  // TODO anonymousFunction
  : (structPropertyModifiers)* typeDefinition identifier ('=' (constant | arrayConstantInitializer | structConstantInitializer))?
  // TODO REVIEW aliasing operator?
  | 'alias' identifier identifier
  | functionDecl
  | memoryFunctionDecl
  | operatorFunctionDecl
  | structGetterDecl
  | structSetterDecl
  ;

interfacePropertyDecl
  // TODO keep assignament ? it clash with the redefined one ?
  // TODO constrains to not initialize again ?
  : (structPropertyModifiers)* typeDefinition identifier ('=' (constant | arrayConstantInitializer | structConstantInitializer))?
  | 'alias' identifier identifier
  | functionDef
  | memoryFunctionDef
  | operatorFunctionDef
  | structGetterDef
  | structSetterDef
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
  : 'set' typeDefinition identifier
  ;

structProperty
  : structPropertyDecl end_of_statement
  | comments end_of_statement
  ;

interfaceProperty
  : interfacePropertyDecl end_of_statement
  | comments end_of_statement
  ;

enumerator
  //: identifier '=' conditional_expr
  : identifier
  ;

enumeratorList
  : (enumerator end_of_statement)+
  | comments
  ;

structProperyInitializer
  // REVIEW json support is ok, '=' maybe the best as function arguments
  : identifier ':' rhsExpr # namedStructProperyInitializer
  | rhsExpr                # orderStructProperyInitializer
  ;

structProperyInitializerList
  : structProperyInitializer (',' structProperyInitializer)*
  ;

structInitializer
  : '{' structProperyInitializerList? '}'
  ;

// TODO
structConstantInitializer
  : '{' structProperyInitializerList? '}'
  ;

/*
typeDefinition
  | 'function' '(' function_parameter_list? ')' type_ref             # function_type_decl
  | enum_type_decl                                                   # enum_type
  ;

*/
```

