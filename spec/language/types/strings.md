<!--

TODO Study
Little endian / Big endian -> is part of the enconding
https://en.wikipedia.org/wiki/Comparison_of_Unicode_encodings

rune.size = 5? -> include null byte? it's usefull ?

-->

# strings

## `rune`

The `rune` type represent a single character as Unicode code point (i32)

The type is equivalent to string, but:
* A rune is a string
* A string is *NOT* a rune

```language-test
type rune = struct {
  i32 codePoint
}

test rune {
  var r = rune("a")
  #assert r.codePoint == 64
}
```

## `string`

Represent a list of characters.

```language
type string_shape = interface {
  // Length in runes/characters
  get size length
  alias length chatLength

  // Allocated bytes for value
  get size capacity
  alias capacity memLength

  // Length of the memory used, including null byte
  get size memUsed

  // Reference: [Encoding](#encoding)
  encodings encoding

  // list of character and null byte.
  ptr<u8> value
  // alias ptr<u16> value16 value
  // alias ptr<u32> value32 value
}
```

Declaration:

`double quote`: string with back-slash escape.

```language
var s1 = "hello world"
var s2 = "hello world I'm \"tony\""
```

`back tip`: string with interpolation back-slash escape.
```todo-language
var s1 = `hello world`
var s2 = `${s1} I'm "tony"`
var num = 19
var s3 = `number to string: ${num.toString()}`
var s4 = `dollar sign must be escaped \$ and back tip too\``
```


## `string_slice`

<!-- https://en.cppreference.com/w/cpp/string/basic_string_view -->

A string slice points to a specific part of a `string`, a slice is not null terminated.

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
