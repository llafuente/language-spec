<!-- 
  https://en.wikipedia.org/wiki/Generic_programming
-->
# Generic programming (templates)

Templates can be applied to functions (`function`) and structured types (`struct`).

> Generic programming is a style of computer programming in which algorithms are written in terms of data types to-be-specified-later that are then instantiated when needed for specific types provided as parameters. Permits writing common functions or types that differ only in the set of types on which they operate when used, thus reducing duplicate code.

## Definition and declaration

*Semantics*

A template declaration create a type that will be instantiated later.

*Constrains*

1. A template can be used anywhere where a type is valid, except:

* A function return type, unless an argument is a template.

2. A template identifier shall start with dollar sign.

<!-- 
2. A template shall have unique name in the file.

Template names are private to the file. -->


# Instantiation

*Semantics*

Instantiation is the process that replace the template type for a specific type.

*Template deduction algorithm*

It performs the following steps:

1. Search for a type/function with no templates that match the name, exact match.

1. 1. If match, use it (exit)

2. Search for a type/function with templates that match the name.

2. 1. If Not found then semantic-error

> type '' not found

> function '' not found

3. For each type found try to found the best. The narrowest one.

* Give one point for each especialization: `implements`, `extends` or `is` found in the template.

3. 1. Don't found candidates, a semantic error shall raise

> Found no candidates for given template instantiation: '?'

> Possible 'N': '?'

3. 2. Found two or more, a semantic error shall raise

> Found multiple candidates for given template instantiation: '?'

> Candidate 'N': '?'


4. Instantiate the template. Replace the template for the specific
type and check if a valid function/type.

*Example*

```language
type AStruct<$T> = struct {
  $T x
}
// search for the specific type: AStruct<float>
// not found
// search for the specific type: AStruct<?>
// found -> try to instantiate -> AStruct<float> is instantiated
var AStruct<float> aFloat = {1.0}

// search for the specific type: AStruct<float>
// found
var AStruct<float> bFloat = {1.0}
```

## Specialization

*Semantics*

A template can be any type but most of the times many types won't work, the developer
can enforce a set of types and the error message will be more pleasant.

A template can be specialized in six ways:

* ? implement ?: the type shall implement given type
* ? extend ?: the type shall extend given type
* ? is ?: the type shall match given set/type

And it's negation: `not implement`, `not extend`, `is not`.

*Examples*

* `$x implements y`: `$x` shall implements `y` interface.
* `$x extends y`: `$x` shall extends `y`. `$x` and `y` are structs.
* `$T is primitive`: `$x` shall be a non-enum-struct.
* `$T is numeric`: `$x` shall be a number type
* `$T is ref`: `$x` shall be a pointer to any
* `$T is ref<i8>`: `$x` shall be exactly a pointer to i8
* `$T is struct`: `$x` shall be a struct.

*Examples*

```language-semantic-error
function call_next<$t>($t value) {
  return value.next()
}

function main() {
  call_next<float>(1.0)
}
```


```language-test
function next<$t>($t value) {
  return value + 1
}

function main() {
  #assert 2.0 == next<float>(1.0)
  #assert 2 == next<int>(1)
  #assert 0 == next<u8>(255) // overflow :P
}
```

> 'float' has no member named 'next'.

```language-semantic-error
function next<$t implements iterator>($t value) {
  value.next()
}
function main() {
  next<float>(1.0)
}
```

> instantiating function not possible: 'function next<$t implements iterator>($t value)'

> template '$t' as 'float' do not implement iterator

*Examples*

```language
type point = struct {
  int x
  int y
}

operator+(point a, point b) point {
  return point(a.x + b.x, a.y + b.y)
}

function add<$t>($t a, $t b) $t {
  return a + b
}

function main() {
  // implicit instantiation
  var s = add(point(10, 20), point(15, 15))
  #assert s.x == 25
  #assert s.y == 35
}

```

```language-propossal
type pick<$s is struct, field is string, $ret = ref> = struct {
  type tmp = struct {
    @struct.@field @field
  }

  operator() ($s s) $ret<tmp> {
    return new tmp(s.@field)
  }
}

type point {
  int x
  int y
}

function main() {
  var p = new point(10, 10)
  #assert p.x == 10
  #assert p.y == 10
  
  var p2 = pick<point, "x">(p)
  #assert p.x == 10
  #assert typeof(p) is ref

}
```

```todo-language
function greet(string name) {
  return "Hello: " + name
}

type bind<$f is function, $f.arguments[0] first> = struct {
  $f original
  $t firstArgument
  operator(@$f.arguments[:1]) () {

  }
}

function main() {
  var fn = new bind<greet, "moe">()

  #assert greet("moe") == "Hello: moe"
  #assert fn() == "Hello: moe"
}
```