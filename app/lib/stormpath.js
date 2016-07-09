'use-strict';

module.exports = (function () {
  var stormpath = require('stormpath');

  // Initialize our Stormpath client.
  var apiKey = new stormpath.ApiKey(
    env.STORMPATH_API_KEY_ID,
    env.STORMPATH_API_KEY_SECRET
  );

  var Client = new stormpath.Client({ apiKey: apiKey });

  var getApp = function() {
    return new Promise(function(resolve, reject) {
      Client.getApplication(env.STORMPATH_APP_HREF, function(err, app) {
        err? reject(err) : resolve(app);
      });
    });
  };

  var createAcct = function(obj) {
    return new Promise(function(resolve, reject) {
      var app   = obj.app;
      var input = obj.input;

      app.createAccount({
        givenName: _.capitalize(input.firstName),
        surname: _.capitalize(input.lastName),
        username: input.email.toLowerCase(),
        email: input.email.toLowerCase(),
        password: input.password,
        customData: {
          savingsCalculator: 0,
          spendingCalculator: 0,
          bothCalculators: 0
        },
      }, function(err, newAcct) {
        err? reject(err) : resolve(newAcct);
      });

    });
  };

  var getAcct = function(obj) {
    return new Promise(function(resolve, reject) {
      var app   = obj.app;
      var email = obj.email.toLowerCase();

      app
      .getAccounts({ email: email }, function(err, account) {
        err? reject(err) : resolve(account);
      });

    });
  };

  var authAcct = function(obj) {
    return new Promise(function(resolve, reject) {
      var app  = obj.app;
      var user = {
        username: obj.user.username,
        password: obj.user.password
      };

      app.authenticateAccount(user, function(err, result) {
        if (err) {
          reject(err)
        } else {
          result.getAccount(function(err, account) {
            err? reject(err) : resolve(account);
          });
        }
      });

    });
  };

  var updateAcct = function(obj) {
    return new Promise(function(resolve, reject) {
      var account        = obj.account;
      var serviceEndTime = obj.serviceEndTime;
      var calculatorType = obj.calculatorType;

      account
      .items.shift()
      .getCustomData(function(err, acct) {
        acct[calculatorType] = serviceEndTime;

        acct.save(function(err) {
          err? reject(err) : resolve(acct);
        });

      });

    });
  };

  var recoverPassword = function(obj) {
    return new Promise(function(resolve, reject) {
      var app   = obj.app;
      var email = obj.email;

      app.sendPasswordResetEmail(email, function(err, resetToken) {
        err? reject(err) : resolve(resetToken);
      });

    });
  };

  var resetPassword = function(obj) {
    return new Promise(function(resolve, reject) {
      var app      = obj.app;
      var sptoken  = obj.sptoken;
      var password = obj.password;

      app.verifyPasswordResetToken(sptoken, function(err, response) {
        if (err) {
          reject(err);
        } else {
          response.password = password;
          response.save();
          resolve(response);
        }
      });

    });
  };


  return {
    getApp: getApp,
    getAcct: getAcct,
    authAcct: authAcct,
    updateAcct: updateAcct,
    createAcct: createAcct,
    resetPassword: resetPassword,
    recoverPassword: recoverPassword
  };

}());
