# Enumerated

*Semantics*

The enumerated type is a set of names (identifiers) that represent a value of
a type. The type could be explicitly declared.


The underlying type is:
* for integers: uint32 or int32 depending of the presence of negative values
* for strings: ptraddres


*Constraints*

1. An `enum` has three possible types
* `const ptraddress`
* `const i32`
* `const u32`

Effectively all are integer, as ptradress is a number big enough to fit a pointer.

2. Enum comparison will be integer/ptraddress comparison.
string values should be stored in a readonly memory so we can assume no change.

3. Enum are struct of an aggregated type.

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

#assert(typeof string_encoding_str == string_encoding_str)
#assert(typeof string_encoding_str.BIN == string_encoding_str<istring>)
#assert(typeof string_encoding_str2 == string_encoding_str2)
#assert(typeof string_encoding_str2.BIN == string_encoding_str2<istring>)

var s1 = string_encoding_str.BIN
var s2 = string_encoding_str2[0]

// these will be valid
// because the compiler will ensure all strings are stored unique
#assert(s1 == s2)
#assert(string_encoding_str.BIN == string_encoding_str2.BIN)

// this is a compiler error
s1 = s2
```

* NOTE: If no values are defined, it will start at 0 and type will be size.

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

* `to_string()` - Dump the name

## Operators

```
operator [](size position) // It will return the value of the identifier at given position
```




# Proposal enum -> struct


```cpp
type string_encoding_str = enum {
  BIN = "Binary"
  ASCII = "Ascii"
  UTF_8 = "UTF-8"
  UTF_16 = "UTF-16"
  UTF_32 = "UTF-32"
  BASE64 = "BASE64"
}


#macro declare_enum(#type enum_t, #text enum_name) {

  type #enum_name# = struct {
    value = "xxx" | "yyy" | "zzz"

    #foreach_enumerator k,v in enum_t
      static #K# = #v#
    #endforeach
    static length = ?
    static name = #enum_name#
    static values = [
    ]
  }


  function operator[](#enum_name# e, string i): string_encoding_str2 {
  }

  function operator[](#enum_name# e, size i): string_encoding_str2 {
    #foreach_enumerator k,v in enum_t
      if (i == k) {
        return v
      }
    #endforeach
  }

  function operator.(#enum_name# e, string str): string_encoding_str2 {
    #foreach_enumerator k,v in enum_t
      if (str == v) {
        return v
      }
    #endforeach
  }
}
```
