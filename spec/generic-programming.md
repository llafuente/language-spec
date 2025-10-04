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

```
type AStruct = struct<$T> {
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

```error
function next<$t>($t value) {
  value.next()
}
next<float>(1.0)
```

> 'float' has no member named 'next'.

```error
function next<$t implements iterator>($t value) {
  value.next()
}
next<float>(1.0)
```

> instantiating function not possible: 'function next<$t implements iterator>($t value)'

> template '$t' as 'float' do not implement iterator

*Examples*

```language
function add<$t>($t a, $t b) $t {
  return a + b
}

type point = struct {
  f32 x
  f32 y
}

function operator+(point a, point b) point {
  return point(a.x + b.x, a.y + b.y)
}

# implicit instantiation
var s = add(point(10, 20), point(15, 15))
#assert s.x == 25
#assert s.y == 35
```
