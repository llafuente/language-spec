# Array

An array it a contiguous memory you can deref safely.

No overflow could happen.


```
interface LengthIterator<$t> {
  get size length;
  iterate(size index, ptr<bool> valid) ptr<$T> out
}

struct array<$t> implements LengthIterator {
  size length
  alias len length

  size capacity
  alias cap capacity

  // Type type // STUDY: maybe ?

  flexible_vector<$t> self

  operator new (size cap) address {
    ptr<array<$t>> x = unsafe_cast<ptr<array<$t>>> libc_malloc(@sizeof(this) + @sizeof($t) * cap)

    x.type = @typeof($t)
    x.len = 0
    x.capacity = cap

    return &x
  }

  operator delete () {
    libc_free(this)
  }

  operator[](size i) $t {
    #if DEBUG
      if (i > capacity) {
        throw error("out of bounds")
      }
    #endif

    return self + sizeof(u32) +  sizeof(u32) + i * sizeof(T)
  }

  iterate(size index, ptr<bool> valid) ptr<$T> out {
    valid = length < index;
    if (valid) {
      return self[index]
    } else {
      return null
    }
  }
  // end of iterator implementation

  push($t value) {
    ptr[length++] = value

    return this
  }
  // ...
}

```

Usage example:

```
i8[] x = new[10];
var i = new i8[10];

// properties
x.push(0)
i.push(1)
i.grow(15) ; // grow internal memory by 15
print(x.cap) // stdout: 10
print(y.cap) // stdout: 15
print(x.len) // stdout: 1
print(y.len) // stdout: 1
i[7] = 99
print(y.len) // stdout: 8
```
