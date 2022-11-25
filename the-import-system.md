# The import system
<!--
  https://docs.python.org/3/reference/import.html
-->
A package or main gain access to another package contents by importing it's
contents.

The statement that allow it is: `import`.

There are two syntax for import.

> #import package version

This can be used *ONLY* in your `entry point file` and define the version that the
rest of the application will use.

>#import package [as identifier]

This import a file and optionally give it a name.

If you don't specify a name the entire package will be available directly.

If you specify a name the entire package will be under that "namespace".

Importing a file/package don't give you access to what they had imported.


## Extracting dependencies

This will export all import with versions.

> compiler dump-imports index.src -output json

## Dependency graph

## Implementation notes

Import resolution:

> import x.y.z

Will resolve in:

* ./x.y.z.src
* ./x/y.z.src
* ./x/y/z.src
* &lt;lib-path&gt;/x/y/z/index.src
* &lt;core-path&gt;/x/y/z/index.src

So any package in your project has higher priority than lib, then core.

That allows you to override any lib/core package if needed because the
resolution is base on the `entry point file` and not in the current file that
imports.
