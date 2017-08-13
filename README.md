# event-emitter3 fork of EventEmitter3

EventEmitter3 is a high performance EventEmitter. It has been micro-optimized
for various of code paths making this, one of, if not the fastest EventEmitter
available for Node.js. The module is API compatible with the
EventEmitter that ships by default with Node.js but there are some slight
differences:

- Domain support has been removed.
- We do not `throw` an error when you emit an `error` event and nobody is
  listening.
- The `newListener` event is removed as the use-cases for this functionality are
  really just edge cases.
- No `setMaxListeners` and its pointless memory leak warnings. If you want to
  add `end` listeners you should be able to do that without modules complaining.
- No `listenerCount` method. Use `EE.listeners(event).length` instead.
- The `listeners` method can do existence checking instead of returning only
  arrays.
- The `removeListener` method removes all matching listeners, not only the
  first.

It's a drop in replacement for existing EventEmitters, but just faster. Free
performance, who wouldn't want that? The EventEmitter is written in EcmaScript 3
so it will work in the oldest browsers and node versions that you need to
support.

## Installation

```bash
$ npm install --save event-emitter3
```


## Usage

After installation the only thing you need to do is require the module:

```js
var EventEmitter = require('event-emitter3');
```

And you're ready to create your own EventEmitter instances. For the API
documentation, please follow the official Node.js documentation:

http://nodejs.org/api/events.html

### Existence

To check if there is already a listener for a given event you can supply the
`listeners` method with an extra boolean argument. This will transform the
output from an array, to a boolean value which indicates if there are listeners
in place for the given event:

```js
var EE = new EventEmitter();
EE.once('event-name', function () {});
EE.on('another-event', function () {});

EE.listeners('event-name', true); // returns true
EE.listeners('unknown-name', true); // returns false
```

### Tests and benchmarks

This module is well tested. You can run:

- `npm test` to run the tests under Node.js.

We also have a set of benchmarks to compare EventEmitter3 with some available
alternatives. To run the benchmarks run `npm run benchmark`.

Tests and benchmarks are not included in the npm package. If you want to play
with them you have to clone the GitHub repository.

## License

[MIT](LICENSE)
