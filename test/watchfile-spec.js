var fspath = require('path')
  , assert = require('assert')
  , mocha = require('mocha')
  , Gently = require('gently')
  , watchfile = require('../lib/watchfile')
  , Watchfile = watchfile.Watchfile
  
describe('Watchfile', function() {
    it('should define Watchfile', function() {
        assert.equal(typeof(Watchfile), 'function')
    })
    
    describe('constructor', function() {
        var file = fspath.join(__dirname, 'f')
          , w = new Watchfile(file)
        
        it('should store watchfile path', function() {
            assert.equal(w.file, file)
        })
        
        it('should set root path to dirname(watchfile)', function() {
            assert.equal(w.path, __dirname)
        })
        
        it('should initialize entries with self watcher', function() {
            assert.equal(typeof(w.entries), 'object')
            assert.equal(w.entries.length, 1)
// XXX
//            assert.equal(w.entries[0].fullpath, file)
        })
        
        it('should default watchfile to ./Watchfile')
    })
    
    describe('load()', function() {
        it('should emit ENOENT when input is not found', function(done) {
            var w = new Watchfile('bogus')
            
            w.on('error', function(err) {
                assert.equal(err.code, 'ENOENT')
                done()
            })
            
            w.load()
        })
        
        it('should emit EISDIR when input is not a file', function(done) {
            var w = new Watchfile(__dirname)
            
            w.on('error', function(err) {
                assert.equal(err.code, 'EISDIR')
                done()
            })
            
            w.load()
        })
        
        it('should call parse() on successful read', function(done) {
            var w = new Watchfile(__filename)
              , g = new Gently()
            
            g.expect(w, 'parse', function(data) {
                assert.equal(typeof(data), 'string')
                g.verify()
                done()
            })
            
            w.load()
        })
        
        it('should emit ready when done', function(done) {
            var w = new Watchfile()
              , g = new Gently()
            
            g.expect(w, 'parse', 1, function(data) {})
            w.on('ready', function() { done() })
            
            w.load()
        })
    })
    
    describe('parse()', function() {
        var w
        
        beforeEach(function() { w = new Watchfile() })
        
        it('should do nothing with empty input', function() {
            var len = w.entries.length
            
            w.on('entry', function() { assert.fail('unexpected entry added') })
            
            w.parse('')
            assert.equal(w.entries.length, len)
            
            w.parse(' ')
            assert.equal(w.entries.length, len)
            
            w.parse('\n')
            assert.equal(w.entries.length, len)
            
            w.parse('# nothing\n# but\s #comments\n')
            assert.equal(w.entries.length, len)
        })
        
        it('should aggregate continued rules', function() {
            var g = new Gently(), rule = ['line 1', 'line 2', 'line 3']
            
            g.expect(w, 'parseRule', 1, function(r) {
                assert.equal(r, rule.join(' '))
            })
            
            w.parse(rule.join('\\\n\t'))
            g.verify()
        })
        
        it('should call parseRule() for each rule read', function() {
            var g = new Gently(), rules = ['rule 1', 'rule 2']

            g.expect(w, 'parseRule', rules.length, function(rule) {
                assert.equal(rule, rules.shift())
            })
            
            w.parse(rules.join('\n'))
            g.verify()
        })
    })
    
    describe('parseRule()', function() {
        var w
        
        beforeEach(function() { w = new Watchfile() })
        
        it('should emit Error if rule is mal-formed', function(done) {
            var rule = 'bad rule'
            
            w.on('error', function(err) {
                assert.equal(err.message, 'Invalid watch rule: '+rule)
                done()
            })

            w.parseRule('bad rule')
        })
        
        it('should call addEntry() with path, cmd', function() {
            var rule = 'watch-path: watch-cmd'
              , g = new Gently()
            
            g.expect(w, 'addEntry', function(path, cmd) {
                assert.equal(path, 'watch-path')
                assert.equal(cmd, 'watch-cmd')
            })
            
            w.parseRule(rule)
            g.verify()
        })
    }),
    
    describe('addEntry()', function() {
        var w, file = 'f', fn = 'c', wf = fspath.join(__dirname, 'w')
        
        beforeEach(function() { w = new Watchfile(wf) })
        
        it('should add and emit entry', function(done) {
            var len = w.entries.length
            
            w.on('entry', function(e) {
                assert.equal(typeof(e), 'object')
                assert.ok(e instanceof watchfile.Entry)
                assert.strictEqual(e, w.entries[len])
                done() 
            })
            
            w.addEntry(file, fn)
        })
        
        it('should set fn, path and fullpath on entry', function(done) {
            var full = fspath.join(__dirname, file)
            
            w.on('entry', function(e) {
                assert.equal(e.fn, fn)
                assert.equal(e.path, file)
                assert.equal(e.fullpath, full)
                done() 
            })
            
            w.addEntry(file, fn)
        })
    })
})
