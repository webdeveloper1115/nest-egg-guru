/*jslint white: true, node:true, browser: true, devel: true, windows: true, forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
'use strict';

var https       = require('https'),
    http        = require('http'),
    querystring = require('querystring'),
    logger;

//env specific config passed into middleware on startup
function MadMimi(opts) {

  if (opts && opts.debug) {
    logger = console.log;
  } else {
    logger = function() {};
  }

  if (!opts || !opts.api_key || !opts.user) {
    throw new Error('Invalid Mad Mimi configuration');
  }

  var self = this;
  //extract params as private vars
  self.username = opts.user;
  self.api_key = opts.api_key;
  self.endpoint = opts.endpoint;
  self.useSSL = opts.ssl;
  self.newsletterName = opts.newsletter;

  self.sendRequest = function(requestOptions, data, callback) {
    var httpClient = requestOptions.port === 443 ? https : http;

    if (requestOptions.method == 'POST') {
      requestOptions.headers = {
        'content-type': 'application/x-www-form-urlencoded'
      };
    }

    if (!callback) {
      callback = function() {};
    }

    var httpBody = undefined;

    if (data) {
      httpBody = data;
      requestOptions.body = httpBody;
    }

    var req = httpClient.request(requestOptions, function(res) {
      logger('STATUS: ', res.statusCode);
      logger('HEADERS: ', JSON.stringify(res.headers));

      res.setEncoding('utf8');

      res.on('data', function(chunk) {
        logger('BODY: ', chunk);
        res.body += chunk;
      });

      res.on('end', function() {
        logger('end transmission');
        logger(callback(res.body));
        callback();
      });

    });

    req.on('error', function(e) {
      logger('Failed Newsletter Request: ' + e.message);
    });

    if (httpBody) {
      req.write(httpBody);
    }

    req.end();
  };

  self.addToNewsletter = function(obj, callback) {

    if (!obj.email) {
      callback('Error: No address specified');
    }
    var name = obj.name.toLowerCase().replace(/\b./g, function(m){ return m.toUpperCase(); });

    var newsletterOptions = {
      email: obj.email,
      name: name,
      type: obj.userType,
      username: self.username,
      api_key: self.api_key
    };

    var requestOptions = {
      host: self.endpoint,
      path: '/audience_lists/' + encodeURIComponent(self.newsletterName) + '/add',
      method: 'POST',
      port: 443
    };

    var optionsQueryString = querystring.stringify(newsletterOptions, "&", "=");

    self.sendRequest(requestOptions, optionsQueryString, function() {
      if (callback) {
        callback();
      }
    });
  };
}

exports = module.exports = function(opts) {
  return new MadMimi(opts);
};