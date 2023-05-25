# Compilation phases

In this section we describe each compilation stage and its order,
input and output.

Phases:

* [Lexical Analysis](#lexical-analysis)
* [Syntax Analysis](#syntax-analysis)
  * Parse
  * Preprocessor
* [Semantic Analysis](#semantic-analysis)
  * Implicit typing / Type inference / Generic programming
  * Meta programming
* [Code generation](#code-generation)

As meta programing is allowed, the compiler will repeat some phases.

<a name="lexical-analysis"></a>
## Lexical Analysis

1. Read file and convert it to a string.

2. Scans the source code string as a stream of characters and converts it
into meaningful lexemes/tokens.

2. 1. Honor trigraphs.

3. The output for the next phase will be a list of tokens.

<a name="syntax-analysis"></a>
## Syntax Analysis

1. Takes a list of tokens and generates an Abstract Syntax Tree (AST).

2. Starting at root, traverse the AST

2. 1. Check AST is syntax valid.

2. 2. Preprocessor

2. 2. 1. For each `#Import`.

2. 2. 1. 1. If it's a dependency, install it to desired version.

2. 2. 1. 2. Start lexical Analysis at dependency entry point.

2. 2. 2. Expand up to 5 times the rest of preprocessor directives.

<a name="semantic-analysis"></a>
## Semantic Analysis

1. Type all implicit declarations and declaration to static values.

2. Infer varible declarations.

2. 1. Variable shall take the type of the first assignament, but the size
shall be decided later.

2. 2. The compiler shall display a semantic error if the type for the first
assignament is unkown.

3. Generate code for all functions/types templated.

The compiler shall execute again step 1 for generated code.

4. Expand metaprogramming.

The compiler shall execute step 1 for generated code but only once.

If the compiler reach this step twice it shall raise an error.

Metaprogramming must not generate more metaprogramming.

5. Type checking.

Check all types match and try implicit conversions to do so.


<a name="code-generation"></a>
## Code generation

Generate code and create the library or binary.

