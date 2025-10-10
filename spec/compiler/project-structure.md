# Project structure

We have to distinguish two project types:

* `program`: whose final product is a binary or library
* `package`: whose final product is source code

Any project have three main components:

* Your code
* Core packages (language provided)
* User packages (community provided)

Any project starts at: the `entry point file` which is the one that bootstrap
your code and configure the compiler.

> compiler build index.src app.exe

The file `index.src` it's the `entry point file`.

A `program` can have multiple entry points, for example: development and
production environments but a `package` shall have only one.

## `program`: `entry point`

A program output is a binary. The entry point is a single file.

In the program entry point you will:

* Configure the compiler. It's the only place you can use [`#set`](./compiler-configuration.md).
* Declare [global variables](../language/variables.md#global-variables)
* `import` dependencies with a specific version
* Shall declare function `main`, where the program starts.
  It's the first function to be executed, should create and destroy
  everything your program needs.
* Could declare tests. See [unit-testing](..\language/unit-testing.md)

Here is an example of an `program entry point`:

```language
import core "1.0.0"
import requests "1.5.1"

#set arch = x64
#set target = win32
#set requests.engine = "webrequest"

global const output = "Hellow world"

function main() int {
  print("Hellow world")
  return 0
}

test "Hellow world" {
  assert(output == "Hellow world")
}
```

So in this example the compiler will
* Fetch core and request dependencies with specific versisons
* Compile for windows x64
* Print hello world

## `package`: `entry point`

A package output is source code. Like the program, package entry point is a single file.

In the package entry point you will:

* Declare [package variables](../language/variables.md#package-variables)
* Import dependencies
* Declare the function `init`
  * Write here all initialization coded needed.
  * It will be executed at the program start, automatically.


*Example*

./main.src

```language
import core "1.0.0"
// this import doesn't require version because it's local
import greet

function main() int {
  print("Hello " + greet.who)
  return 0
}

```

./greet.src

```language-package
package greet

package var string who = null

function init() {
  who = "world"
}
```