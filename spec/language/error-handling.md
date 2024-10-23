<!--
	cpp: 14 Exception handling [except]

	TODO where is the memory allocated -> is important ?
	TODO rethrow potentially could delete the memory? should check it's not the same address ?
-->

# Error handling

*Preamble*

While the syntax of error handling is the common try/catch/finally.
It does not rely on stack trickery or implementation details.

The compiler shall annotate any function that throws and exception

*Syntax*

```syntax
errorHandlingStmts
	: tryBlock catchBlock? finallyBlock?
	| 'try' expression
	| 'catch' expression functionBody
	;

tryBlock
	: 'try' functionBody
	;

catchBlock
	: 'catch' (identifier | postfixMemberAccessExpr | typeDefinition identifier) functionBody
	;

finallyBlock
	: 'finally' (identifier | postfixMemberAccessExpr | typeDefinition identifier) functionBody
	;
```

*Semantics*

*Constraints*

1. `goto` is forbidden inside `tryBlock` or `catchBlock` or `finallyBlock`

2. `break` shall not leave `tryBlock` or `catchBlock` or `finallyBlock`

```error
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

*Examples*

Exception as value

```language
function main() {
	try {
		fs.open("file.txt")
	} catch fs.fileNotFound {
		print("File not found")
	}
}
```

*Compiler*

```compiled
function main() void {
	__lng_exception = null
	fs.open("file.txt")
	if (__lng_exception != null) {
		if (__lng_ == fs.fileNotFound) {
			print("File not found")
		} else {
			__lng_exception = null
			return void.default
		}
	}
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
	} catch (string x) {
		print("Error found " + x)
	}
}
```

*Compiler*

```compiled
type λt_location = struct {
	uint line
	uint column
	string file
}

global λt_location[] λ_call_stack = new
global own ptr<void>? λ_exception_value = null
global type λ_exception_type = i8

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

## catch

*Semantic*

Define an error handler by type or by value.

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

```test-output
Open file
File not found
This is the end, my only friend
```
