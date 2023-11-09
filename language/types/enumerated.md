# Enumerated

*Semantics*

The enumerated type is a set of names (identifiers) that represent a value of
a type. The type could be explicitly declared.

*Constraints*

An `enum` has two types. `const ptr<const string>` or `i32`.

When comparing `const ptr<const string>` it will compare the address and no
the contents.

*Example*

```
type string_encoding_str = enum {
  BIN = "Binary"
  ASCII = "Ascii"
  UTF_8 = "UTF-8"
  UTF_16 = "UTF-16"
  UTF_32 = "UTF-32"
  BASE64 = "BASE64"
}

type string_encoding_str2 = enum {
  BIN = "Binary"
}

var s = string_encoding_str.BIN
string_encoding_str2 s2 = string_encoding_str2[0]

// this will result in a compiler error
// even when the final representation is the same the compiler won't allow it
if (s == s2) {

}
// but this will be allowed
// this is because both will be translated to "Binary" as string
if (string_encoding_str.BIN == string_encoding_str2.BIN) {

}
```

* NOTE: If no values is defined, it will start at 0 and type will be size.

* ERROR: If one value is defined, the rest must be defined.

* ERROR: Identifiers must be uppercased.

  REASON: This avoid collision with type properties.

<!--
  https://en.wikipedia.org/wiki/Enumerated_type
-->
## Properties

* `name` - constant string - The enumerated name.

* `length` - constant number - How many elements are defined

* `values` - constant &lt;string|number&gt;[] - Array with all the values

* `identifiers` - constant string[] - Array with all identifiers name

<!--
`type` - Type representation
-->

## Methods

* `toString()` - Dump the name

## Operators

```
operator [](size position) // It will return the value of the identifier at given position
```
