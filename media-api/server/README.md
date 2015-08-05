#Server proxy for MediaAPI

A simple http server that protects the copyrighted media from prying eyes.

## Installation

`go build serve.go` will build a binary natively. Use `compile-for-linux.sh` to
create a binary that will run on our VMs. You might need to (reinstall go)[1]
to do this.

There are no external dependencies for this project.

## Usage

The service looks for two environment variables at runtime:

* `MEDIASCAPE_API`: the key to be used in order to access media. Non-authorised
  requests return a 401 status code.
* `MEDIASCAPE_PORT`: the port number the server will listen on. Defaults to
  `17901` (why not?).

[1]: http://stackoverflow.com/questions/12168873/cross-compile-go-on-osx
