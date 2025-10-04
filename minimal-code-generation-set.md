# Minimal code generation set

In order to simplify the compiler to it's very minimal core, we describe all
the functionality needed to implement in this chapter.

As we suspect the compiler target will be LLVM we will provide an IR file with
all operations for types.


## Branching

if / else if / else - branching, only boolean types. The compiler must cast
everything to bool or fail.

## Jump

goto - Inconditional jump.

## Type declaration

Basically numeric/arthimetic, pointers and struct.

* positive numbers: i8,i16,i32,i64
* negative numbers: u8,u16,u32,u64
* floating numbers: float, double
* pointer
* struct
  * declaration of types inside
  * vector at the end

All operations that can be performed shall be functions with `always_inline`.
So the compiler don't need to understand the nitpicking staff of each just how to
generate the proper function call.

Casting (`cast`, `unsafe_cast`) can also be a function for the compiler like in user land.

## Function declaration / call.

The calling convention need to be c-like to be friendly with the ecosystem and also to be able to
call c without `foreign function interface`. Also as our type system is compatible (mostly)
passing any arguments is not a problem unless you need varargs wich implementation is left as
`if you need it`.

