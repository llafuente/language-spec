# Enumerated

## `enum`

*Semantics*

An enumeration consists of a set of named constants (enumerators) that represent
a value of a type. The type could be explicitly declared.


*Constraints*

1. An `enum` has three possible types:

* `const ptraddress`, a pointer to readonly-memory of the strings

* `const i32`, if any value is negative

* `const u32`, all values are positive

2. `enum` assignament shall ensure that only enumerators values are assigned.

This is not mandatory for `mask`.

This implies that if an `enum` has `ptraddress` shall not be assigned to a
non constant string.

User shall use: get_value_of

```language
type enconding = enum {
  BIN = "Binary"
  ASCII = "Ascii"
}
var enconding ienum = enconding.BIN
var dynamic_str = "Ascii"
ienum = enconding.get_value_of(dynamic_str)
```

And `i32`, `u32` enum shall not be assigned to a number.

```language
type bitmask = enum {
  b1 = 0x001
  b2 = 0x002
  b3 = 0x004
}

// it will fail
var bitmask bm = bitmask.b1 | bitmask.b2
// the same will wotk for mask type instead of enum
```

```language
type bitmask = mask {
  b1 = 0x001
  b2 = 0x002
  b3 = 0x004
}

// it will works
var bitmask bm = bitmask.b1 | bitmask.b2
```

4. If no values are defined, it will start at 0 and type will be `i32`.

5. If one value is defined, the rest shall be defined.

6. Enumerators shall be uppercased

7. Enumerators shall be "namespaced" with the `enum` name. Enumerators shall not
leak in global/file/package scope.


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

<!--
  https://en.wikipedia.org/wiki/Enumerated_type
-->
### Type properties

* `name` - constant string - The enumerated name.

* `length` - constant number - How many elements are defined

* `values` - constant &lt;ref&lt;string&gt;|number&gt;[] - Array with all the values

* `identifiers` - constant string[] - Array with all identifiers name

<!--
`type` - Type representation
-->

### Type methods

* `to_string()` - Dump the name

* `get_value_of(string)` - get the value of given string

* `is_valid(enum) bool` - Returns true if given value is one of the defined, false otherwise.

### Operators

```
operator [](size position) enum // It will return the value of the identifier at given position
```

## mask

*Semantics*

A `mask` is a special `enum` that allow assignment to any value.

*Constraints*

1. Same as enum removing assignment.

*Example*

```language
type open_file_flags = mask {
  WRITE = 0x00001000
  READ = 0x00000200
  APPEND = 0x00004000
  // ...
}
create_append = open_file_flags.WRITE | open_file_flags.APPEND
io.open_file("./xxx", create_append)
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


#macro declare_enum(#type enum_t, #list enumerators, #list enumerators_values) {

  type #enum_name# = struct {
    value = "xxx" | "yyy" | "zzz"

    #foreach k,v in enumerators_values
      static #enumerators[k]# = #v#
    #endforeach
    static length = ?
    static name = #enum_name#
    static values = [
      #foreach _,v in enumerators_values
        #v#,
      #endforeach
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
