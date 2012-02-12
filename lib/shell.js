var child = require('child_process')
  , _ = require('underscore')

// ------------------------------------------------------------------------

exports.Shell = Shell

// ------------------------------------------------------------------------

function Shell(cwd, cmd) {
    this.cwd = cwd
    this.cmd = cmd

    this.exec = function() {
        console.error('EXEC:', cmd, 'in', cwd)
        var p = child.spawn('/bin/sh', ['-c', cmd], {
            cwd: cwd
        })
        
        p.stdout.on('data', _.bind(out, null, console.log))
        p.stderr.on('data', _.bind(out, null, console.error))
        
        function out(fn, buf) {
            var args = [].slice.call(arguments, 1)
              , str = buf.toString('utf-8')
            fn.call(this, str)
        }
    }
}

// ------------------------------------------------------------------------
