'use strict';

/**
 * Benchmark related modules.
 */
var benchmark = require('benchmark');

/**
 * Preparation code.
 */
var EventEmitter2 = require('eventemitter2').EventEmitter2
  , EventEmitter3 = require('eventemitter3')
  , EventEmitter1 = require('events').EventEmitter
  , Master = require('../../')
  , Drip = require('drip').EventEmitter
  , EE = require('event-emitter')
  , FE = require('fastemitter')
  , CE = require('contra/emitter');

function handle() {
  if (arguments.length > 100) console.log('damn');
}

/**
 * Instances.
 */
var ee2 = new EventEmitter2()
  , ee3 = new EventEmitter3()
  , ee1 = new EventEmitter1()
  , master = new Master()
  , drip = new Drip()
  , fe = new FE()
  , ee = EE({})
  , ce = CE();

(
  new benchmark.Suite()
).add('EventEmitter1', function() {
  ee1.once('foo', handle).emit('foo');
}).add('EventEmitter2', function() {
  ee2.once('foo', handle).emit('foo');
}).add('EventEmitter3', function() {
  ee3.once('foo', handle).emit('foo');
}).add('EventEmitter3(lucky)', function() {
  master.once('foo', handle).emit('foo');
}).add('Drip', function() {
  drip.once('foo', handle).emit('foo');
}).add('fastemitter', function() {
  fe.once('foo', handle).emit('foo');
}).add('event-emitter', function() {
  ee.once('foo', handle).emit('foo');
}).add('contra/emitter', function() {
  ce.once('foo', handle).emit('foo');
}).on('cycle', function cycle(e) {
  console.log(e.target.toString());
}).on('complete', function completed() {
  console.log('Fastest is %s', this.filter('fastest').map('name'));
}).run({ async: true });
