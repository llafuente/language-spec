# Variables

A variables is the names that it's associated with a value in a computer program.

Here we list all type of variable the language offer.

<a name="global-variables"></a>
# global variables

Global variables are available to every file in the project, packages are not
part of your project so a package could not read your global variables.

They must be declared in the entry point file of your program.

Declaration:
```
global var xxx;
global const xxx;
```

<a name="package-variables"></a>
# package variables

A Package can export variables so the main program and other libraries will share
it's access.

Declaration is bound to the top of the file.

```
package var xxx;
package const xxx;
```
<a name="file-variables"></a>
# file variables

Any file can declare a variable at first level

```
var xxx;

function x() {
}
```

# scope variable

A scope variable will live from it's declaration until the close of the block,
unless is part of a lambda, in that case, it will live the same as the lambda.

```
function x() {
  var xxx;
}

function x() () string {
  var xxx = "hello";
  function r() string {
    return xxx
  }

  return r
}

```

# typed variable

Variable will take the type of the first assignament, you don't need to do it.
but could be usefull to enforce the type so future refactoring do not modify
the variable type.

```
function x() {
  var i8 xxx;
}
```

# magic variables

This variables are created by the compiler but it's not necessary to use or
declare. They will be avaiable in the related block.

For example
```
loop 5 {
  print("index = " + $index)
}
```
