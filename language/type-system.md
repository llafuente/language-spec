# Type system

<!--
  https://en.wikipedia.org/wiki/Strong_and_weak_typing
-->

The language is `weakly typed` because it has `unsafe_cast` and pointer
arithmetic. Any of those techniques allow to see a value in different and
maybe erroneos ways. But it's the programmer the one that need to allow it.
There is implicit conversions that allow this behaviour, everything
must be marked with `unsafe_cast`.

It's also `static typed`, a variable must have only one type during it's life.

There is no runtime overhead for type safety everything it's check at compile
time with the exception of `tagged unions`, the compiler require to honor the
guard property everytime before accesing any value.

Implicit conversion are disallowed if data precision will be lost or data
corruption may occur.
That means casting from `i8` to `i16` it's allowed, the other way around is not.
Also signed to unsigned, and the other way around, is disallowed and must
be explicit cast.

Some types are immutables, that means that it's memory won't change after the
first initialization. Those type creates a fundation to build those that can
be muted. A good example are: `istring`, `iarray`.

The language expose `types information` at runtime.
And it also generete a fair amount of function to manipulate types.
See: [Types at runtime](./types-at-runtime.md)

A variable or a type can have a static value as it's type. This is how we
support `tagged unions`.

```
struct chair {
  "chair" type
}
struct table {
  "table" type
}
type ikea = chair | table;
```

<!--
Most of the types start as Inmutables like
`static_array`, this array cannot grow. `static_string`
-->
