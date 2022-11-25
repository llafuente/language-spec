# Project structure

A project have three main componentes:

* Your code
* Core libraries (language provided)
* User libraries (community provided)


Your code start in a specific file, what we call: `entry point file`,
that file is the one that start and configure compilation (no external tooling):

> compiler build index.src

This file is very special because its the only one that can:

* Configure compiler
* Declare global variables
* Import dependencies
* Declare the function `main`

Here is an example of an `entry point file`:

```
#import core 1.0.0
#import requests 1.5.1

#set target_machine x64

global const VERSION = 0.0.0
global const VENDOR = "contoso"


function main() int {

}
```

See this file the compiler will fetch those dependencies, set target binary as
64bits, declare a few globals and define main function.


# File structure

A normal file is structured so it has a minimal order.

* macros: import, definitions
* variable declaration: package variables, file varibles, etc.
* the rest: functions, types



## debug, release and test

index.src

```
import process
import debug main
import release main
import test test
```

main.src
```
function main() {
  print(process.arguments, file = process.stderr)
}
```

test.src
```
import assert

function main() {
  assert.ok(true == true, "true is true")
}
```


## import x.y.z

Import a file with the following patterns:

* ./x.y.z.src
* ./x/y.z.src
* ./x/y/z.src
* <core-path>/x/y/z/index.src
* <core-path>/x/y/z.src

## Import <debug|release|test> x.y.z

Import the file only if the build is in the right mode.
