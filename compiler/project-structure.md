# Project structure

We have to distinguish two project types:

* `program`: whose final product is a binary or library
* `package`: whose final product is source code

Any project have three main componentes:

* Your code
* Core packages (language provided)
* User packages (community provided)

A project start at: `entry point file` wich is the one that bootstrap
and configure your `program` or `package`.

> compiler build index.src app.exe

`index.src` it's the entry point.

A program can have multiple entry points, for example: development and
production environments.

## `program`: entry point

* Configure compiler
* Declare [global variables](variables.md#global-variables)
* Import dependencies with version
* Shall declare function `main`

  It's the first function to be executed, should create and destroy
  everything your program needs.

* Should declare function `test`

  It should test your program functionality.

  See [unit-testing](unit-testing.md)

Here is an example of an `entry point file`:

```
#import core 1.0.0
#import requests 1.5.1

#set arch x64

global const VERSION = 0.0.0
global const VENDOR = "contoso"


function main() int {
  return 0
}
```

So in this example the compiler will fetch core and request dependencies,
set architecture to x64, declare a few globals and define main function

## `package`: `entry point`

* Declare [package variables](variables.md#package-variables)
* Import dependencies
* Declare the function `init`

