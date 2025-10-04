# The package system
<!--
  https://docs.python.org/3/reference/import.html
-->

Packages are the way the language propose to share code across people.

One package can gain access to another package functionality by importing it.

```language
import fs

function main() {
  fs.open("./file.text)
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
  | functionDecl endOfStmt
  // program exclusive!
  | typeDecl endOfStmt
  | packageVariableDeclStmt endOfStmt
  | fileVariableDeclStmt endOfStmt
  | endOfStmt
  ;
```

## Package declaration

*Syntax*

```syntax
packageDefinitionStmt
  : 'package' name=identifier version=stringLiteral endOfStmt
  ;
```

*Semantics*

Declare a package and also it's version.

Every function in the main package will be exported. Anything below won't be exported.

*Constraints*

* Package version shall conform semver.

* A package can't declare or use `global` variables.

* Any preprocesssor/metaprogramming shall be contained inside the package.

## Package import

*Syntax*

```syntax

packageName
  : identifier ('.' identifier)*
  ;

importStmt
  : 'import' packageName version=stringLiteral? ('as' name=identifier)?
  ;

importStmtList
  : (importStmt endOfStmt+)+
  | endOfStmt*
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

5. Module resolution, given the following example

```language
import x.y.z
```

The compiler shall test the following files in order.

* ./x.y.z.src
* ./x/y.z.src
* ./x/y/z.src
* &lt;project-lib-path&gt;/x/y/z/package.src
* &lt;compiler-core-path&gt;/x/y/z/package.src

If the module is not found locally it shall download the module from the central repository.

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

*Rationale*

Resolving modules locally for the project with higher priority that lib or core will ensure that any functionality can be mock
or patch if needed by end user.

It add a indirection as the end-user shall know the module resolution but it's we hope is simple enough to not add complexity to any project.