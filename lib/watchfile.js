var watchfile = module.exports
  , Shell = require('./shell').Shell
  , utils = require('util')
  , events = require('events')
  , fspath = require('path')
  , fs = require('fs')
  , _ = require('underscore')

// ------------------------------------------------------------------------

watchfile.Entry = Entry
watchfile.Watchfile = Watchfile

// ------------------------------------------------------------------------

var COMMENT_RE = /\s*#.*$/
  , PATH_CMD_RE = /^([^:]+)\s*:\s*(.*)$/
  
// ------------------------------------------------------------------------

function Entry(root, path, fn) {
    this.root = root
    this.path = path
    this.fn   = fn
    this._w   = null
    
    if (typeof(this.fn) != 'function') throw new TypeError('xxx')
    this.fullpath = fspath.resolve(root, path)
}

utils.inherits(Entry, events.EventEmitter)

_.extend(Entry.prototype, {
    watch: function() {
        console.error('[watch]', this.fullpath)
        if (this._w) return // (already watching)
        this._w = fs.watch(this.fullpath, _.bind(this.fn, this))
    },
    
    unwatch: function() {
        console.error('[unwatch]', this.fullpath)
        this._w && this._w.close()
        this._w = null
    }
})

// ------------------------------------------------------------------------

function Watchfile(file) {
    var that = this
    
    events.EventEmitter.apply(this, arguments)
    this.file = file || Watchfile.DEFAULT
    this.path = fspath.dirname(file)
    this.entries = []
that.on('entry', function(e) { console.error('ENTRY', e.fullpath) })
    watch()
    
    function watch() {
        console.error('WATCH')
        that.addEntry(that.file, reload).watch()
    }
    
    function unwatch() {
        console.error('UNWATCH')
        _(that.entries).each(function(entry) { entry.unwatch() })
        that.entries = []
    }
    
    function reload(event, filename) {
        console.error('RELOAD', arguments, new Error('stack').stack)
        // // TODO: handle file renames
        // if (event == 'rename') {
        //     if (!filename) {
        //         return this.emit('error', new Error('lost watchfile: '+file))
        //     }
        //     this.file = filename
        //     this.path = fspath.dirname(file)
        // }
        unwatch()
        watch()
        that.load()
    }
}

utils.inherits(Watchfile, events.EventEmitter)

_.extend(Watchfile, {
    DEFAULT: 'Watchfile'
})

_.extend(Watchfile.prototype, {
    load: function() {
        fs.readFile(this.file, 'utf-8', _.bind(onRead, this))
        
        function onRead(err, data) {
            if (err) return this.emit('error', err)
            this.parse(data)
            this.emit('ready')
        }
    },
    
    parse: function(text) {
        var rule = ''
        _(text.split('\n')).each(function(line) {
            // aggregate lines into a rule
            rule += line.trim()
            if (rule[rule.length - 1] == '\\') {
                // continued line
                rule = rule.slice(0, -1).trim() + ' '
                return
            }
            
            // pass aggregated rule to parseRule(),
            // skipping blank lines and comments,
            // and reset for next rule
            if (!rule || COMMENT_RE.test(rule)) return
            this.parseRule(rule)
            rule = ''
        }, this)
    },
    
    parseRule: function(rule) {
        var match, path, cmd, shell
        
        // split rule into path / command and add new entry
        match = PATH_CMD_RE.exec(rule)
        if (!match) return this.emit('error', new TypeError(
            'Invalid watch rule: '+rule))
        path = match[1]
        cmd = match[2]
        
        // wrap cmd into a shell exec
        shell = new Shell(this.path, cmd)
        this.addEntry(path, shell.exec)
    },
    
    addEntry: function(path, fn) {
        var entry = new Entry(this.path, path, fn)
        entry.watch()
        
        this.entries.push(entry)
        this.emit('entry', entry)
        
        return entry
    }
})

// ------------------------------------------------------------------------
