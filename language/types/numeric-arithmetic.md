# Numeric / Arithmetic types

## Integers

| Signed integers | Unsigned integers |
| --------------- | ----------------- |
| i8              | u8                |
| i16             | u16               |
| i32             | u32               |
| i64             | u64               |

*Literals*

| Literal    | Type         | Value  |
| ---------- | ------------ | ------ |
| 1          | i8           | 1      |
| -1         | i8           | -1     |
| 512        | i16          | 512    |
| 123_123    | i32          | 123123 |

*Properties / fields*

<!--
  https://learn.microsoft.com/en-us/dotnet/api/system.int32?view=net-7.0#fields
-->
All numeric types has common properties to found the limits of each
representation.

> DEFAULT = 0

> MAX

> MIN

> BYTES

> BITS

Example:

```
  print(i8.MAX) // 128
  print(i8.MIN) // -127
  print(i8.BYTES) // 1
  print(i8.BITS) // 8
```


## Floating point
<!--
  https://learn.microsoft.com/en-us/dotnet/api/system.double?view=net-7.0#fields
  https://en.cppreference.com/w/c/language/arithmetic_types
  https://docs.julialang.org/en/v1/manual/integers-and-floating-point-numbers/
-->

| Type               | Aliases             |
| ------------------ | ------------------- |
| f32                | float, decimal32    |
| f64                | double, decimal64   |
| f128               | ldouble, decimal128 |

*Literals*

| Literal    | Type         | Value  |
| ---------- | ------------ | ------ |
| 1.0        | float        | 1.0    |
| .5         | float        | 0.5    |
| 1e10       | float        | 1.0e10 |
| 1.5e10     | float        | 1.5e10 |
| 1.5e10d    | double       | 1.5e10 |
| 4.7d       | double       | 4.7    |
| 4.7_5d     | double       | 4.75   |


*Properties / fields*

Floating points has the same properties as integers with new additions.

> DEFAULT = 0

> NaN

> INFINITY

> MINUS_INFINITY
> NEGATIVE_INFINITY

> MINUS_ZERO
> NEGATIVE_ZERO

> EPSILON
> Represents the smallest positive floating point value that is greater than zero.

> EQUAL_ENOUGH

> TAU
> PI
> E

Example:

```
print(float.NaN) // NaN
print(decimal64.INFINITY) // Infinity
print(double.MINUS_INFINITY) // -Infinity
print(float.bytes) // 4
```

## Hexadecimals, Octal and binary

* 0xff
* 0o777
* 0b01001010

## Other numbers

The language has some advanced types to handle very specific arithmetic,
like memory math.

We do not allow implicit downcasts and/or some operations are not allowed.

### `int`

Type that holds the fastest integer in the target platform.

### `bool`

It's an alias of `int` but it can only have two values: `true` and `false`.

### `size`

Type that represent the maximum size of things.

Like array length, capacity.

<!--
  https://en.cppreference.com/w/cpp/types/size_t
-->

### `ptrdiff`

Type that can store the difference of two pointers.

Note that ptrdiff it's not templated, the original types are lost as they are not
needed for math.

<!--
  https://en.cppreference.com/w/cpp/types/ptrdiff_t
-->

*Properties / fields*

> MAX

### `address`

It holds the value of the pointer address.

<!--
It needed because we auto-deref pointers
-->

```
int a = 0;
ref<int> b = &a;
print(b) // 0
print(cast<address>(b)) // 0x????????
```

### `void`

Type with an empty set of values.

Only allowed at:

* Function return value. Meaning no `return` statement is necessary.

<!-- TODO REVIEW

`void` has two meanings:

First, you don't care about the type, for example in templates you just want
to "talk" to the base struct.

Second you don't want to return anything in your functions.

We will expand the first case as it's complicated and could generate compiler
errors.

```
struct my_static_array<$t> {
  values $t[10] // this is the important part, this will be void
  size length // and void makes this invalid, because now the compiler cannot tell the offset
}

var array<i8> ar = new i8[10]
print(ar.length) // ok

var my_static_array<i8> msar = new i8[10]
print(msar.length) // ok

var array<void> void_ar = ar
print(ar.length) // ok
ar.push(void) // ko, void cannot be an argument, nothing is of type void
ar.pop() // ok, because it just operate with length
ar.grow(15) // ko, because you cannot new void type, as void does not have size
ar.swap(1, 2) // ko, because something of type void cannot be assigned

var my_static_array<void> = msar
print(msar.length) // KO, because it cannot determine offset

```
 -->

# Proposes

## bigint

Big numbers

## decimal<precision>

Decimal with fixed precision

## complex

Complex numbers
