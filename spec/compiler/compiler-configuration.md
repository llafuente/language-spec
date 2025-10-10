# Compiler configuration

Unlike many language, compiler is configured inside the source code.

# `#set`

*syntax*

```syntax
preprocessorSetStatement
  : '#' 'set' identifier ('.' identifier)* '=' constant
  ;
```

*Semantics*

Sets a compiler property.

*Constraints*

1. It's only available at `program` `entry point file`.

2. If the property starts with `compiler.` the property must exist and it will override it's value.

3. If a property is already set a compiler error shall raise.

> Trying to #set a configuration '?' already #set

*Example*

```language
#set arrays.out_of_bounds = true
```

# get configuration

*semantics*

Retrieves a value from compiler configuration.

Compiler configuration is available at compile time as constant.

*Example*

```todo-language
test "get configuration" {
  // x will be true or false at compile time.
  var x = arrays.out_of_bounds
}
```

# `#require`

*syntax*

```todo-syntax
preprocessor_require_statement
  : '#' 'require' identifier ('.' identifier)* (relational_operators | equality_operators) constant
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

```todo-language
#require mathlib.float_type == f32
```

This way the developer must `#set mathlib.float_type`
