<!--
	cpp: 14 Exception handling [except]

	TODO where is the memory allocated -> is important ?
	TODO rethrow potentially could delete the memory? should check it's not the same address ?


Implementations details:

  https://github.com/llvm-mirror/libcxxabi/blob/master/src/cxa_exception.cpp
  https://github.com/ApexAI/static_exception

-->

# Error handling

*Preamble*

While the syntax of error handling is the common try/catch/finally.
It does not rely on stack trickery or implementation details.

*Syntax*

```syntax
errorHandlingStmts
	: tryBlock catchBlock* finallyBlock?
  | 'throw' expression?
	;

errorHandlingExprs
  : 'try' conditional_expr ('catch' conditional_expr)?
  | 'catch' conditional_expr functionBody
  | conditional_expr
  ;

tryBlock
	: 'try' functionBody
	;

catchBlock
	: 'catch' (
      typeDefinition identifier
      | '(' typeDefinition identifier ')'
      | postfix_expr
    )? functionBody
	;

finallyBlock
	: 'finally' functionBody
	;
```

*Semantics*

It's the process used by the language to react to non-conformant code.

*Constraints*

1. `goto` is forbidden inside `tryBlock`
<!-- study: `catchBlock` or `finallyBlock` -->

2. A `break` statements inside: `tryBlock`, `catchBlock` or `finallyBlock` will reset error handling

```language
function main() {
	outter: loop 10 {
		inner: loop 20 {
			try {
				break outter
			} catch e {
			}
		}
	}
}
```

2. A `goto` statements shall not enter `tryBlock` or `catchBlock` or `finallyBlock`

3. A `return` statements is forbidden inside any `catchBlock` if a `finallyBlock` is defined, a semantic-error shall raise

> Found a return at '?:?' but there is a finally block.

4. Catch block expression shall be a constant expression.
<!-- STUDY, is there a real world usage to execute a postfix and compare values ? -->

5. Empty `throw` (re)throws current handled exception.

6. Exceptions are values that need to be known at compile time (constexpr).

7. The compiler shall enforce the handle of any exception until
program entry point.

> Unhandled exception


*Examples*

Exception are values.

```language-package
package fs

type errors = enum {
  fileNotFound = 1
}

function open(uri file_path) file {
	// ...
	throw errors.fileNotFound
}
```

```language
import fs

function main() {
	try {
		var x = fs.open("file.txt")
	} catch fs.error.fileNotFound {
		print("File not found")
	}
}
```

*Compiler*

```language-compiled
function open(uri file_path) file {
	// ...
	λ_exception_value = errors.fileNotFound
	λ_exception_type = errors
	return file.default
}

function main() void {
	{
		λ_exception_value = null
		var x = fs.open("file.txt")
		if (λ_exception_value != null) {
			if (λ_exception_type == fs.error && λ_exception_value == fs.error.fileNotFound) {
				print("File not found")
			}
		}
	}

    return void.default
}
```


*Examples*

Exception as type

```language

function function_that_throws(bool b) i8 {
	if (b) {
		throw "exception!"
	}
	return 1
}

function main() {
	function_that_throws(false)

	try {
		function_that_throws(true)
	} catch e, e is string {
		print("Error found " + e)
	}
}
```

*Compiler*

```language-compiled
type λt_location = struct {
	uint line
	uint column
	string file
}

global λt_location[] λ_call_stack = new
global ref<void>? λ_exception_value = null
global type λ_exception_type = void

function function_that_throws(bool b) i8 {
	if (b) {
		λ_exception_type = string
		if (λ_exception_value != null) {
			delete λ_exception_value
		}
		λ_exception_value = "exception!".clone()
	}
	return 1
}

function main() {
	λt_location.push({##__FILE__#, ##__LINE__#, ##__COLUMN#})
	function_that_throws(false)
	λt_location.push.pop()
	if (λ_exception_value != null) {
		return self.return_type.default
	}

	λt_location.push({##__FILE__#, ##__LINE__#, ##__COLUMN#})
	function_that_throws(true)
	λt_location.push.pop()

	if (λ_exception_value != null) {
		if (λ_exception_type == string) {
			print("Error found " + λ_exception_value)
			delete λ_exception_value
		} else {
			return self.return_type.default
		}
	}
}
```

*Implementation details*

Error handling will be implemented as direct as possible.

* Before function call it will push onto the `λ_call_stack` the current location if `compiler.stack`
* After function call it will:
  * Pop the `λ_call_stack` the current location if `compiler.stack`
  * Check if an exception is thrown
    * Check each handler by type or value
    * if there is no handler return the default type and "unwind" the stack.

## throw

*Semantic*

It assign current exception value and type and return the default value for current function.

This makes the caller to handle the exception.

## try

*Semantic*

Define a block that an exception may occur and how to handle it.

Can be use alone or as part of try/catch/finally.

*Example*

Exception handle

```language
function main() {
  try {
    fs.open("file.txt")
  } catch fs.fileNotFound {
    print("File not found")
  } catch string e {
    print("Exception with text: " + e)
  }
}
```

Exception eater

```language
type result = enum {
  error = 0
  ok = 1
}

function step1() result {
  throw "unexpected error"
}

function step1_alternative() result {
  return result.ok
}

function main() {
  try step1()
  try step2()
  try step3()
  try step4()
  if (validate_steps()) {
    // we are ok!
  } else {
    // show an error
  }

}
```


```language
type result = enum {
  error = 0
  ok = 1
}

function step1() result {
  throw "unexpected error"
}

function step1_alternative() result {
  return result.ok
}

function main() {
  request: try {
    curl("http://www.contoso.com")
  } catch (curlerr.CouldNotResolveHost) {
    setup_proxy("http://proxy:8080")
    goto request
  } catch (curlerr.proxyAuthFailed) {
    set_proxy_user("John")
    set_proxy_password("Doe")
    goto request
  }

  try step2()
  try step3()
  try step4()
  if (validate_steps()) {
    // we are ok!
  } else {
    // show an error
  }

}
```


## catch

*Semantic*

Define an error handler by type or by value.

Can be use alone or as part of try/catch/finally.

*Example*

```language
function main() {
	try {
		fs.open("file.txt")
	} catch fs.fileNotFound {
		print("File not found")
	} catch string e {
		print("Exception with text: " + e)
	}
}
```

```language
function throws_int() int {
  throw "expected error"
  return 101
}

function throws_string() string {
  throw "expected error"
  return "hello world!"
}


function main() {
  var x = catch throws_int() {
    #assert x == int.default
  }
  var y = catch throws_string() {
    #assert y == string.default
  }
  var z = try throws_int() catch 101
}
```


## finally

*Semantic*

Define an a block that will be executed regarless if an exception is throw or not.

*Example*

```language
function main() {
	try {
		print("Open file")
		fs.open("file.txt")
	} catch fs.fileNotFound {
		print("File not found")
	} catch string e {
		print("Exception with text: " + e)
	} finally {
		print("This is the end, my only friend")
	}
}
```

```output
Open file
File not found
This is the end, my only friend
```


## retry

```syntax
retryUntilWhileStmt
  : 'retry' functionBody ('while' expression | 'until' expression)
  ;
```

*Semantics*

Retry body block until expression is met or Retry body block while expression is met.

`retry` statement in a compiler construct around other features. It purpose is to be idiomatic.

*Constraints*

1. `retry` statement create a magic variable with name $index, that count how many iterations are being performed. Stating from 0.

2. `retry` statement create a magic variable with name $exception, that store the exception throw in the last iteration. It will be zero in the first try.

3. `retry` statement is repleaced by a: try-catch-if

*Examples*

```language
function main() {
  retry {
    doMagic()
  } while ($index < 5)
}
```

```language
function main() {
retry_loop_001: loop {
	var exception
	try {
    	doMagic()
	} catch e {
		$exception = e
		if ($index < 5) {
			continue retry_loop_001
		}
	}
  }
}
```

```language
function main() {
  retry {
    doMagic()
  } until ($index > 5)
}
```

```language
function main() {
retry_loop_001: loop {
	var exception
	try {
    	doMagic()
	} catch e {
		$exception = e
		if (!($index > 5)) {
			continue retry_loop_001
		}
	}
  }
}
```


