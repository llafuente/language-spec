<!--
	cpp: 14 Exception handling [except]

	TODO where is the memory allocated -> is important ?
	TODO rethrow potentially could delete the memory? should check it's not the same address ?

References:
* https://eel.is/c++draft/except

Implementations details:

  https://github.com/llvm-mirror/libcxxabi/blob/master/src/cxa_exception.cpp
  https://github.com/ApexAI/static_exception

-->

# Error handling

*Preamble*

While the syntax of error handling is the common try/catch/finally.
It does not rely on stack trickery or implementation details.

It also ensure the programmer to handle the exceptions.

*Syntax*

```syntax
errorHandlingStmts
  : tryBlock catchBlock* finallyBlock?
  | 'throw' expression?
  ;

errorHandlingExprs
  : 'try' conditional_expr ('catch' conditional_expr)?
  // TODO how do we rename the exception ?
  // catch x: expr
  // catch expr as x
  // try name {} catch name is x {}
  | 'catch' conditional_expr ('as' name=identifier)? functionBody
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
			} catch {
				// $exception
			}
		};
	};
};
```

2. A `goto` statements shall not enter `tryBlock` or `catchBlock` or `finallyBlock`

3. A `return` statements is forbidden inside any `catchBlock` if a `finallyBlock` is defined, a semantic-error shall raise

> Found a return at '?:?' but there is a finally block.

4. Catch block expression shall be a constant expression.
<!-- STUDY, is there a real world usage to execute a postfix and compare values ? -->

5. Empty `throw` (re)throws current handled exception.

6. Exceptions are values that need to be known at compile time (constexpr)

> any exception need to known at compile time (should be a constexpr)

7. Zero (0) is an invalid value for exceptions

8. The compiler shall enforce the handle of any exception until
program entry point.

> Unhandled exception


*Examples*

Exception are values.

```language-package
package fs

type error = enum {
  fileNotFound = 1
}

function open(uri file_path) file {
	// ...
	throw error.fileNotFound
}
```

```language
import fs

function main() {
	try {
		var x = fs.open("file.txt")
	} catch fs.error.fileNotFound {
		print("File not found at " + $exception.stack)
	}
}
```

*Compiler*

```language-compiled
type λ_source_code_loc = struct {
	uint line
	uint column
	string file
}

global λ_source_code_loc[] λ_call_stack = new

// TODO variant ?
type λ_exception_t = struct {
	i64 value
	type typeid
	λ_source_code_loc[] stack
}
global var λ_exception_t λ_exception = {0, 0}


function open(uri file_path) file {
	// ...
	λ_exception.value = error.fileNotFound
	λ_exception.type = fs.error
	λ_exception.stack = λ_call_stack.clone()
	return file.default
}

function main() void {
	{ // try block
		λ_exception.value = 0
		λ_exception.typeid = 0
		var x = fs.open("file.txt")
		{ // catch block
			alias $exception = λ_exception

			if (λ_exception.value != 0) {
				if (λ_exception.type == fs.error && λ_exception.value == fs.error.fileNotFound) {
					print("File not found at " + $exception.stack
				}
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
	} catch ($exception is string) { // TODO fix: here parenthesis avoid a syntax error
		print("Error found " + e)
	}
}
```

*Compiler*

```language-compiled



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

1. Define a block where an exception may occur and how to handle it.

2. `try` can be used in expressions to eat exceptions, in that case the called function will return the `default` value.

```language-test
function i64_throws() i64 {
	throw "error"
}
function string_throws() string {
	throw "error"
}

function main() {
	var tmp = try i64_throws()
	#assert tmp == i64.default

	var tmp2 = try string_throws()
	#assert tmp2 == string.default
}
```

3. Can be used as statement, part of `try`/`catch`/`finally`

```language-test
function main() {
	var steps = 0
	try {
		++steps
		throw "error"
	} catch {
		#assert steps == 1
		++steps
		#assert $exception == "error"
	} finally {
		#assert steps == 2
		++steps
	}
	#assert steps == 3
}
```

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

```todo-language
function step1() void {
  throw "unexpected error"
}

function step2() i64 {
  throw "unexpected error"
}

function step3() u32 {
  throw "unexpected error"
}

function step4(bool fail) bool {
  if (fail) {
	throw "failure"
  }
  return true
}

// TODO test return types!
function main() {
  try step1()

  var s2 = try step2()
  #assert s2 == step2.return_type.default

  var s3 = try step3()
  #assert s3 == step3.return_type.default

  if (try step4(true)) {
	#unreachable "step4 should fail and return false"
  } else {
	#assert true, "step4 failed and return false"
  }

  if (try step4(false)) {
  } else {
	#unreachable "step4 should fail and return false"
  }


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
	var http.Request options = new("GET", "http://www.contoso.com")

  var first = true
  request: try {
    var response = http.fetch(options)
	print(response.body)
  } catch (curl.error.CouldNotResolveHost) {
    options.setProxy("http://proxy:8080")
    goto request
  } catch (curl.error.proxyAuthFailed) {
    options.setProxyAuth("John", "Doe")
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

*Constraints*

1. `catch` inside an expression do not have access to the left hand side of the expression.

```language-semantic-error
function main() {
  var x = catch something_that_throws() {
    #assert x == 0 // x is undefined
	#assert $exception == 0 // x is undefined
  }
}
```

2. `catch` match against the value or the type

```language-semantic-error
const err = "something goes wrong"
var str_type

function a() {
	throw err
}

function main() {
	try {
		a()
	} catch err e { // match by value
		print(e)
	}

	try {
		a()
	} catch string e { // match by type
		print(e)
	}
	
	str_type = string
	try {
		a()
	} catch str e { // match by type, also valid
		print(e)
	}
}
```


*Example*

```language
import http

function main() {
	var retries = 3
retry_main:
  if (--retries == 0) {
	print("could not get url")
	exit(1)
  }

  var response = catch http.get("xxx") as err {
    if (err == http.errors.couldNotResolveHost) {
		sleep(1000)
		goto retry_main
	}
	throw err
  }

  print(response.body)
}
```

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
  : 'retry' keyName=identifier? (',' expectionName=identifier)? ('while' expression | 'until' expression) functionBody
  ;
```

*Semantics*

Retry body block until expression is met or Retry body block while expression is met.

`retry` statement in a compiler construct around other features. It purpose is to be idiomatic.

*Constraints*

1. `retry` statement create a compiler variable with name $index, that count how many iterations are being performed. Stating from 0.

2. `retry` statement create a compiler variable with name $exception, that store the exception throw in the last iteration. It will be zero in the first try.

3. `retry` statement is repleaced by a: try-catch-if

*Examples*

```language
function main() {
  retry while ($index < 5) {
    doMagic()
  }
}
```

```language-compiled
function main() {
	var $index = 0;
retry_loop_001:
	{ 
		try {
			doMagic()
		} catch {
			if ($index < 5) {
				++$index
				goto retry_loop_001
			}
		}
	}
}
```

```language
function main() {
  retry counter until (counter == 5) {
    doMagic()
  }
}
```

Try to open a file until it exists during 60s each second.

```language
import fs

// wait until file exists

function main() {
  // 60s
  retry while $exception is fs.error.NotFound and $index < 60 and (sleep(1000) ? true : true) {
    var file = fs.open("./file.txt")
  }
}
```