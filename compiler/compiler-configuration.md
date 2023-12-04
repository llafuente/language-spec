# Compiler configuration

Unlike many language, compiler is configured inside the source code.

# `#set`

*syntax*

```syntax
preprocessor_set_statement
  : '#set' identifier literal
  ;
```

*semantics*

Sets a compiler property.

*constraints*

1. It's only available at `program` `entry point file`.

2. If the property starts with `compiler.` the property must exist.

3. If a property is already set a compiler error shall raise.

*Example*

```language
var x = #set arrays.out_of_bounds true
```

# `#get`

*syntax*

```syntax
preprocessor_get_expr
  : '#get' identifier
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
  : '#require' identifier literal
  ;
```

*semantics*

Enforce a property to be at a specific value

*constraints*

1. It's only available at `package` `entry point file`.

2. If the property don't match the value compiler shall raise a configuration error.


*Example*

This will enforce a library to be windows only.

```language
package io.win32

#require os win32
```
