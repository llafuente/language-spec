# Minimal code generation set

In order to simplify the compiler to it's very minimal core, we describe all
the functionality needed in this chapter.

We will target this set for every major functionality in the language.

## Branching

if / else if / else - branching, only boolean types. The compiler must cast
everything to bool or fail.

## Jump

goto - Inconditional jump.

## Type declaration

* i8,i16,i32,i64,u8,u16,u32,u64
* float, double
* pointer
* struct
  * composition of other types
  * vector at the end

All operator that affect the types above will be implemented as function calls
to the operator itself. The compiler will start with those operators defined and
ready to generate code to target machine.
That include `cast` and `unsafe_cast` that are considered operator in the
language.

## Function declaration / call.

The calling convention need to be c-like, but at the same time adopting varargs
it just mostly unacceptable because it will bind the language to libc
in a dangerous way, also most of the varargs are macros... that we shouldn't
mimic.

just need research...

## Functions

### libc.malloc

### libc.free

### deref

Dereference a pointer.
