# keywords

*Syntax*

```syntax
keywords
  // Type system
  : 'type'
  | 'struct'
  | 'noalign'
  | 'lean'
  | 'enum'
  | 'mask'
  | 'extends'
  | 'implements'
  | 'interface'
  | 'is'
  | 'any'
  | 'self'
  | 'hoist'
  | 'readonly'
  | 'instanceof'
  | 'static'
  // constants
  | 'true'
  | 'false'
  | 'null'
  // variables
  | 'var'
  | 'const'
  | 'global'
  | 'package'
  // functions
  | 'function'
  | 'pure'
  | 'operator'
  | 'return'
  | 'alias'
  | 'get'
  | 'set'
  | 'autocast'
  | 'defer'
  | 'out'
  | 'override'
  | 'overwrite'
  // Control flow
  | 'if'
  | 'else'
  | 'switch'
  | 'case'
  | 'fallthrough'
  | 'goto'
  | 'loop'
  | 'where'
  | 'foreach'
  | 'for'
  | 'do'
  | 'while'
  | 'until'
  | 'continue'
  | 'restart'
  | 'break'
  | 'in'
  | 'default'
  // memory
  | 'clone'
  | 'new'
  | 'delete'
  | 'lend'
  | 'own'
  | 'uninitialized'
  | 'at'
  | 'cast'
  // error handling
  | 'try'
  | 'retry'
  | 'catch'
  | 'finally'
  | 'throw'
  // Operators
  | 'not'
  | 'and'
  | 'or'
  // package system
  | 'import'
  | 'as'
  // unit-test
  | 'test'
  | 'mock'
  ;
```

*Constrains*

1. The identifiers shown above are reserved for use as keywords. Some maybe be used as identifiers.