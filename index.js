
/**
 * Module dependencies.
 */

var mods = require('./mods')
  , filter = require('./filter')
  , debug = require('debug')('mongo-query')
  , object, type;

/**
 * Dual require for components.
 */

try {
  type = require('type');
  object = require('object');
} catch(e){
  type = require('type-component');
  object = require('object-component');
};

/**
 * Module exports.
 */

module.exports = exports = query;

/**
 * Export filter helper.
 */

exports.filter = filter;

/**
 * Export modifiers.
 */

exports.mods = mods;

/**
 * Execute a query.
 *
 * @param {Object} object to alter
 * @param {Object} query to filter modifications by
 * @param {Object} update object
 */

function query(obj, query, update){
  obj = obj || {};
  query = query || {};
  update = update || {};

  var match;
  var log = [];

  if (object.length(query)) {
    match = [obj];
  } else {
    if (!object.length(update)) return [];
    match = [obj];
  }

  if (match.length) {
    var keys = object.keys(update);
    var transactions = [];

    for (var i = 0, l = keys.length; i < l; i++) {
      if (mods[keys[i]]) {
        debug('found modifier "%s"', keys[i]);
        for (var key in update[keys[i]]) {
          var fn = mods[keys[i]](obj, key, update[keys[i]][key]);
          if (fn) transactions.push(fn);
        }
      } else {
        debug('skipping unknown modifier "%s"', keys[i]);
      }
    }

    if (transactions.length) {
      // if we got here error free we process all transactions
      for (var i = 0; i < transactions.length; i++) {
        transactions[i]();
      }
    }
  } else {
    debug("no matches for query %j", query);
  }

  return log;
}
