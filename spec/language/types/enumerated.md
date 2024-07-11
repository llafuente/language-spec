<!--

  https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum
  https://en.wikipedia.org/wiki/Enumerated_type

-->

# Enumerated (DRAFT 1)

## `enum`

*Syntax*

See: enumTypeDecl

*Semantics*

An enumeration consists of a set of named constants (enumerators) that represent
a value of a type.

*Constraints*

Constraints are defined at [`enum & mask constraints`](#enum-mask-constraints)


## `mask`

*Syntax*

See: maskTypeDecl

*Semantics*

A `mask` is a special `enum` that allow assignment to any value.

*Constraints*

Constraints are defined at [`enum & mask constraints`](#enum-mask-constraints)

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


<a name="enum-mask-constraints"></a>
*enum & mask constraints*

When the word: Enumeration is used refers to both `enum` and `mask`

1. No empty enumeration. At least one enumerator shall be defined or a semantic-error shall raise

> At least one enumerator shall be defined

2. The underlying type is defined as follow

* Numeric values: Integral big enough to fit all values: `i32`, `u32`, `i64`, `u64` 
* String values (`enum` only): `readonly ref string`

If no integral type can represent all enumerator values a semantic-error shall raise:

> No integral value can represent all enumerator values defined at enumerable '?'.

If string is used at `mask` a semantic-error shall raise:

> Invalid value type at enumerator '?'

```lanague-error
// shall not mix strings and integral
type e1 = enum {
  str = "hello",
  int = 100
}

type e2 = enum {
  a = -1,
  b = u64.max
}

```

3. Two enumeration types are layout-compatible (`unsafe_cast` allowed) if they have the
same underlying type.

4. The default value will be the value of the first enumerator.

5. Enumerators shall be "namespaced" with the `enum` name. Enumerators shall not
leak in global/file/package scope.

6. `enum` and `mask` shall define the folowing properties if `compiler.rtti` is enabled.


* `string $name` - The enumerated name.
* `size $length` - How many elements are defined
* `(i32|u32|i64|u64|ref string)[] $values` - Array with all the values
* `type $underlyingType` - Underlying type
* `string[] $enumerators` - Array with all identifiers name

Also the previous list are names forbidden to enumerator, if used a semantic-error shall raise

> Forbidden enumerator name is used: $name, $length, $values, $underlyingType, $enumerators.

<!-- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/expressions#12133-enumeration-logical-operators -->
7. If underlying type is an integral the `enum` or `mask` shall define the following operators:

8. 1. Logical operators

* operator &
* operator |
* operator ^

8. 2. Bitwise complement operator

* operator ~

8. 3. Forbidden in comparisson with other languages.

* operator +
* operator -
* operator ++
* operator --

All this operators may produce invalid values, so are forbidden because checking this at runtime make no sense.

<!-- https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/expressions#12126-enumeration-comparison-operators -->
9. `enum` and `mask` shall define the following comparison operators

* operator ==
* operator !=
* operator <
* operator >
* operator <=
* operator >=

10. `enum` and `mask` shall define the following assignment operators

* operator =

11. `mask` shall define the following assignament operators

* operator &=
* operator |=
* operator ^=

12. `mask` shall define the following methods

* bool match(? mask)
* bool has(i32 position)
* bool set(i32 position)
* bool unset(i32 position)

*Relaxable constraints*

1. (compiler.relax.enumerable_cast_enumerable) Two enumeration shall not be `cast`ed to each other regardless the underlying type.

2. (compiler.relax.enumerablt_cast_integral) Enumeration shall not be casted to any integral type implicitly.

*Safety constraints*

1. `enum` assignament (operator =) shall ensure that only enumerators values are assigned.

```language-error
type bitmask = enum {
  b1 = 0x001
  b2 = 0x002
  b3 = 0x004
}
// no math with enumerators
var bm = bitmask.b1 | bitmask.b2
// even if we know at compile time -> error
var bm2 = 0x004
// nothing at runtime?
var bm3 = 10 * stdin.read().i32()
```

<!-- why? check:  problems/refactoring -->
2. All values shall be defined.


<!---
Removed constraints
?. Enumerators shall be uppercased

this can be enforced via meta-programming.

-->


*Example*

```
type s_encoding = enum {
  BIN = "Binary"
  ASCII = "Ascii"
  UTF_8 = "UTF-8"
  UTF_16 = "UTF-16"
  UTF_32 = "UTF-32"
  BASE64 = "BASE64"
}

type s_encoding2 = enum {
  BIN = "Binary"
}
// enum type is only equal to itself
#assert(typeof s_encoding == typeof s_encoding)
#assert(typeof s_encoding2 == typeof s_encoding2)
#assert(typeof s_encoding != typeof s_encoding2)

// enumerator type are the same even from different enum when underlying type is the same!
#assert(typeof s_encoding.BIN == typeof s_encoding.UTF_8)
#assert(typeof s_encoding.BIN == typeof s_encoding2.BIN)

var s1 = s_encoding.BIN
var s2 = s_encoding2[0]

// REVIEW
// these will be valid
// because the compiler will ensure all strings are stored unique
// #assert(s1 == s2)

// string comparisson, so equal
#assert(s_encoding.BIN == s_encoding2.BIN)

// composing the string will result in the "same" as enumerator assignament
var string binary_label = "Binar"
binary_label += "y"
// they match, are equal
#assert(s_encoding.BIN == binary_label)
// no they aren't the same!
#assert(@s_encoding.BIN != @binary_label)

// call operator = and cannonize the assignament
s1 = binary_label
#assert(s_encoding.BIN == s1)
#assert(@s_encoding.BIN == @s1)

#assert(@binary_label != @s1)

// this is a compiler error
s1 = s2


type bitmask = mask {
  b1 = 0x001
  b2 = 0x002
  b3 = 0x004
}

// it will works
var bitmask bm = bitmask.b1 | bitmask.b2
```

## Implementation

The enumarated type is no more than syntactic sugar above struct.

```language
#macro enum_convert_to_struct(#text is_enum, #text enum_name, #text value_type, #list_text enumerator_names, #list_text enumerators_values) {

  #eval length enumerator_names.length

  type #enum_name# = struct {
    // TODO REVIEW last ?!
    #value_type# value = #for value in enumerators_values { #value# | }

    #for k,v in enumerators_values {
      #eval name enumerator_names[k]
      static #name# = #v#
    }

    // reflection / rtti
#if compiler.rtti {
    static size           $length = #length#
    static type           $underlyingType = #value_type#
    static string         $name = ##enum_name#
    static string[]       $enumerators = [
      #for value in enumerators_names {
        #value#,
      }
    ]
    static #value_type#[] $values = [
      #for value in enumerators_values {
        #value#,
      }
    ]
  }
}


  function operator = (#enum_name# e, string str): #enum_name# {
    switch(str) {
      #for k,v in enumerators_values {
        #eval name enumerator_names[k]
        case #v#:
          value = self.#name#
      }
      #if compiler.enum.unsafe_equality {
        default:
          value = str
      }
    }
    #if !compiler.enum.unsafe_equality {
      throw error("#enum_name# equality inconsistency. try to assign value = " + str)
    }

    return this
  }

  function operator[](#enum_name# e, size i): #enum_name# {
    switch(i) {
      #for k,v in enumerators_values {
        #eval name enumerator_names[k]
        case #k#:
          return self.#name#
      }
      
    }
    
    throw error("#enum_name# out of range. index sent = " + i)
  }

#if value_type is numeric {
  // https://learn.microsoft.com/en-us/dotnet/api/system.enum.hasflag?view=net-8.0&redirectedfrom=MSDN#System_Enum_HasFlag_System_Enum_
  // alias names? has / has_flag?
  function match(#value_type# mask) bool {
    return (value & mask) == mask
  }

  function has(i32 position) bool {
    return (value & (1 << position)) != 0
  }

  function set(i32 position) #enum_name# {
    value |= 1 << position
    return this
  }

  function unset(i32 position) #enum_name# {
    value &= ~(1 << position)
    return this
  }
}

  // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/enums#196-enum-values-and-operations

  // Enumeration logical operators only for integral
#if value_type is numeric {
  operator &(#enum_name# x, #enum_name# y) #enum_name# {
    return value & other.value
  }
  operator |(#enum_name# x, #enum_name# y) #enum_name# {
    return value | other.value
  }
  operator ^(#enum_name# x, #enum_name# y) #enum_name# {
    return value ^ other.value
  }
}


  operator == (#enum_name# other) bool {
    return value == other.value
  }
  
  operator != (#enum_name# other) bool {
    return value != other.value
  }
  
  operator < (#enum_name# other) bool {
    return value < other.value
  }

  operator > (#enum_name# other) bool {
    return value > other.value
  }

  operator <= (#enum_name# other) bool {
    return value <= other.value
  }

  operator >= (#enum_name# other) bool {
    return value >= other.value
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

type s_encoding = enum {
  BIN = "Binary"
  ASCII = "Ascii"
  UTF_8 = "UTF-8"
  UTF_16 = "UTF-16"
  UTF_32 = "UTF-32"
  BASE64 = "BASE64"
}

#enum_convert_to_struct(true, s_encoding, i32, [BIN, ASCII, UTF_8, UTF_16, UTF_32, BASE64], ["Binary","Ascii","UTF-8","UTF-16","UTF-32","BASE64"])

```
