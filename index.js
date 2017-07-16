const has = Object.prototype.hasOwnProperty;

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {
}
Events.prototype = Object.create(null);

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
class EE {
    constructor(fn, once) {
        this.fn   = fn;
        this.once = once || false;
    }
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, once) {
    let listener = new EE(fn, once);
    if (!emitter._events[event]) {
        emitter._events[event] = listener;
        emitter._eventsCount++;
    } else if (!emitter._events[event].fn) {
        emitter._events[event].push(listener);
    } else {
        emitter._events[event] = [emitter._events[event], listener];
    }
    return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) {
        emitter._events = new Events();
    } else {
        delete emitter._events[evt];
    }
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
class EventEmitter {

    constructor() {
        this._events      = new Events();
        this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @public
     */
    eventNames() {
        let names = [];
        let events;
        let name;
        if (this._eventsCount === 0) {
            return names;
        }
        for (name in (events = this._events)) {
            if (has.call(events, name)) {
                names.push(name);
            }
        }
        if (Object.getOwnPropertySymbols) {
            return names.concat(Object.getOwnPropertySymbols(events));
        }
        return names;
    };

    /**
     * Return the listeners registered for a given event.
     *
     * @param {(String|Symbol) = null} event The event name.
     * @param {Boolean = null} exists Only check if there are listeners.
     * @returns {(Array|Boolean)}
     * @public
     */
    listeners(event, exists) {
        const available = this._events[event];
        if (exists) {
            return !!available;
        }
        if (!available) {
            return [];
        }
        if (available.fn) {
            return [available.fn];
        }
        const res = new Array(available.length);
        for (let i = 0; i < res.length; i++) {
            res[i] = available[i].fn;
        }
        return res;
    }


    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {* = null} a1
     * @param {* = null} a2
     * @param {* = null} a3
     * @param {* = null} a4
     * @param {* = null} a5
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @public
     */
    emit(event, a1, a2, a3, a4, a5) {
        let listeners = this._events[event];
        if (!listeners) {
            return false;
        }
        let len = arguments.length;
        let args, j, i;
        if (listeners.fn) {
            if (listeners.once) {
                this.removeListener(event, listeners.fn, true);
            }
            switch (len) {
                case 1:
                    return listeners.fn(), true;
                case 2:
                    return listeners.fn(a1), true;
                case 3:
                    return listeners.fn(a1, a2), true;
                case 4:
                    return listeners.fn(a1, a2, a3), true;
                case 5:
                    return listeners.fn(a1, a2, a3, a4), true;
                case 6:
                    return listeners.fn(a1, a2, a3, a4, a5), true;
            }
            args = new Array(len - 1);
            for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
            }
            listeners.fn.apply(undefined, args);
        } else {
            for (i = 0; i < listeners.length; i++) {
                if (listeners[i].once) {
                    this.removeListener(event, listeners[i].fn, true);
                }
                switch (len) {
                    case 1:
                        listeners[i].fn();
                        break;
                    case 2:
                        listeners[i].fn(a1);
                        break;
                    case 3:
                        listeners[i].fn(a1, a2);
                        break;
                    case 4:
                        listeners[i].fn(a1, a2, a3);
                        break;
                    case 5:
                        listeners[i].fn(a1, a2, a3, a4);
                        break;
                    case 6:
                        listeners[i].fn(a1, a2, a3, a4, a5);
                        break;
                    default:
                        if (!args) {
                            args = new Array(len - 1);
                            for (j = 1; j < len; j++) {
                                args[j - 1] = arguments[j];
                            }
                        }
                        listeners[i].fn.apply(undefined, args);
                }
            }
        }
        return true;
    }

    /**
     * Add a listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @returns {EventEmitter} `this`.
     * @public
     */
    on(event, fn) {
        return addListener(this, event, fn, false);
    }

    /**
     * Add a one-time listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @returns {EventEmitter} `this`.
     * @public
     */
    once(event, fn) {
        return addListener(this, event, fn, true);
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function = null} fn Only remove the listeners that match this function.
     * @param {Boolean = null} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @public
     */
    removeListener(event, fn, once) {
        const listeners = this._events[event];
        if (!listeners) {
            return this;
        }
        if (!fn) {
            clearEvent(this, event);
            return this;
        }
        if (listeners.fn) {
            if (
                listeners.fn === fn &&
                (!once || listeners.once)
            ) {
                clearEvent(this, event);
            }
        } else {
            const events = listeners.filter(l => l.fn !== fn || (once && !l.once));
            //
            // Reset the array, or remove it completely if we have no more listeners.
            //
            if (events.length) {
                this._events[event] = events.length === 1 ? events[0] : events;
            } else {
                clearEvent(this, event);
            }
        }
        return this;
    }

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {(String|Symbol)} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @public
     */
    removeAllListeners(event) {
        if (event) {
            if (this._events[event]) {
                clearEvent(this, event);
            }
        } else {
            this._events      = new Events();
            this._eventsCount = 0;
        }
        return this;
    }

    /**
     *
     * @returns {EventEmitter}
     */
    setMaxListeners() {
        return this;
    }
}


//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off         = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

module.exports = EventEmitter;

