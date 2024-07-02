# strings

## `rune`

The `rune` type represent a single character (possible multibyte) in a given encoding.

The type is equivalent to string, but:
* A rune is a string
* A string is *NOT* a rune

### Properties

#### capacity: size

Allocated bytes for value

#### value: ptr<u8>

Rune and null byte.

#### encoding: string_encoding

Reference: [Encoding](#encoding)

<!--
TODO Study
Little endian / Big endian
https://en.wikipedia.org/wiki/Comparison_of_Unicode_encodings
-->

## `string`

Represent a list of characters.

### Properties

#### length: size (alias: charLength)

Length in runes/characters

#### memLength: size

Length of the memory used, including null byte

#### capacity: size

Allocated bytes for value

#### value: ptr<u8>

Rune and null byte.

#### encoding: string_encoding

Reference: [Encoding](#encoding)

### Implementation

```
struct string {
  get size length() { return string_len(value, encoding); }
  alias chatLength length

  get size memLength { return string_len(value, string_encoding.asscii); }

  size capacity

  encodings encoding

  ptr<u8> value
  alias ptr<u16> value16 value
  alias ptr<u32> value32 value
}
```

Operators
```
operator[](size position) rune {} // get rune
operator[](size position, rune) rune {} // set rune (assignment)

// concat
operator+(string) string {}
operator+(rune) string {}
operator+(i8) string {}
operator+(i16) string {}
operator+(i32) string {}
operator+(i64) string {}
operator+(u8) string {}
operator+(u16) string {}
operator+(u32) string {}
operator+(u64) string {}
operator+(float) string {}
operator+(double) string {}
operator+(...) string {}
```


Declaration:

`double quote`: string with back-slash escape.

```language
var s1 = "hello world"
var s2 = "hello world I'm \"tony\""
```

`back tip`: string with interpolation back-slash escape.
```language
var s1 = `hello world`
var s2 = `${s1} I'm "tony"`
var num = 19
var s3 = `number to string: ${num.toString()}`
var s4 = `dollar sign must be escaped \$ and back tip too\``
```


## string_slice

<!-- https://en.cppreference.com/w/cpp/string/basic_string_view -->

A string slice points to a specific part of a `string`

### Properties

### size: size

### value: ptr<u8>

A pointer to the start of string

```
string str = "Hello world"
new string_slice slice(str, 1, 3)
print(slice) // stdout: ello
```

## Enconding

* BIN
* ASCII,
* UTF_8,
* UTF_16,
* UTF_32,
* BASE64,
