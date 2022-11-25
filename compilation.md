# Compilation

In this section we desribe each compilation stage and its order,
input and output.

Stages:
* Lexical Analysis
* Syntax Analysis
  * Parse
  * Preprocessor
* Semantic Analysis
  * Typing
  * Meta programming
* Code generation

As meta programing is allowed, the compiler will go up and down.

## Lexical Analysis

This phase scans the source code as a stream of characters and converts it
into meaningful lexemes/tokens.

input: string

output: token[]

The next phase is called the syntax analysis or parsing. It takes the token produced by lexical analysis as input and generates a parse tree (or syntax tree). In this phase, token arrangements are checked against the source code grammar, i.e. the parser checks if the expression made by the tokens is syntactically correct.

## Syntax Analysis

It takes a token list and generates a Abstract Syntax Tree (ast).

It has two phases, first parsing, in wich just creates the ast, then we expand
the macro we can and goes back a forth between both phases until all macros are
expanded.


## Semantic Analysis

It takes the ast and fill all the gaps for code generation. Mostly type checking.

## Code generation

Generate code and create the binary.

