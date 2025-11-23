# Compiler configuration

The compiler is configured inside the source code.

# `#set`

*syntax*

```syntax
preprocessorSetStatement
  : '#' 'set' identifier ('.' identifier)* '=' mayBeConstant
  ;
```

*Semantics*

Sets a compiler property.

*Constraints*

1. It's only available at `program` `entry point file`.

2. If the property starts with `compiler.` the property must exist and it will override it's value.

3. If a property is already set a compiler error shall raise.

> Trying to #set a configuration '?' already #set

*Example*

```language
#set config.array.check_oob = true

function main() {
}
```

# get configuration

*semantics*

Retrieves a value from compiler configuration.

Compiler configuration is available at compile time as constant.

*Example*

```language-test
test "get configuration" {
  #print(config.array.check_oob)
}
```

# check configuration

*Example*

```language-package
package example "0.0.0"

function main() {
  #if config.array.check_oob {
    #error "This package is incompatible with oob check, please disable it!"
  }
}
```

## configuration list (logia)

### logia.arguments

Default arguments for the processs, those arguments will be prepend.

```language-test
#set process.arguments = ["a", "b", "c"]

function main(process p) {
  // the first one is the name of the process
  // followed by a,b,c
  // followed by real process arguments
  #assert(p.args.len >= 4)
  #assert(p.args[2] == "a")
  #assert(p.args[3] == "b")
  #assert(p.args[4] == "c")
}


```