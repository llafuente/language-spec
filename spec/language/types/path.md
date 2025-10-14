# Path (URI)

Path is a specialization type of string.

These means it contains a method specialization but the underlying type is the same and interchangeable.

The path is OS independent because a [https://en.wikipedia.org/wiki/Uniform_Resource_Identifier](URI - Uniform Resource Identifier) must be used.

```language
var path x = "file://c/windows/system32"
var path y = "file://media/dev1/desktop"
```

With this we try to unify all access to file information from web request to filesystem.


URI parts, usage per scheme inside fs operations.

| scheme          | authority  | path | query                     |fragment |
|-----------------|------------|------|---------------------------|---------|
| fs              | ignored    | used | used for quick operations | ignored |
| http/https/ftp  | used       | used | used                      | ignored |


Methods

* resolve
* resolve_glob
* join

* abspath: 
	Return a normalized absolutized version of the pathname path.
* basename
  Return the base name of pathname path. This is the second element of the pair returned by passing path to the function split().
* dirname
* extension
* get_parts
* is_glob
<!--
	https://docs.python.org/3/library/os.path.html
	https://docs.python.org/3/library/pathlib.html#module-pathlib
-->




```language
function main() {
	fs.file.get("/c/file.txt?grep=xxx")
	fs.file.get("/c/file.json?pick=dependencies")
	fs.file.append("/c/file.text", "new line\n")
	fs.file.write("/c/file.text", "new line\n", create = true)

	fs.file.get("http://www.google.com")
	fs.file.get("http://www.google.com", headers = ["Accept: application/json"])
	fs.file.post("http://www.google.com", headers = ["Accept: application/json"], body = `{"message": "xxx"}`)


	fs.file.post("http://www.google.com", headers = ["Accept: application/json"], body = `{"message": "xxx"}`, auth = basic_auth)

	var credentials = new BasicAuth(user = "john", password = "Doe")
	fs.file.get("http://www.mybank.com", auth = credentials)

	var credentials = new SSLCertificateAuth(key = "/c/file.pem", ssltype = "PEM", crt="/c/file.crt", keypassword = "xxx")
	fs.file.get("http://www.mybank.com", auth = credentials)


	fs.file.post("http://www.google.com").pipe(fs.stream.create("/c/download.html"))
	fs.file.post("http://www.google.com").pipe(app.stdout)
	fs.file.post("http://www.google.com").pipe(app.stderr)

	fs.file.read_line(app.stdin)
	fs.file.eot_read(app.stdin)
}

```
<!-- 

	stdin - "\x04"
	https://en.wikipedia.org/wiki/End-of-Transmission_character

	app.
	stdin|stderr|stdout
		is_closed
	stdin
		read
		read_line(end_char = os.endline)
		read_char
		read_rune
	stderr|stdout
		write
-->


fs operations

| Methods                                    | Return type            | Supported schemes | Coments | 
|--------------------------------------------|------------------------|-------------------|---------|
| get(uri)                                   | optional&gtstring%lt   | fs,http,https,ftp |         |
| read(uri)                                  | readable_stream        | fs,http,https,ftp |         |
| post(uri, body)                            | optional&gtstring%lt   | fs,http,https,ftp |         |
| write(uri)                                 | writable_stream        | fs,http,https,ftp |         |
| append(uri, body)                          | bool                   | fs                |         |
| query(uri)                                 | readable_stream        | http,https,ftp    | This is the way to send custom verbs         |
| copy(uri)                                  | bool                   | fs                |         |
| move(uri)                                  | bool                   | fs                |         |
| stats(uri)                                 | file_stats             | fs                |         |
| list(uri)                                  | uri\[]                 | fs(directory)     |         |



get / read
post / write
append (fs only)


fs
* uri
* admin
* response (contents)
* attributes
  * type: file, symlink, folder
  * hidden
* permissions
* access_date
* modified_date
* creation_date
* locked

web
* uri
* verb
* headers
* body
* response (contents, statusCode, headers)


<!--
	things to solve: https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=registry
-->