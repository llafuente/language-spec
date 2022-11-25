# Type system

<!--
  https://en.wikipedia.org/wiki/Strong_and_weak_typing
-->

The language is `strongly typed`.

It's also `static typed` because a variable must have only one type
during it's life.
There is no runtime overhead for type safety everything it's check at compile
time.
There are some types that may require you to guard before use like
`tagged unions` to ensure type safety.

It also feature a `loosly type` when using `unsafe_cast`, it's obvious that
it's not recomended it here to support hard optimizations. But rememeber that
`unsafe_cast` bypass the type system completely.


Implicit conversion are disallowed if data precision will be lost.
That means casting from `i8` to `i16` it's allowed, the other way around is not.

Some types are immutables, that means that it's memory won't change after the
first initialization.

<!--
Most of the types start as Inmutables like
`static_array`, this array cannot grow. `static_string`
-->
