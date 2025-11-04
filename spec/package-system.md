# The package system (FINAL)
<!--
  https://docs.python.org/3/reference/import.html
-->

Packages are the way the language propose to share code across people.

One package can gain access to another package functionality by importing it.

```language
import fs

function main() {
  fs.open("./file.text")
}
```

## Package entry point

```syntax
// package entry point!
packageProgram
  : (comments endOfStmt?)* packageDefinitionStmt packageStmsList? EOF
  ;

packageStmsList
  : packageStmts+
  ;

packageStmts
  : comments endOfStmt
  | importStmt
  | functionDecl endOfStmt
  // program exclusive!
  | typeDecl endOfStmt
  | packageVariableDeclStmt endOfStmt
  | fileVariableDeclStmt endOfStmt
  | testStmt
  | endOfStmt
  ;
```

*Semantics*

Like a program a package have it's entry point: `main.language` at the root of the package.

There is no official repository at this time.

*Folder structure*

* packagename (shall be a valid identifier)
  * main.ts (package entry point)
* main.ts (program entry point)

## Package declaration

*Syntax*

```syntax
packageDefinitionStmt
  : 'package' name=packageName version=stringLiteral endOfStmt
  ;
```

*Semantics*

Declare a package and also it's version.

Every function in the main package will be exported. Anything below won't be exported.

*Constraints*

1. Package version shall conform semver.

2. A package can't declare or use `global` variables.

3. A package can't configure the compiler.

4. Everything declared in the package is public except for:

* preprocesssor
* metaprogramming

## Package import

*Syntax*

```syntax

packageName
  : identifier ('.' identifier)* ('.' '*')?
  ;

importStmt
  : 'import' location=packageName version=stringLiteral? ('as' name=identifier)? endOfStmt
  | endOfStmt
  ;

importStmtList
  : importStmt+
  ;
```

*Semantics*

A package or program gain access to another package functionality by importing it's
contents.

*Constraints*

1. All imports shall be at the top of the file, only package declaration shall be above.

2. Package version shall conform semver

3. Version is mandatory at program entry point. If after importing all modules versions collide a compiler error shall raise.

> No version satifies the following imports

> * ?file:?line:?column. Expected version x.x.x

> * ?file:?line:?column. Expected version x.x.x

5. Package resolution, given the following example

```language
import x.y.z
```

The compiler shall test the following files in order.

* &lt;project-root&gt;/x/y/z.src
* &lt;project-lib-path&gt;/x/y/z/package.src
* &lt;compiler-core-path&gt;/x/y/z/package.src

If the package is not found locally it shall download the package from the central repository.

For debugging purposes the compiler shall export the import information in a file where there will be the resolution per file.

*Example*

> compiler dump-imports index.src -output json

```json
{
  "main.src" : {
    "x.y.z" : "./x/y.z.src"
  }
}
```

6. Wildcard imports merge the package into current namespace. Allowing fast access but also introducing future collisions.

*Examples*

Importing a package, namespaced

```language
import fs

function main() {
  var f = fs.open("file.txt")
  fs.close(f)
}
```

Importing a package into current namespace

```language
import fs.*

function main() {
  var f = open("file.txt")
  close(f)
}
```

Importing single function

```language
import fs.open

function main() {
  var f = open("file.txt")
  f.close()
}
```

*Rationale*

Resolving packages locally for the project with higher priority than external libraries or core libraries will ensure that any functionality can be mock
or patch if needed by end user.

It adds an indirection as the end-user shall know the module resolution but We hope is simple enough to not add complexity to any project.
