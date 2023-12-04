# Language

Here is part of the philosophy of the language.
Our core basics.

Unlike Groucho Marx: "Those are my principles, and if you don't like them...
well, I have others" we love ours :)

Code must be `grep-able`

Allow use to generate code at compile time (meta-programming).

Public functions can be overridden with your implementation. This enables fast
bug-fixing and adding features to libraries.

No toolchain: just the compiler.
Configuration, compilation, testing, code coverage, documentation generation,
package manager... are in fact: language features so the compiler handle it.

One statement per line, semicolon is optional but this rule not.

No runtime overhead if possible, use meta-programming over rtti.

Help developers trace their programs.

<!--

`grepable`: This is a property of source code, it means that most of the
language statements should be easily located by a keyword or regex.
A good example is `cast` and `unsafe_cast`.

Two step macro system, before types and after types. This allows to generate
most of the structures of the language natively and keep the core to it's minimal.

Types as first class part of the language.
Types can be accessed by programs at runtime and compile time.

Code generation. The language is able to generate as part of the macro system
second step. That allow to use types to generate code. The compiler does some
magic for functions like `to_string`.

CamelCase and snake_case are the same. This is controversial, but people like to
write code in many ways, let them, we will handle the hard parts.

-->
