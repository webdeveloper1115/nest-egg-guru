/**
 * Created by ThuTran on 4/12/2016.
 */
'use strict';

module.exports = (function () {
  var _u = require("underscore");
  var compare = function(v1, v2, options) {
    return _u.isEqual(v1, v2)? options.fn(this) : options.inverse(this);
  };

  var startCase = function(str) {
    return _u.startCase(str);
  };

  var toDate = function(milliSecs) {
    return _u.milliSecsToDate(milliSecs);
  };

  var capitalize = function(str) {
    return _u.capitalize(str);
  };

  var rmCents = function(str) {
    return Number(str).toFixed(0);
  };

  return {
    capitalize: capitalize,
    startCase: startCase,
    rmCents: rmCents,
    compare: compare,
    toDate: toDate
  };

})();
