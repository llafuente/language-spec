# Unit testing

<!--
  https://en.wikipedia.org/wiki/Unit_testing
-->

Unit testing is a software testing method by which individual units of source code—sets of one or more computer program modules together with associated control data, usage procedures, and operating procedures—are tested to determine whether they are fit for use.

As you may already notice there is nothing special in the language to unit
testing. Unit testing it's just a special way to build your program, a especial
`program entry point` that instead of running your application, run tests.

## `test`

```syntax
testStmt
  // TODO functionLocator?
  : 'test' (stringLiteral | identifier) testBlockStatement
  ;

testBlockStatement
  : '{' testBodyStmtList? '}'
  ;

testBodyStmtList
  : (testStmt | functionBodyStmt)+
  ;

```

*Semantics*

Declare a test.

## `mock`

*Syntax*

```syntax
unaryMockExpr
  // TODO functionLocator?
  : 'mock' postfix_expr
  ;
```

*Semantics*

It will replace a `function` by a `mock` struct that behaves as you need.

`mock` a generic function will the copiler to implemented even if not used.

*Constrains*

1. `mock` shall be applied to a fully qualified function.

* All template parameters shall be defined

```language-semantic-error
function tpl<$t>($t x) {}

// semantic-error: mock requires a fully qualified function
test "mock requires a fully qualified function" {
  var invalid = mock tpl
  var valid = mock tpl<i8>
}
```

> Invalid mock targer. It contains an undefined template: $t

```language-test
function tpl<$t>($t x) {}
type tpl_ptrf = tpl<float>

test "implement mock with template" {
  const tpl_ptri_spy = mock tpl<int>

  #assert(typeof(tpl_ptri_spy) == mock_t<tpl<int>>)
}

test "implement mock from type with template aliased" {
  const tpl_ptrf_spy = mock tpl_ptrf

  #assert(typeof(tpl_ptrf_spy) == mock_t<tpl<float>>)
}  
```

2. `mock` can't be re-applied to a `function` it will be aliased instead.

```language-test
function add(int a, int b) {
  return a + b
}
test "double mock points the same struct" {
  const add_spy = mock add 
  const add_spy2 = mock add 

  // TODO ?? @add_spy == @add_spy2
  #assert(add_spy.address == add_spy2.address)
  #assert(typeof(add_spy) is ref)
  #assert(typeof(add_spy) == ref<mock_t<add>>)
}
```

2. The original function will be replaced by a function pointer.
And all function calls for a function pointer call.

3. `mock` shall not be used outside a test statement body  as it's a potencial security breach.

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

test sum {
  var mock_sum = mock sum

  mock_sum.call_fake(fake_sum)
  #assert(sum(0, 0) == 10, "mock is working")
  #assert(mock_sum.calls == 1, "mock has been called once")
  #assert(fake_sum_is_called == 1, "fake_sum is called once")

  mock_sum.restore()
  #assert(sum(10, 10) == 20, "original implementation is working")
  #assert(mock_sum.calls == 2, "mock has been called twice")
  #assert(fake_sum_is_called == 1, "fake_sum is called once")

  mock_sum.reset()
  #assert(mock_sum.calls == 0, "mock was reset")
}
```

```language-test
type point<$t> = struct {
  $t x
  $t y

  function add(point b) {
    this.x += b.x
    this.y += b.y
  }
}

type iPoint = point<int>
type fPoint = point<float>

test point {
  var i_add = mock iPoint.add
  var f_add = mock point<float>.add

  #assert(i_add.original != f_add.original)
}
```

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


<!-- 
  https://jasmine.github.io/api/edge/SpyStrategy
  https://google.github.io/googletest/gmock_for_dummies.html
-->

```language-propossal
function add(int a, int b) int {
  return a + b
}

function add_fake(int a, int b) int {
  return a + b + 1
}

test "direct API" {
  mock add spy
  // test initial state
  #assert(spy.called == 0)
  #assert(spy.fake == null)
  #assert(spy.call_data.length == 0)

  // direct call
  add(3, 4)
  #assert(spy.called == 1)
  #assert(spy.call_data.length == 1)
  #assert(spy.call_data[0].arguments.a == 3)
  #assert(spy.call_data[0].arguments.b == 4)
  #assert(spy.call_data[0].return == 7)

  // spy call, same effect
  spy(5, 6)
  #assert(spy.called == 2)
  #assert(spy.call_data.length == 2)
  #assert(spy.call_data[1].arguments.a == 5)
  #assert(spy.call_data[1].arguments.b == 6)
  #assert(spy.call_data[1].return == 11)

  spy.reset()
  #assert(spy.called == 0)
  #assert(spy.call_data.length == 0)

  spy.call_fake(add_fake)
  add(1, 2)
  #assert(spy.called == 1)
  #assert(spy.call_data.length == 1)
  #assert(spy.call_data[0].arguments.a == 1)
  #assert(spy.call_data[0].arguments.b == 2)
  #assert(spy.call_data[0].return == 4)

  spy.reset()
  #assert(spy.called == 0)
  #assert(spy.call_data.length == 0)
  // not affected
  #assert(spy.fake != null)
  
}

test "expect API" {
  spy.expect.arguments(3, 4).and.return(7)
  add(3, 4)

  spy.expect
    .arguments(1, 2).and.return(3)
  spy.expect.arguments(3, 4).and.return(7)
  add(1, 2)
  add(3, 4)

  spy.expect.unordered
    .arguments(1, 2).and.return(3)
    .arguments(3, 4).and.return(7)

  add(3, 4)
  add(1, 2)
}

test "fail, because expect is empty?" {
  spy.expect
  spy.expect.arguments(3, 4).and.return(7)
  add(3, 4)
}

test "fail, because it use and and set the same ?" {
  spy.expect
    .arguments(3, 4).and.arguments(1, 2)
  add(3, 4)
}

test "expected to throw any error" {
  spy.expect
    .arguments(1,2).and.throw()
  add(int.max, 1)
}

// TODO this may require set compiler options
test "expected to throw specific error" {
  spy.expect
    .arguments(1,2).and.throw(int.errors.overflow)
  add(int.max, 1)
}

test "expected to throw specific error fail when used with return" {
  spy.expect
    .arguments(1,2).and.throw(int.errors.overflow).and.return(11)
  add(int.max, 1)
}


```




```language
type point = struct {
  int x
  int y
  operator+ (point other) {
    return point(x + other.x, y + other.y)
  }
  operator- (point other) {
    return point(x - other.x, y - other.y)
  }
}


test point {
  test "operator+" {
    var p1 = point(1, 2)
    var p2 = point(1, 2)
    assert(p1 == p2, "initialization")

    assert(p1 + p2 == {2,4}, "equal initializer")
    assert(p1 + p2 == point(2,4), "equal point")
  }
  test "operator-" {
    var p1 = point(1, 2)
    var p2 = point(1, 2)
    assert(p1 == p2, "initialization")

    assert(p1 - p2 == {0,0}, "equal initializer")
    assert(p1 - p2 == point(0,0), "equal point")
  }
}

```
