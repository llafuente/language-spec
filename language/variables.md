# Variables

A variables is the name that it's associated with a value in a computer program.

That name can point to a value that change over time: a `variable` (`var`)
or a values that don't: a `constant` (`const`)

The scope of a variable tells the compiler the life cycle of the variable.
We list all the options below.

*Constraints*

1. A variable can't be shadowed. Compiler shall raise an error.


<a name="global-variables"></a>
## global

*syntax*

```syntax
global_variable_declaration_statement
  // infer variable with initialization
  : 'global' 'var' Identifier '=' rhs_expression

  // typed variable with initialization
  | 'global' 'var' type Identifier '=' rhs_expression

  // typed variable no initialization
  | 'global' 'var' type Identifier

  // typed constant with initialization
  | 'global' 'const' type Identifier '=' rhs_expression

  // untyped constant with initialization
  | 'global' 'const' Identifier '=' rhs_expression
  ;
```

*Semantics*

A Global variables is available to every file in main project

`packages` are not part of your project so a package could not
read your global variables.

*Constraints*

Global variables shall not be declared outside your program `entry file`

A global variable that is not assigned shall have a type.

The identifier shall no be uppercased, that reserved to defines.


<a name="package-variables"></a>
## package variables

A Package can export variables so the main program and other libraries will share
it's access.

Declaration is bound to the top of the file.

```syntax
package_variable_declaration_statement
  // infer variable with initialization
  : 'package' 'var' Identifier '=' rhs_expression

  // typed variable with initialization
  | 'package' 'var' type Identifier '=' rhs_expression

  // typed variable no initialization
  | 'package' 'var' type Identifier

  // typed constant with initialization
  | 'package' 'const' type Identifier '=' rhs_expression

  // untyped constant with initialization
  | 'package' 'const' Identifier '=' rhs_expression
  ;
```


<a name="file-variables"></a>
## file variables

*Syntax*

```syntax
file_variable_declaration_statement
  // infer variable with initialization
  : 'var' Identifier '=' rhs_expression

  // typed variable with initialization
  | 'var' type Identifier '=' rhs_expression

  // typed variable no initialization
  | 'var' type Identifier

  // typed constant with initialization
  | 'const' type Identifier '=' rhs_expression

  // untyped constant with initialization
  | 'const' Identifier '=' rhs_expression
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

## block variable

*Syntax*

```syntax
block_variable_declaration_statement
  : file_variable_declaration_statement
  ;
```

*Semantics*

A block variable will live until the end of the current block unless it's fetch
by a lambda, in that case it will live until the lambda dies.

*Constraints*


*Example*

```language
type a = struct {
  float a
}
```

```language
type a = struct {
  function new() { print("constructor")}
  function delete() { print("destructor")}
}

function simple_test() {
  var aptr = new a();
} // <-- aptr dies!

print("start")
simple_test()
print("end")

```

```output
start
constructor
destructor
end
```

*Example*

```language
type a = struct {
  function new() { print("constructor")}
  function delete() { print("destructor")}
}

type callback = function () string;

function do_your_job() lend callback {
  var aptr = new a();
  function r() string {
    print("lambda start and return")
    return aptr
  }

  return r
}

print("start")
var t = do_your_job()
print("job started")
print(t())
print("lambda finished")
delete t
print("end")
```

```output
start
constructor
lambda start and return
lambda finished
destructor
end
```


# Type / infer

Typing a variable is optional in the language, it's very probable you don't need
to type anything in your main program.

If type is omitted, the variable will take the type of the first assignment.

Nevertheless enforcing types makes your program more stable to refactoring.


# Magic variables

*Semantics*

We call magic variables those that the programmer don't explicitly declare.

*Constraints*

1. Magic variable shall be prefixed by `$` (dollar sign) to avoid easy
collisions.


*Example*

```language
loop 5 {
  print("index = " + $index)
}
```

*Example*

An error raise when a magic variable try to shadow your variables.

```language
var $index = 0
loop 5 {
  print("index = " + $index)
}
```

```error
variable $index redeclared at line 2:1
```

*Example*

An error raise if a magic variable will shadow another magic variable.

```language
loop 5 {
  loop 5 {
    print("index = " + $index)
  }
}
```

```error
variable $index redeclared at line 1:1
```
<!--
STUDY!

But only if used. ??
If not used, it's ok.

```language
loop 5 {
    print("index = " + $index)
  loop 5 {
    print("ok")
  }
}
```
-->

## Implementation notes.

Magic variables shouldn't be special inside the compiler.
