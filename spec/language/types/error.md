# `error`

```language
type source_code_location = struct {
  string file;
  string function;
  string line;
  string column;
}

type error = struct {
  error parent;
  string message;
  source_code_location[] stack;

  constructor(string message, string file, string function, string line, string column) {
    this.message = message
    this.stack = new source_code_location[1]
    this.addTrace(file, function, line, column)

  }

  addTrace(, string file, string function, string line, string column) {
    stack.init_push(file, function, line, column)
  }

  setParent(error parent) {
    this.parent = parent
  }

  toString() {
    print(message)
    for (var s in stack) {
      print(s.file + ":" + s.line + ":" + s.column " at " + s.function)
    }
  }
}

```
