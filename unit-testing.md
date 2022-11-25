# Unit testing

Unit testing is built-in in the language mostly with `#assert`

> compiler test index.src test.exe

index.src
```
import process
import core.test as test

function main() i32 {
  print(process.arguments, file = process.stderr)

  return 0
}

function test() {
  test.configure_args(process.arguments)

  #assert true == true, "Truth forever"
}

```

`compiler test` will get test function as main and will generate the binary.
Executing the binary means executing the tests. You can configure core.test to
match your necesities.
