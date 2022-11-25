# Language

Here is part of the pylosophy of the language.
Our core basics.

Configure the compiler is part of the language and not part of a toolchain.

Code must be `grepable`

Allow use to generate code at compile time.

Public function can be overriden with your implementation.

No toolchain. Compilation, testing, code coverage and documentation generation
is in fact the language.

One statement or expression per line, semicolon is optional but this rule not.

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
