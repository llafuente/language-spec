# strings

## Rune

The Rune represent a single character (possible multibyte) in a given enconding.

```
enum string_encoding {
  BIN
  ASCII,
  UTF_8,
  UTF_16,
  UTF_32,
  BASE64,
}

struct rune {
  size capacity;
  string_encoding encoding;
  range<u8> value;
}
rune.capactity = 7 // max character for utf8 is 6, one more for \0
rune.encoding
rune.value
```

<!--
TODO Study
Little endian / Big endian
https://en.wikipedia.org/wiki/Comparison_of_Unicode_encodings
-->

## String

Represent a list of characters.

```
struct string {
  size length // length in runes/characters
  size blength // bytes used
  size capacity
  encodings encoding
  ptr<u8> value
}
```

Operators
```
operator[](size position) rune {} // get
operator[](size position, rune) rune {} // assignament

operator+(string) {}
operator+(rune) {}
operator+(i8) {}
operator+(i16) {}
operator+(i32) {}
operator+(i64) {}
operator+(u8) {}
operator+(u16) {}
operator+(u32) {}
operator+(u64) {}
operator+(float) {}
operator+(double) {}
operator+(...) {}
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
