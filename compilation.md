# Compilation

In this section we desribe each compilation stage and its order,
input and output.

Stages:
* Lexical Analysis
* Syntax Analysis
  * Parse
  * Preprocessor
* Semantic Analysis
  * Implicit typing / Type inference / Generic programming
  * Meta programming
* Code generation

As meta programing is allowed, the compiler will go up and down.

## Lexical Analysis

1. Read file and convert it to a string.

2. Scans the source code string as a stream of characters and converts it
into meaningful lexemes/tokens.

2.1. Honor trigraphs.

3. The output for the next phase will be a list of tokens.


## Syntax Analysis

1. Takes a list of tokens and generates a Abstract Syntax Tree (AST).

2. Expand preprocessor, if possible (Metaprogramming can't be expanded at this point.)

2.1. Each macro can be expanded up to 5 times. If any preprocessing
token remains the compiler shall display a syntax error.


## Semantic Analysis

1. Type all implicit declarations and declaration to static values.

2. Infer varible declarations.

2.1. Variable will take the type of the first assignament.

2.2. The compiler will display a semantic error if the type for the first
assignament is unkown

3. Generate code for all functions/types templated.

The compiler shall execute step 1 for generated code.

4. Expand metaprogramming.

The compiler shall execute step 1 for generated code if required.

5. Type checking.


## Code generation

Generate code and create the binary.

