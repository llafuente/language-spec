# Unit testing

<!--
  https://en.wikipedia.org/wiki/Unit_testing
-->

Unit testing is a software testing method by which individual units of source code—sets of one or more computer program modules together with associated control data, usage procedures, and operating procedures—are tested to determine whether they are fit for use.

As you may already notice there is nothing special in the language to unit
testing. Unit testing it's just a special way to build your program, a especial
`program entry point` that instead of running your application, run tests.


## `mock`

*Semantics*

It will create a mock of a function with a specific parameters.

Mocking a function will force to be implemented if a generic is used.

*Constrains*

1. Template parameters shall be forbidden.

2. The original function will be replaced by a function pointer.
And all function calls for a function pointer call.

3. Using mock in any non test build shall raise an error.

*Example*

```language
function sum(i32 a, i32 b) i32 {
  return a + b
}

var fake_sum_is_called = 0
function fake_sum(i32 a, i32 b) i32 {
  ++fake_sum_is_called
  return 10
}

var mock_sum = mock function sum(i32 a, i32 b) i32

function main() {
  mock_sum.call_fake(fake_sum)
  #assert sum(0, 0) == 10, "mock is working"
  #assert mock_sum.calls == 1, "mock has been called once"
  #assert fake_sum_is_called == 1, "fake_sum is called once"

  mock_sum.restore()
  #assert sum(10, 10) == 20, "original implementation is working"
  #assert mock_sum.calls == 2, "mock has been called twice"
  #assert fake_sum_is_called == 1, "fake_sum is called once"

  mock_sum.reset()
  #assert mock_sum.calls == 0, "mock was reset"
}

```

### Properties

#### i32 calls

Number of calls

### Methods

#### reset()

reset all mock values, restore original implementation, calls and arguments.

#### call_fake($f)

#### return($t)

Tell the mock to return the value when invoked.

It will disable `return_values`

#### return_values($t[])

Tell the mock to return one of the specified values (sequentially) each time the spy is invoked.

It will disable `return`

#### throw

Tell the mock to throw an error when invoked.



<!--

  Alternative syntax

  var sum_mock = mock sum <-- compile time type

  type mock = struct<$t> {
    i32 called
    arguments last_arguments
    optional<ref<$t>> force_return
  }

  * has_been_called() boolean {}
  * call_count() i32 {}
  * reset_call_count() {}
  * returns() $t {}
  * get_last_arguments() arguments {}

-->
