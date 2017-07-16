const EventEmitter = require('../');
const assume       = require('assume');

describe('EventEmitter', () => {

    it('exposes a module namespace object', () => {
        assume(EventEmitter.EventEmitter).equals(EventEmitter);
    });

    it('inherits when used with `require("util").inherits`', () => {

        class Beast extends EventEmitter {
        }

        require('util').inherits(Beast, EventEmitter);

        var moop   = new Beast()
            , meap = new Beast();

        assume(moop).is.instanceOf(Beast);
        assume(moop).is.instanceOf(EventEmitter);

        moop.listeners();
        meap.listeners();

        moop.on('data', () => {
            throw new Error('I should not emit');
        });

        meap.emit('data', 'rawr');
        meap.removeListener('foo');
        meap.removeAllListeners();
    });

    if ('undefined' !== typeof Symbol) it('works with ES6 symbols', next => {
        const e       = new EventEmitter();
        const event   = Symbol('cows');
        const unknown = Symbol('moo');

        e.on(event, arg => {
            assume(e.listeners(unknown).length).equals(0);
            assume(arg).equals('bar');

            e.once(unknown, onced => {
                assume(e.listeners(unknown).length).equals(0);
                assume(onced).equals('foo');
                next();
            });

            assume(e.listeners(event).length).equals(1);
            assume(e.listeners(unknown).length).equals(1);

            e.removeListener(event);
            assume(e.listeners(event).length).equals(0);
            assume(e.emit(unknown, 'foo')).equals(true);
        });

        assume(e.emit(unknown, 'bar')).equals(false);
        assume(e.emit(event, 'bar')).equals(true);
    });

    describe('EventEmitter#emit', () => {

        it('should return false when there are not events to emit', () => {
            const e = new EventEmitter();

            assume(e.emit('foo')).equals(false);
            assume(e.emit('bar')).equals(false);
        });

        it('can emit the function with multiple arguments', () => {
            const e = new EventEmitter();
            for (let i = 0; i < 100; i++) {
                (j => {
                    let args = [];
                    for (let i = 0; i < j; i++) {
                        args.push(j);
                    }

                    e.once('args', function () {
                        assume(arguments.length).equals(args.length);
                    });

                    e.emit.apply(e, ['args'].concat(args));
                })(i);
            }
        });

        it('can emit the function with multiple arguments, multiple listeners', () => {
            const e = new EventEmitter();

            for (let i = 0; i < 100; i++) {
                (j => {
                    let args = [];
                    for (let i = 0; i < j; i++) {
                        args.push(j);
                    }

                    e.once('args', function () {
                        assume(arguments.length).equals(args.length);
                    });

                    e.once('args', function () {
                        assume(arguments.length).equals(args.length);
                    });

                    e.once('args', function () {
                        assume(arguments.length).equals(args.length);
                    });

                    e.once('args', function () {
                        assume(arguments.length).equals(args.length);
                    });

                    e.emit.apply(e, ['args'].concat(args));
                })(i);
            }
        });

        it('should return true when there are events to emit', function () {
            var e        = new EventEmitter()
                , called = 0;

            e.on('foo', function () {
                called++;
            });

            assume(e.emit('foo')).equals(true);
            assume(e.emit('foob')).equals(false);
            assume(called).equals(1);
        });

        it('receives the emitted events', done => {
            var e = new EventEmitter();

            e.on('data', function (a, b, c, d, undef) {
                assume(a).equals('foo');
                assume(b).equals(e);
                assume(c).is.instanceOf(Date);
                assume(undef).equals(undefined);
                assume(arguments.length).equals(3);

                done();
            });

            e.emit('data', 'foo', e, new Date());
        });

        it('emits to all event listeners', () => {
            var e         = new EventEmitter()
                , pattern = [];

            e.on('foo', function () {
                pattern.push('foo1');
            });

            e.on('foo', function () {
                pattern.push('foo2');
            });

            e.emit('foo');

            assume(pattern.join(';')).equals('foo1;foo2');
        });

        (function each(keys) {
            var key = keys.shift();

            if (!key) return;

            it('can store event which is a known property: ' + key, next => {
                var e = new EventEmitter();

                e.on(key, k => {
                    assume(k).equals(key);
                    next();
                }).emit(key, key);
            });

            each(keys);
        })([
            'hasOwnProperty',
            'constructor',
            '__proto__',
            'toString',
            'toValue',
            'unwatch',
            'watch'
        ]);
    });

    describe('EventEmitter#listeners', () => {
        it('returns an empty array if no listeners are specified', () => {
            const e = new EventEmitter();

            assume(e.listeners('foo')).is.a('array');
            assume(e.listeners('foo').length).equals(0);
        });

        it('returns an array of function', () => {
            const e = new EventEmitter();

            function foo() {
            }

            e.on('foo', foo);
            assume(e.listeners('foo')).is.a('array');
            assume(e.listeners('foo').length).equals(1);
            assume(e.listeners('foo')).deep.equals([foo]);
        });

        it('is not vulnerable to modifications', () => {
            const e = new EventEmitter();

            function foo() {
            }

            e.on('foo', foo);

            assume(e.listeners('foo')).deep.equals([foo]);

            e.listeners('foo').length = 0;
            assume(e.listeners('foo')).deep.equals([foo]);
        });

        it('can return a boolean as indication if listeners exist', () => {
            const e = new EventEmitter();

            function foo() {
            }

            e.once('once', foo);
            e.once('multiple', foo);
            e.once('multiple', foo);
            e.on('on', foo);
            e.on('multi', foo);
            e.on('multi', foo);

            assume(e.listeners('foo', true)).equals(false);
            assume(e.listeners('multiple', true)).equals(true);
            assume(e.listeners('on', true)).equals(true);
            assume(e.listeners('multi', true)).equals(true);

            e.removeAllListeners();

            assume(e.listeners('multiple', true)).equals(false);
            assume(e.listeners('on', true)).equals(false);
            assume(e.listeners('multi', true)).equals(false);
        });
    });

    describe('EventEmitter#once', () => {

        it('only emits it once', () => {
            const e   = new EventEmitter();
            let calls = 0;

            e.once('foo', function () {
                calls++;
            });

            e.emit('foo');
            e.emit('foo');
            e.emit('foo');
            e.emit('foo');
            e.emit('foo');

            assume(e.listeners('foo').length).equals(0);
            assume(calls).equals(1);
        });

        it('only emits once if emits are nested inside the listener', () => {
            const e   = new EventEmitter();
            let calls = 0;

            e.once('foo', () => {
                calls++;
                e.emit('foo');
            });

            e.emit('foo');
            assume(e.listeners('foo').length).equals(0);
            assume(calls).equals(1);
        });

        it('only emits once for multiple events', () => {
            const e   = new EventEmitter();
            let multi = 0;
            let foo   = 0;
            let bar   = 0;

            e.once('foo', () => {
                foo++;
            });

            e.once('foo', () => {
                bar++;
            });

            e.on('foo', () => {
                multi++;
            });

            e.emit('foo');
            e.emit('foo');
            e.emit('foo');
            e.emit('foo');
            e.emit('foo');

            assume(e.listeners('foo').length).equals(1);
            assume(multi).equals(5);
            assume(foo).equals(1);
            assume(bar).equals(1);
        });

    });

    describe('EventEmitter#removeListener', () => {
        it('removes all listeners when the listener is not specified', () => {
            const e = new EventEmitter();

            e.on('foo', () => {
            });
            e.on('foo', () => {
            });

            assume(e.removeListener('foo')).equals(e);
            assume(e.listeners('foo')).eql([]);
        });

        it('removes only the listeners matching the specified listener', () => {
            const e = new EventEmitter();

            function foo() {
            }

            function bar() {
            }

            function baz() {
            }

            e.on('foo', foo);
            e.on('bar', bar);
            e.on('bar', baz);

            assume(e.removeListener('foo', bar)).equals(e);
            assume(e.listeners('bar')).eql([bar, baz]);
            assume(e.listeners('foo')).eql([foo]);
            assume(e._eventsCount).equals(2);

            assume(e.removeListener('foo', foo)).equals(e);
            assume(e.listeners('bar')).eql([bar, baz]);
            assume(e.listeners('foo')).eql([]);
            assume(e._eventsCount).equals(1);

            assume(e.removeListener('bar', bar)).equals(e);
            assume(e.listeners('bar')).eql([baz]);
            assume(e._eventsCount).equals(1);

            assume(e.removeListener('bar', baz)).equals(e);
            assume(e.listeners('bar')).eql([]);
            assume(e._eventsCount).equals(0);

            e.on('foo', foo);
            e.on('foo', foo);
            e.on('bar', bar);

            assume(e.removeListener('foo', foo)).equals(e);
            assume(e.listeners('bar')).eql([bar]);
            assume(e.listeners('foo')).eql([]);
            assume(e._eventsCount).equals(1);
        });

        it('removes only the once listeners when using the once flag', () => {
            const e = new EventEmitter();

            function foo() {
            }

            e.on('foo', foo);

            assume(e.removeListener('foo', () => {
            }, true)).equals(e);
            assume(e.listeners('foo')).eql([foo]);
            assume(e._eventsCount).equals(1);

            assume(e.removeListener('foo', foo, true)).equals(e);
            assume(e.listeners('foo')).eql([foo]);
            assume(e._eventsCount).equals(1);

            assume(e.removeListener('foo', foo)).equals(e);
            assume(e.listeners('foo')).eql([]);
            assume(e._eventsCount).equals(0);

            e.once('foo', foo);
            e.on('foo', foo);

            assume(e.removeListener('foo', () => {
            }, true)).equals(e);
            assume(e.listeners('foo')).eql([foo, foo]);
            assume(e._eventsCount).equals(1);

            assume(e.removeListener('foo', foo, true)).equals(e);
            assume(e.listeners('foo')).eql([foo]);
            assume(e._eventsCount).equals(1);

            e.once('foo', foo);

            assume(e.removeListener('foo', foo)).equals(e);
            assume(e.listeners('foo')).eql([]);
            assume(e._eventsCount).equals(0);
        });

    });

    describe('EventEmitter#removeAllListeners', function () {
        it('removes all events for the specified events', function () {
            const e = new EventEmitter();

            e.on('foo', () => {
                throw new Error('oops');
            });
            e.on('foo', () => {
                throw new Error('oops');
            });
            e.on('bar', () => {
                throw new Error('oops');
            });
            e.on('aaa', () => {
                throw new Error('oops');
            });

            assume(e.removeAllListeners('foo')).equals(e);
            assume(e.listeners('foo').length).equals(0);
            assume(e.listeners('bar').length).equals(1);
            assume(e.listeners('aaa').length).equals(1);
            assume(e._eventsCount).equals(2);

            assume(e.removeAllListeners('bar')).equals(e);
            assume(e._eventsCount).equals(1);
            assume(e.removeAllListeners('aaa')).equals(e);
            assume(e._eventsCount).equals(0);

            assume(e.emit('foo')).equals(false);
            assume(e.emit('bar')).equals(false);
            assume(e.emit('aaa')).equals(false);
        });

        it('just nukes the fuck out of everything', () => {
            const e = new EventEmitter();

            e.on('foo', () => {
                throw new Error('oops');
            });
            e.on('foo', () => {
                throw new Error('oops');
            });
            e.on('bar', () => {
                throw new Error('oops');
            });
            e.on('aaa', () => {
                throw new Error('oops');
            });

            assume(e.removeAllListeners()).equals(e);
            assume(e.listeners('foo').length).equals(0);
            assume(e.listeners('bar').length).equals(0);
            assume(e.listeners('aaa').length).equals(0);
            assume(e._eventsCount).equals(0);

            assume(e.emit('foo')).equals(false);
            assume(e.emit('bar')).equals(false);
            assume(e.emit('aaa')).equals(false);
        });
    });

    describe('EventEmitter#eventNames', () => {
        it('returns an empty array when there are no events', () => {
            const e = new EventEmitter();

            assume(e.eventNames()).eql([]);

            e.on('foo', () => {
            });
            e.removeAllListeners('foo');

            assume(e.eventNames()).eql([]);
        });

        it('returns an array listing the events that have listeners', () => {
            const e = new EventEmitter();
            let original;

            function bar() {
            }

            if (Object.getOwnPropertySymbols) {
                //
                // Monkey patch `Object.getOwnPropertySymbols()` to increase coverage
                // on Node.js > 0.10.
                //
                original                     = Object.getOwnPropertySymbols;
                Object.getOwnPropertySymbols = undefined;
            }

            e.on('foo', () => {
            });
            e.on('bar', bar);

            try {
                assume(e.eventNames()).eql(['foo', 'bar']);
                e.removeListener('bar', bar);
                assume(e.eventNames()).eql(['foo']);
            } catch (ex) {
                throw ex;
            } finally {
                if (original) Object.getOwnPropertySymbols = original;
            }
        });

        it('does not return inherited property identifiers', () => {
            const e = new EventEmitter();

            function Collection() {
            }

            Collection.prototype.foo = function () {
                return 'foo';
            };

            e._events = new Collection();

            assume(e._events.foo()).equal('foo');
            assume(e.eventNames()).eql([]);
        });

        if ('undefined' !== typeof Symbol) it('includes ES6 symbols', () => {
            const e = new EventEmitter();
            const s = Symbol('s');

            function foo() {
            }

            e.on('foo', foo);
            e.on(s, () => {
            });

            assume(e.eventNames()).eql(['foo', s]);

            e.removeListener('foo', foo);

            assume(e.eventNames()).eql([s]);
        });
    });

    describe('EventEmitter#setMaxListeners', () => {
        it('is a function', () => {
            const e = new EventEmitter();

            assume(e.setMaxListeners).is.a('function');
        });

        it('returns self when called', () => {
            const e = new EventEmitter();

            assume(e.setMaxListeners()).to.equal(e);
        });
    });
});
