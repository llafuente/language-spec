<!--
TODO review c - 6.9.2 External object definitions
-->

# Variables

*Semantics*

1. A variables is the name that it's associated with a value in a computer program.

2. A variable can be:

* `var`: *Mutable*, variable can be modified itself and it's memory.
* `const`: *No-assignable*: Memory can be modified, the variable itself shall not be. (aka single assignment variables)
* `readonly`: *Inmutable*: Do not allow any modifications to it's memory `readonly`.

*Example*

```language-semantic-error
type point = struct {
  float x
  float y

  function reset() {
    x = 0
    y = 0
  }
}

function main() {

  // var can be assign, re-assign and modified
  var p1 = new point(0, 0)
  p1 = new point(1, 1)
  p1.x = 10
  p2.y = 10

  // const can be assign and modified but not re-assign
  const p2 = new point(0, 0)
  p2 = new point(1, 1) // <<- semantic error
  p2.x = 10
  p2.y = 10

  // readonly can be assign not modified and not re-assign
  readonly p3 = new point(0, 0)

  p3 = new point(1, 1) // <<- semantic error
  p3.x = 10 // <-- semantic error
  p3.reset() // <-- semantic error
}
```

3. The scope of a variable tells the compiler the life cycle of the variable. There are two scopes:

* *program scope*. `global`, `package` and `file` variables scope start when the program start and it will be freed when program exit gracefully.
* *block scope*. A variable start at the point of its declaration and ends at the end of its block.

*Constraints*

1. A variable can't be shadowed or redefined or a semantic-error shall raise

> variable redefition '?' at '?'

2. `const`variable cant be re-assigned or a semantic-error shall raise

> '?' cannot be reassign, is const

3. `readonly`variable cant be re-assigned or a semantic-error shall raise

> '?' cannot be reassign, is readonly

4. `readonly`variable cant be modified or a semantic-error shall raise

> '?' cannot be modified, is readonly


<a name="global-variables"></a>
## global variables

*syntax*

```syntax
globalVariableDeclStmt
  // infer variable with initialization
  : 'global' fileVariableDeclStmt
  ;
```

*Semantics*

1. Global variables are available to every file in main project

*Remarks*: `packages` are not part of your project so a package could not
read your global variables.

*Constraints*

1. Global variables shall not be declared outside your program `entry file`

2. A global variable that is not assigned shall have a type.

3. The identifier shall no be uppercased, that reserved to defines or a syntax-error shall raise

> Unexpected uppercased identifier, that's reserved to meta-programming.

4. Global variables are initialized before main program starts. In order of appeareance.

<a name="package-variables"></a>
## package variables

*Syntax*

```syntax
packageVariableDeclStmt
  // infer variable with initialization
  : 'package' fileVariableDeclStmt
  ;
```

*Semantics*

1. `package` variables are available to every file that `import`s the library.

*Constraints*

1. File variables shall not be used outside the current file.


<a name="file-variables"></a>
## file variables

*Syntax*

```syntax
// infer variable declaration w/out initialization
inferVariableDeclStmt
  : ('var' | 'const' | 'readonly') identifier ('=' rhsExpr)?
  ;

// typed variable declaration and initialization
typedVariableDeclStmt
  : ('var' | 'const' | 'readonly') typeDefinition identifier ('(' argumentExprList? ')' | '=' rhsExpr)?
  ;

fileVariableDeclStmt
  : inferVariableDeclStmt
  | typedVariableDeclStmt
  ;
```

*Semantics*

Variable declared at file level will be available to all function within
the file.

*Constraints*

1. Initialized variables go to executable DATA segment.

2. Uninitialized variables go to executable BSS segment.



Example:

```language
var ten = 10
```

## block scope variable

*Syntax*

```syntax
blockVariableDeclStmt
  : fileVariableDeclStmt
  // infer variable with first initialization
  | 'var' identifier ('=' rhsExpr)?
  ;
```

*Semantics*

A block variable will live until the end of the current block.

*Constraints*


*Example*

```language
type a = struct {
  new() {
    print("a constructor called")
  }
  delete() {
    print("a destructor called")
  }
}

function simple_test() {
  print("function called")

  var aptr = new a()
} // <-- aptr freed here

function main() {
  print("program starts")
  simple_test()
  print("program ends")
}
```

```output
program starts
function called
a constructor called
a destructor called
program ends
```

<!-- REVIEW this example collide with new lambda spec -->
*Example*

```language
type a = struct {
  new() {
    print("constructor")
  }
  delete() {
    print("destructor")
  }
}

type callback = function () lend string

function do_your_job() callback {
  var aptr = new a()

  function r() lend a {
    print("lambda start and return")
    return aptr
  }

  return r
}

function main() {
  print("start")
  var t = do_your_job()
  print("job started")
  print(t())
  print("lambda finished")
  delete t
  print("end")
}
```

```output
start
constructor
lambda start and return
lambda finished
destructor
end
```


# Type and inference

*Semantics*

1. Any named variable (global, package, file, block, function parameters...)
shall have a type at compile time.

2. That type can be explicit (developer choose a type) or implicit (the compiler does) aka
type inference.

*Constrains*

1. If type is explicit, that type will be used.

2. If type need to be infered the following rules shall be follow.

2. 1. Type will be infered from the first assignament.

2. 2. It will choose the greater (signed) type possible.

```language-test
function main() {
  var i = 10
  #assert type(i) == i64

  var f = 10.0
  #assert type(f) == f64
}
```

2. 3. All return statements inside a function shall have the exact same type.

> multiple return types found

```language-semantic-error
function x(int i) {
  if (i > 10) {
    return i // i32
  }
  return 0 // i64
}
```

2. 4. If any read operation is performed before an assignament a semantic-error shall raise

> Variable is used before initialization.

```language-semantic-error
function main() {
  var x
  x += 1
  x = 10
}
```

2. 5. When calling a generic function, parameters shall be resolved first,
one by one from left to right.

> multiple return types found

```language-semantic-error
function sum<$t>($t a, $t b) {
  if (a > 10) {
    return 10
  }
  return a + b
}

function main() {
  sum<i32>(10, 10) // wrong, multiple return types
  sum(10, 10) // ok
}
```

> multiple template types found

```language-semantic-error
function sum<$t>($t a, $t b) {
  return a + b
}

function main() {
  var i64 x = 10
  var i32 y = 10
  sum(x, y)
}
```

> template type couldn't be resolved

<!-- TODO REVIEW null is type void? -->

```language-semantic-error
function do_something<$t>(ptr<$t> b) {
}

function main() {
  sum(null)
}
```


*Remarks*: Nevertheless enforcing types makes your program more stable to refactoring.

# Compiler variables

*Semantics*

1. A compiler variables are those that the programmer don't explicitly declare.

*Constraints*

1. Compiler variables shall be prefixed by `$` (dollar sign)

2. Compiler variables shall not be shadowed or shadow another variable if used.

```language-semantic-error
function main() {
  loop 5 {
    print("index = " + $index)
    loop 5 {
      print("ok, it's not used!")
    }
  }
}
```

2. 1. Shall no shadow a defined variable or semantic-error shall raise.

> variable $index redeclared at line 2:1

```language-syntax-error
function main() {
  var $index = 0
  loop 5 {
    print("index = " + $index)
  }
}
```

2. 2. Shall no shadow another magic variable or semantic-error shall raise.

> variable $index redeclared at line: 3 previous declaration at line: 2

```language-semantic-error
function main() {
  loop 5 {
    loop 5 {
      print("index = " + $index)
    }
  }
}
```

*Example*

```language
function main() {
  loop 5 {
    print("index = " + $index)
  }
}
```
