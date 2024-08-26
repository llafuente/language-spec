# Language

Here is part of the philosophy of the language, our principles.

Unlike Groucho Marx:

> "Those are my principles, and if you don't like them...
well, I have others"

We love ours :)

1. Syntax is very important. Be verbose and clear instead of require an eagle eye.

* Code must be `grep-able`. Everything should be easy to locate.
* One statement per line or use semicolon is optional but this rule not.

2. Developers generates code at compile time (meta-programming) rather that compiler.

3. Public functions can be overridden with your implementation. This enables fast
bug-fixing and adding features to libraries.

4. No toolchain: just the compiler:
Configuration, compilation, testing, code coverage, documentation generation,
package manager... are in fact: language features so the compiler handle it.

5. No runtime overhead if possible, use meta-programming over rtti.

6. Help developers trace their programs.

7. The language/spec shall be small enough, libraries... will see.

8. Develop ergonomics are very important

9. Operating system decople. Use as little as possible as a language.

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
