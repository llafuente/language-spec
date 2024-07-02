# Interfaces

*Semantics*

Interfaces defines struct fields and method.

*Constraints*

*Examples*

```language
type index_iterator<template $t> = interface {
  size length
  function operator[](size i) $t
}
```
