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

2. 2. 1. Define constants (`#define`) and remove from AST

2. 2. 2. Expand all constants

2. 3. For each `import`.

2. 3. 1. If it's an external dependency (library), install desired version.

2. 3. 2. Start lexical Analysis at dependency entry point / file.

<a name="semantic-analysis"></a>
## Semantic Analysis

1. Type all implicit declarations and declaration to static values.

2. Infer Variable declarations.

2. 1. Variable shall take the type of the first assignment, but the size
shall be decided later.

2. 2. The compiler shall display a semantic error if the type for the first
assignment is unknown.

3. Substitute all possible templates.

We will back to this step until no templates left.

4. Expand metaprogramming.

The compiler shall execute step 1 for generated code but only once.

If the compiler reach this step twice for the same piece of code it shall raise an error.

Metaprogramming must not generate more metaprogramming.

5. Type checking.

Check all types match and try implicit conversions to do so.


<a name="code-generation"></a>
## Code generation

Generate code and create the library or binary.

