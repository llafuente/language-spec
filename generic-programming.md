# Generic programming

<!-- definition -->

## Template definition

*Syntax*

```syntax
DollarIdentifier =
  : '$' Identifier
  ;

template_constraint =
  : 'is' type_ref
  | 'implements' type_ref
  | 'extends' type_ref

template_constraints =
  : template_constraint (',' template_constraint)+
  ;

template_decl =
  : 'template' DollarIdentifier template_constraints?
  // template specification ?
  // template dollar-identifier dollar-identifier template-constraints
  ;
```

*Semantics*

A template declaration create a type that will be instantiated later.

A template can be used anywhere where a type is valid, except:
* A function return type, unless an argument is a template.

When a template instantiation occur the compiler shall search the best
template using the following set of rules: `template deduction`

* Search for a `template specification` that match given type.
  * If one found, use it
  * If multiple templates found, it will match the one that have most restrictions
    * If one found, use it
    * Multiple found, shall raise an error
* Search for a `template` that match given type.
  * If found, use it
  * If not found, shall raise an error.


*Constraints*

1. A template shall start with dollar sign.

2. A template shall have unique name in the file.

<!-- Template names are private to the file. -->

Template constraints:

* `template $x implements y`: `$x` shall implements `y` interface.
* `template $x extends y`: `$x` shall extends `y`. `$x` and `y` are structs.
* `template $T is primitive`: `$x` shall be a non-struct.
* `template $T is numeric`: `$x` shall be a number type
* `template $T is ptr`: `$x` shall be a pointer to unkown
* `template $T is ptr<i8>`: `$x` shall be a pointer to i8
* `template $T is struct`: `$x` shall be a struct.

*Examples*

```language
function add<template $t>($t a, $t b) $t {
  return a + b
}

struct point {
  f32 x
  f32 y
}

function operator+(point a, point b) point {
  return point(a.x + b.x, a.y + b.y)
}

var s = add(point(10, 20), point(15, 15))
#assert s.x == 25
#assert s.y == 35
```

## Template specialization

A template specialization extend a template declaration with a narrow type.

*Example*

```language
template $t
template $ptr_t $t is is ptr

struct sample_array<$t> {
  $t data[10]
}

struct sample_array<$ptr_t> {
  // when pointer is used, we will own the memory and when we die, so the pointer
  own $ptr_t data[5]
}

struct point {
  float x
  float y

  function delete() {
    print(`destroy (${this.x}, ${this.y})`)
  }
}

// first struct declaration will be used, because the template specification do not match "is ptr"
var p1 = new sample_array<point>()
#assert (typeof p1).size == point.size * 10
p1.data[0](10, 10)
delete p1 // prints: destroy (10, 10)

// second struct will be used, because the template specification do match "is ptr"
var p2 = new sample_array<ptr<point>>()
#assert (typeof p2).size == ptr<point>.size * 5
p2.push(new point(15, 15))
delete p2 // prints: destroy (15, 15)
//
```

```language
template $t
template $arr_t $t is array
template $impl_t $t implements IndexIterator

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


# Type traits

```
type remove_ref = $t is ref<$x> then $x
type enfore_ref = $t is not ref<$x> then ref<$x>

#macro is_ref(#value v) {
  if (type v != type ref) {
    #static_assert false, ##value# " is not ref"
  }
}
```





# `#fortype`


```language
#metadef property json (string value) (struct_name, struct_type) {
}

#metadef struct json (string value) (struct_name, struct_type) {
  function from_json(point p, json j, bool strict) bool {
    if (!j.isObject()) {
      throw "Invalid json type parsing point"
    }

    #forstruct type, name in point {
      json_prop jp = j.getProperty(#metaget property("json", point, #name#)#)
      p.#name# = jp.to<#type#>()
    }
  }
}

@json()
type point = struct {
  @json("x")
  float x
  @json("y")
  float y
}

```

```language
#macro function.deprecated(#text struct_name, #type struct_type)
  #message Deprecated function #value#
}

#metadef function deprecated (string value)


@deprecated("")
function xx() {

}

```

```language
type forniture = enum {
  chair = "chair"
  table = "table"
}
const forniture_t = typeof forniture
#forenum name, value in forniture {

}
```



