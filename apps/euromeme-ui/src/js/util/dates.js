var range = require('lodash/utility/range');

/*
  increment/decrement a date object by incrementSec
  seconds. Returns a new date.
*/
var dateMaths = function (date, incrementSec) {
  return new Date( date.getTime() + (incrementSec * 1000) );
};

var dateInSec = function (date) {
  return date.getTime() / 1000;
};

var timeRangeSec = function (start, end) {
  return range( dateInSec(start), dateInSec(end) );
};

var durationSec = function (start, end) {
  return dateInSec(end) - dateInSec(start);
};

module.exports = {
  maths: dateMaths,
  toSec: dateInSec,
  rangeInSec: timeRangeSec,
  durationInSec: durationSec
};
