# `error`

```language
type source_code_location = struct {
  string file;
  string function;
  string line;
  string column;
}

type error = struct {
  own ref error parent;
  string message;
  source_code_location[] stack;

  constructor(string message, string file, string function, string line, string column) {
    this.message = clone message
    this.stack = new(1)
    this._add_trace(file, function, line, column)

  }

  _add_trace(string file, string function, string line, string column) {
    stack.push_back()(file, function, line, column)
  }

  // rethrow
  _set_parent(error parent) {
    this.parent = parent
  }

  to_string() {
    print(message)
    for (var s in stack) {
      print(s.file + ":" + s.line + ":" + s.column " at " + s.function)
    }
  }
}

```
