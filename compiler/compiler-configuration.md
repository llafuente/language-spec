# Compiler configuration

Unlike many language, compiler is configured inside the source code.

# `#set`

*syntax*

```syntax
preprocessorSetStatement
  | '#set' identifier literal
```

*semantics*

Sets a property.

*constraints*

1. It's only available at `program` `entry point file`.

2. If the property starts with `compiler.` the property must exist.

3. If a property is already set a compiler error shall raise.

# `#get`

*syntax*

```syntax
preprocessorGetExpression
  | '#get' identifier
```

*semantics*

Gets a property. It's value is always a string.

*constraints*

1. Property shall exists or a compiler error shall raise.

# `#require`

*syntax*

```syntax
preprocessorRequireStatement
  | '#require' identifier literal
```

*semantics*

Enforce a property to be at a specific value

*constraints*

1. It's only available at `package` `entry point file`.



