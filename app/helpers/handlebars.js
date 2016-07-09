'use strict';

module.exports = (function () {
  var Handlebars = require('express-hbs');

  var compare = Handlebars.registerHelper('compare', function(v1, v2, options) {
    return _.isEqual(v1, v2)? options.fn(this) : options.inverse(this);
  });

  var startCase = Handlebars.registerHelper('startCase', function(str) {
    return _.startCase(str);
  });

  var toDate = Handlebars.registerHelper('toDate', function(milliSecs) {
    return _.milliSecsToDate(milliSecs);
  });

  var capitalize = Handlebars.registerHelper('capitalize', function(str) {
    return _.capitalize(str);
  });

  var rmCents = Handlebars.registerHelper('rmCents', function(str) {
    return Number(str).toFixed(0);
  });

  return {
    capitalize: capitalize,
    startCase: startCase,
    rmCents: rmCents,
    compare: compare,
    toDate: toDate
  };

})();
