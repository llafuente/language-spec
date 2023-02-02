# Project structure

We have to distinguish two project types: main and packages.

Any project have three main componentes:

* Your code
* Core libraries (language provided)
* User libraries (community provided)

The code start in a specific file, what we call: `entry point file`,
that file is the one that bootstrap and configure your application:

> compiler build index.src app.exe

## Main `entry point file`

* Configure compiler
* Declare [global variables](variables.md#global-variables)
* Import dependencies
* Declare the function `main`
* Declare the function `test` (optional, only required for [unit-testing](unit-testing.md))

Here is an example of an `entry point file`:

```
#import core 1.0.0
#import requests 1.5.1

#set arch x64

global const VERSION = 0.0.0
global const VENDOR = "contoso"


function main() int {

}
```

So in this example the compiler will fetch those dependencies,
set arch to x64, declare a few globals and define main function

## Package `entry point file`

* Declare [package variables](variables.md#package-variables)
* Import dependencies
* Declare the function `init`


# Source file structure

The langauge enforce a minimal order in your file.

* Macro and metaprogramming first: `#import`, `#define`, `#macro`
* Type declaration
* High level variable declaration: [package variables](variables.md#package-variables), [file variables](variables.md#file-variables)
* functions
