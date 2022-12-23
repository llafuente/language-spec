# Generic programming

*Syntax*

```syntax
dollar-identifier =
  '$' identifier

single-template-constraints =
  is type
  implements type
  extends type

template-constraints =
  single-template-constraints
  template-constraints , single-template-constraints

template-decl =
  template dollar-identifier template-constraints
```

*Semantics*

A template declare a type that will be resolved later, at `template instantiation`.

A template can be used anywhere where type is valid.

When a template instantiation occur the compiler shall search the best template:
* Search for a template with constraints.
  * If one found, use it
  * If multiple templates found, it will match the one that have most restrictions
    * If one found, use it
    * Multiple found, shall raise an error
* Search for a template without constraints that match the type.



*Constraints*

A template must start with dollar sign.

When a template is defined a te


*Examples*

```language
template $T

function pepe<$T>($T a, $T b) $T {
  return a + b
}

struct cls<$T> {
  $T propa
  $T propb
}

```

Resolution examples

```language
template $t
template $ptr_t is is ptr

struct safe_array<$t> {
  $t data
}

struct safe_array<$ptr_t> {
  // in this struct, we own the memory
  own $ptr_t data
}

struct point {
  float x
  float y
}

// first pop will be used, because the template do not match "is ptr"
var p1 = new safe_array<point>()

// second pop will be used, because the template do not match "is ptr"
var p1 = new safe_array<ptr<point>>()

```

```language
template $t
template $arr_t is array
template $impl_t implements IndexIterator

function p($t a) {}      // 1
function p($arr_t a) {}  // 2
function p($impl_t a) {} // 3

var val = 5
var arr_val = new i8[5]

p(val)
p(arr_val) // semantic error: found 2 possible templates with the same restrictions count
           // * $arr_t is array
           // * $impl_t implements IndexIterator


```


template restrictions

template $T implements X
template $T extends X
template $T is primitive
template $T is numeric
template $T is ptr
template $T is struct
