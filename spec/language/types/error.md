# `error`

```language
type source_code_location = struct {
  string file
  string func
  string line
  string column
}

type error = struct {
  own ref<error> parent
  string message
  source_code_location[] stack

  new(string message, string file, string func, string line, string column) {
    this.message = message.clone()
    this.stack = new(1)
    this._add_trace(file, func, line, column)

  }

  function _add_trace(string file, string func, string line, string column) {
    stack.push_back()(file, func, line, column)
  }

  // rethrow
  function _set_parent(error parent) {
    this.parent = parent
  }

  function to_string() {
    print(message)
    loop s in stack {
      print(s.file + ":" + s.line + ":" + s.column + " at " + s.function)
    }
  }
}

```
