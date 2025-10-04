# Language

# Specification:

## General

[Scope](spec/general/scope.md)

[Normative references](spec/general/normative-references.md)

[Glossary](spec/general/glossary.md)

[Conformance](spec/general/conformance.md)

## Compiler

[Compilation phases](spec/compiler/compilation-phases.md)

* Lexical Analysis
* Syntax Analysis
* Semantic Analysis
* Code generation

[The source file](spec/compiler/the-source-file.md)

* Structure (order)
* Character sets
* Trigraph sequences
* Multibyte characters

[Project structure](spec/compiler/project-structure.md)

[Configuration](spec/compiler/compiler-configuration.md)

* `#get`
* `#set`
* `#require`

<!--
-->

## Language

[Keywords](spec/keywords.md)

[Type system](spec/language/type-system.md)

* Primitives
  * [Numeric arithmetic](spec/language/types/numeric-arithmetic.md)
  * [Pointers](spec/language/types/pointers.md)
  * [Structured](spec/language/types/structured.md)
  * [Enumerated](spec/language/types/enumerated.md)
  * [Interface](spec/language/types/interface.md)

* Extended
  * [Array](spec/language/types/array.md)
  * [Strings](spec/language/types/strings.md)

[Identifiers](spec/language/identifiers.md)

[Literals](spec/language/literals.md)

[Variables](spec/language/variables.md)

[Functions](spec/language/functions.md)

[Statements and blocks](spec/language/statements-and-blocks.md)

[Control flow](spec/language/control-flow.md)

[Expressions](spec/language/expressions.md)

[Introspection](spec/language/introspection.md)

[Preprocessor and metaprogramming](spec/preprocessor-and-metaprogramming.md)

[Memory management](spec/memory-management.md)

[package system](spec/package-system.md)


<!--
[6. Statements](statements.md)

[4. Declarations](declarations.md)
-->

---

To build a toy compiler you can read:
* [Compilation process details](compilation.md)
* [Minimal code generator](minimal-code-generation-set.md)

Those documents define the compilation process and minimal code generation needed.
