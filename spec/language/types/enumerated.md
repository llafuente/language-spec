# Enumerated

## `enum`

*Syntax*

See: enumTypeDecl

*Semantics*

An enumeration consists of a set of named constants (enumerators) that represent
a value of a type.

*Constraints*

1. At least one enumerator shall be defined or a semantic-error shall raise

> At least one enumerator shall be defined

2. The underlying type is an integral type that can represent all the
enumerator values defined in the enumeration.

Valid types: `i32`, `u32`, `i64`, `u64`, `readonly ref string` (special case for strings)

If no integral type can represent all the enumerator values a semantic-error shall raise

> No integral value can represent all values defined at enum.

3. Two enumeration types are layout-compatible (explicitly `cast` allowed) if they have the
same underlying type.

4. Enumeration shall not be casted to any integral type implicitly.

4. `enum` assignament shall ensure that only enumerators values are assigned.

<!-- TODO STUDY: this is a nuisance! -->
This implies that if an `enum` has `ptraddress` shall not be assigned to a
non constant string.

User shall use: get_value_of

```language
type enconding = enum {
  BIN = "Binary"
  ASCII = "Ascii"
}
var ienum = enconding.BIN
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

4. default value will be underliying value default. `i32.default` / `u32.default` / `ref.default`

5. If one value is defined, the rest shall be defined.

5. If no value is defined it will start at 0, adding one to next enumerator.

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

#assert(typeof string_encoding_str == typeof string_encoding_str)
#assert(typeof string_encoding_str.BIN == typeof string_encoding_str.UTF_8)
#assert(typeof string_encoding_str.BIN == typeof string_encoding_str)

#assert(typeof string_encoding_str2 == typeof string_encoding_str2)
#assert(typeof string_encoding_str2.BIN == string_encoding_str2)

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



*Constraints*




## `mask`

*Syntax*

See: maskTypeDecl

*Semantics*

A `mask` is a special `enum` that allow assignment to any value.


*Constraints*

1. Same as `enum` removing assignment check.

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


# rtti: `enum` & `mask`

enum.operator[string]
enum.operator[number]


mask.operator[string]
mask.operator[number]
mask.add(number)
mask.remove(number)

---

# Proposal enum -> struct

```language
#macro enum_convert_to_struct(#text is_enum, #text enum_name, #list_text enumerator_names, #list_text enumerators_values) {

  #eval length enumerator_names.length
  type #enum_name# = struct {
    // TODO REVIEW last ?!
    value = #for value in enumerators_values { #value# | }

    #for k,v in enumerators_values {
      #eval name enumerator_names[k]
      static #name# = #v#
    }


    static length = #length#
    static name = ##enum_name#
    static values = [
      #for value in enumerators_values {
        #value#,
      }
    ]
  }


  function operator[](#enum_name# e, string i): #enum_name# {
    switch(i) {
      #for k,v in enumerators_values {
        case #v#:
          value = #v#
      }
    }
    // TODO
    // throw ?
    return this
  }

  function operator[](#enum_name# e, size i): #enum_name# {
    switch(i) {
      #for k,v in enumerators_values {
        case #k#:
          value = #v#
      }
    }
    // TODO
    // throw ?
    return this
  }

  function to_string() lend string {
    if (#is_enum#) {
      switch(value) {
        #for k,v in enumerators_values {
          #eval name enumerator_names[k]
          case #v#:
            return ##name#.clone()
        }
      }
    } else {
      var flags = new string
      #for k,v in enumerators_values {
        #eval name enumerator_names[k]
        if (value & #v# == #v#) {
          flags += ##name#
        }
      }
      // remove last comma
      if (flags.length) {
        flags[flags.length - 1] = '\0'
      }
    }
    return "unkown".clone()
  }

  // TODO copy bitmask operator when it's a mask

}

type string_encoding_str = enum {
  BIN = "Binary"
  ASCII = "Ascii"
  UTF_8 = "UTF-8"
  UTF_16 = "UTF-16"
  UTF_32 = "UTF-32"
  BASE64 = "BASE64"
}

#enum_convert_to_struct(true, string_encoding_str, [BIN, ASCII, UTF_8, UTF_16, UTF_32, BASE64], ["Binary","Ascii","UTF-8","UTF-16","UTF-32","BASE64"])

```