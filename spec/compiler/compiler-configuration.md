# Compiler configuration

Unlike many language, compiler is configured inside the source code.

# `#set`

*syntax*

```syntax
preprocessor_set_statement
  : '#set' Identifier CCHAR_SEQUENCE
  ;
```

*semantics*

Sets a compiler property.

*constraints*

1. It's only available at `program` `entry point file`.

2. If the property starts with `compiler.` the property must exist and it will override it's value.

3. If a property is already set a compiler error shall raise.

> Trying to #set a configuration '?' already #set

*Example*

```language
#set arrays.out_of_bounds true
```

# `#get`

*syntax*

```syntax
preprocessor_get_expr
  : '#get' Identifier
  ;
```

*semantics*

Gets a property. It's value is always a string.

*constraints*

1. Property shall exists or a compiler error shall raise.


*Example*

```language
var x = #get arrays.out_of_bounds
```

# `#require`

*syntax*

```syntax
preprocessor_require_statement
  : '#require' Identifier CCHAR_SEQUENCE?
  ;
```

*semantics*

Enforce a property to be set or equal to a specific value

*constraints*

1. It's only available at `package` `entry point file`.

2. If the property doesn't match the value compiler shall raise a configuration error

> Configuration '?' is required

> Configuration '?' is required to be '?'


*Example*

Imagine you are developing a math library and you want the developer to choose beetween f32/f64 you can use.

```language
#require mathlib.float_type
```

This way the developer must `#set mathlib.float_type`
