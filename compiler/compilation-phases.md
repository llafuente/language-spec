# Compilation phases

In this section we describe each compilation stage and its order,
input and output.

Phases:

* [Lexical Analysis](#lexical-analysis)
* [Syntax Analysis](#syntax-analysis)
  * Parse
  * Preprocessor
* Semantic Analysis
  * Implicit typing / Type inference / Generic programming
  * Meta programming
* Code generation

As meta programing is allowed, the compiler will go up and down.

<a name="lexical-analysis"></a>
## Lexical Analysis

1. Read file and convert it to a string.

2. Scans the source code string as a stream of characters and converts it
into meaningful lexemes/tokens.

2.1. Honor trigraphs.

3. The output for the next phase will be a list of tokens.

<a name="syntax-analysis"></a>
## Syntax Analysis

1. Takes a list of tokens and generates a Abstract Syntax Tree (AST).

2. Expand preprocessor, if possible (Metaprogramming can't be expanded at this point.)

2.1. Each macro shall be expanded up to 5 times. If any preprocessor
token remains the compiler shall display a syntax error.


## Semantic Analysis

1. Type all implicit declarations and declaration to static values.

2. Infer varible declarations.

2.1. Variable shall take the type of the first assignament, but the size
shall be decided later.

2.2. The compiler shall display a semantic error if the type for the first
assignament is unkown

3. Generate code for all functions/types templated.

The compiler shall execute again step 1 for generated code.

4. Expand metaprogramming.

The compiler shall execute step 1 for generated code.

If the compiler reach this step twice times it shall raise an error.

Metaprogramming must not generate more metaprogramming.

5. Type checking.

Check all types match and try implicit conversions to do so.


## Code generation

Generate code and create the library or binary.

