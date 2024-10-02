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
type_identifier
  : identifier ('<' dollarIdentifierList '>')?
  ;

primitive
  : 'i8' | 'i16' | 'i32' | 'i64' | 'u8' | 'u16' | 'u32' | 'u64' | 'f32' | 'f64' | 'float' | 'int' | 'size' | 'bool' | 'ptrdiff' | 'ptraddr' | 'void' | 'self' | 'any';

type
  : primitive
  | dollarIdentifier
  | identifier;

typeModifiers
  : 'lend'
  | 'own'
  | 'uninitialized'
  | 'readonly'
  ;

templateDefinitionList
  : '<' templateDefinition (',' templateDefinition)* '>'
  ;

// TODO semantic error if a tempalte is inside a template...
templateDefinition
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
  : typeModifiers* stringLiteral                                           # fixedStringType
  | typeModifiers* type '[' ']'                                            #       arrayType
  | templateTypeDef '?'?                                                   #   templatedType
  | typeModifiers* type '?'?                                               #      singleType
  ;

templateTypeDef
  : typeModifiers* type templateDefinitionList
  ;

typeExtendsDecl
  : 'extends' typeDefinition
  ;

typeImplementsDecl
  : 'implements' typeDefinition
  ;

typeDecl
  // aliasing existing type
  : 'type' type_identifier '=' 'struct' templateDefinitionList? (typeExtendsDecl | typeImplementsDecl)* '{' endOfStmt? structProperty* '}'     #    structTypeDecl
  | 'type' type_identifier '=' 'interface' (typeExtendsDecl)* '{' endOfStmt? interfaceProperty* '}'                    # interfaceTypeDecl
  | 'type' type_identifier '=' anonymousFunctionDef                                                                    #  functionTypeDecl
  | 'type' type_identifier '=' 'enum' primitive? '{' endOfStmt? enumeratorList? '}'                                    #      enumTypeDecl
  | 'type' type_identifier '=' 'mask' primitive? '{' endOfStmt? maskEnumeratorList? '}'                                #      maskTypeDecl
  | 'type' type_identifier '=' typeDefinition ('|' typeDefinition)+                                                    # aggregateTypeDecl
  | 'type' type_identifier '=' typeDefinition                                                                          #     aliasTypeDecl
  ;

// TODO do not repeat at parser level ?
structPropertyModifiers
  : 'hoist'
  | 'readonly'
  ;

functionModifiers
  : 'readonly'
  ;

structPropertyDecl
  // TODO anonymousFunction
  : (structPropertyModifiers)* typeDefinition identifier ('=' (constant | arrayConstantInitializer | structConstantInitializer))?
  // TODO REVIEW aliasing operator?
  | 'alias' identifier identifier
  | (functionModifiers)* functionDecl
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

enumerator
  : identifier ('=' logical_or_expr)?
  ;

enumeratorList
  : (enumerator endOfStmt)+
  | comments
  ;

maskEnumerator
  : identifier ('=' logical_or_expr)
  ;

maskEnumeratorList
  : (maskEnumerator endOfStmt)+
  | comments
  ;


structProperyInitializer
  // REVIEW json support is ok, '=' maybe the best as function arguments
  : identifier ('.' identifier)* ':' rhsExpr # namedStructProperyInitializer
  | rhsExpr                # orderStructProperyInitializer
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

/*
typeDefinition
  | 'function' '(' function_parameter_list? ')' type_ref             # function_type_decl
  | enum_type_decl                                                   # enum_type
  ;

*/
```

