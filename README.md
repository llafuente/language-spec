# Language

# Specification:

## General

[Scope](general/scope.md)

[Normative references](general/normative-references.md)

[Glossary](general/glossary.md)

[Conformance](general/conformance.md)

## Compiler

[Compilation phases](compiler/compilation-phases.md)

* Lexical Analysis
* Syntax Analysis
* Semantic Analysis
* Code generation

[The source file](compiler/the-source-file.md)

* Structure (order)
* Character sets
* Trigraph sequences
* Multibyte characters

[Project structure](compiler/project-structure.md)

[Configuration](compiler/compiler-configuration.md)

* `#get`
* `#set`
* `#require`

<!--
-->

## Language

[Type system](language/type-system.md)

* Primitives
  * [Numeric arithmetic](language/types/numeric-arithmetic.md)
  * [Pointers](language/types/pointers.md)
  * [Structured](language/types/structured.md)
  * [Enumerated](language/types/enumerated.md)
  * [Interface](language/types/interface.md)

* Extended
  * [Array](language/types/array.md)
  * [Strings](language/types/strings.md)

[Identifiers](language/identifiers.md)

[Literals](language/literals.md)

[Variables](language/variables.md)

[Functions](language/functions.md)

[Statements and blocks](language/statements-and-blocks.md)

[Control flow](language/control-flow.md)

[Expressions](language/expressions.md)

[Introspection](language/introspection.md)

[Preprocessor and metaprogramming](preprocessor-and-metaprogramming.md)

[Memory management](memory-management.md)

<!--
[6. Statements](statements.md)

[4. Declarations](declarations.md)
-->

---

To build a toy compiler you can read:
* [Compilation process details](compilation.md)
* [Minimal code generator](minimal-code-generation-set.md)

Those documents define the compilation process and minimal code generation needed.
