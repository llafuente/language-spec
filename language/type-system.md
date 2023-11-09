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

The language also exposes a heavy type introspection` `types information` at runtime.
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
dollar_identifier
  : '$' Identifier
  ;

dollar_identifier_list
  : dollar_identifier (',' dollar_identifier)*
  ;

type_identifier
  : Identifier ('<' dollar_identifier_list '>')?
  ;


type_decl
  : 'type' type_identifier '=' type
  ;

type
  : 'function' '(' function_parameter_list ')' type       # function_type_decl
  | type '[]'                                             # array_type_decl
  | type '?'                                              # nullable_type_decl
  | type '<' dollar_identifier_list '>'                   # template_type_decl
  | struct_type_decl                                      # struct_type
  | type ('|' type)+                                      # aggregate_type_decl
  | Identifier                                            # identifier_type
  ;

/*
function_type_decl
  :
  ;
array_type_decl
  : type '[]'
  ;

nullable_type_decl
  : type '?'
  ;

template_type_decl
  : type '<' dollar_identifier_list '>'
  ;

aggregate_type_decl
  : type ('|' type)+
  ;
*/


property_modifiers
  : 'hoist'
  | 'readonly'
  | 'own'
  ;

struct_property_decl
  : (property_modifiers)* type Identifier ('=' (Constant | String_literal))?
  | 'alias' Identifier Identifier
  | 'get' type Identifier function_body
  | 'set' type Identifier function_body
  | function_decl
  ;

struct_property_list
  : end_of_statement* (struct_property_decl end_of_statement)+ end_of_statement*
  ;

struct_type_decl
  : 'struct' ('extends' Identifier)? ('align' DIGIT_SEQUENCE)? '{' struct_property_list '}'
  ;

```

