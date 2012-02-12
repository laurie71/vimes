# vimes: Commander of the Watch

`vimes` is a command-line utility that monitors files and directories
for changes, and triggers execution of user-defined commands according
to what changed. What to watch, and what to do when changes are detected,
is specified in a simple configuration file (`./Watchfile` by default).

`vimes` was inspired by [watchr][], but is platform agnostic and uses
standard UNIX shell commands to specify actions.

## Installation

`vimes` requires [Node][] (version 0.6 or above). Once that is installed,
`vimes` is installed with Node's `npm` command:

    npm install -g vimes

## Getting Started

`vimes` reads a configuration file (`./Watchfile` by default)

## Documentation

`vimes` ships with `man` pages:

    man vimes vimes-watchfile

Also available [online](https://github.com/lharper71/vimes/raw/docs).

## Support

If you have questions about how to use `vimes`; suggestions on how to 
improve it; or think you've found a bug: post it to the [issue tracker][issues].

## License

`vimes` is released under an MIT license; see
[LICENSE.txt](LICENSE.txt) for details.

---

[Node]:     http://nodejs.org/
[watchr]:   https://github.com/mynyml/watchr/
[issues]:   http://github.com/lharper71/vimes/issues/