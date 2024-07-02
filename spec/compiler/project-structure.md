# Project structure

We have to distinguish two project types:

* `program`: whose final product is a binary or library
* `package`: whose final product is source code

Any project have three main components:

* Your code
* Core packages (language provided)
* User packages (community provided)

Any project start at: the `entry point file` which is the one that bootstrap
your code and configure the compiler.

> compiler build index.src app.exe

The file `index.src` it's the `entry point file`.

A `program` can have multiple entry points, for example: development and
production environments but a `package` shall have only one.

## `program` - `entry point file`

* Configure compiler. It's the only place you can use `#set`.
* Declare [global variables](..\language/variables.md#global-variables)
* `#import` dependencies with version
* Shall declare function `main`

  It's the first function to be executed, should create and destroy
  everything your program needs.

* Should declare function `test`

  It should test your program functionality.

  See [unit-testing](..\language/unit-testing.md)

Here is an example of an `entry point file`:

```language
#import core 1.0.0
#import requests 1.5.1

#set arch x64

#define REQUEST_ENGINE webrequest

global const VERSION = 0.0.0
global const VENDOR = "contoso"


function main() int {
  return 0
}
```

So in this example the compiler will fetch core and request dependencies,
set architecture to x64, declare a few globals and define main function

## `package`: `entry point`

* Declare [package variables](..\language/variables.md#package-variables)
* Import dependencies
* Declare the function `init`

