var router = require('express').Router();

var User         = _.ctrl('users');
var Subscription = _.ctrl('subscription');
var auth         = _.lib('auth');

router.route('/')
  .get(function(req, res) {
    if (_.isUndefined(req.user)) {
      res.redirect('/user/login');
    } else {
      User
      .dashboard(req.user.email)
      .then(function(user) {
        user.user.customData = req.user.customData;
        if (user.company) {
          var informationReports = JSON.parse(user.company.infomation_reports);
          _.each(informationReports, function(value) {
            user.company[value] = value;
          });

          delete user.company.infomation_reports;
        }
        varLog('my_account.user:', user);
        res.render('my_account', auth.subscriptions(req, user));
      })
      .catch(function(err) {
        d(err);
        res.redirect('/user/login');
      });
    }
  })
  .post(function(req, res) {
    var data = {
      user : req.user,
      input : req.body,
      logo : req.files.logo
    };
    User.update(data)
    .then(function(user) {
      req.flash('success', 'Account information successfully updated.');
      res.redirect('/user');
    })
    .catch(function(err) {
      d(err);
      req.flash('account', err);
      res.redirect('/user');
    });

  });

router.route('/register')
  .get(function(req, res) {
    varLog("req.user:", req.user);
    if (!_.isUndefined(req.user)) {
      res.redirect("/user");
    }
    else {
      var locals   = req.session.input || {};
      locals.type  = "Subscription";
      locals.error = req.session.error;
      locals.lead_gen_tool = locals.lead_gen_tool ? true : false;
      locals.accountInfo = global.getAccountInfo(req.session.accountInfo);
      locals.step = req.query.step;
      locals.purchase = locals.purchase ? locals.purchase : "financialProfessionalYearly";

      req.session.type = "Trial";
      varLog("locals.accountInfo:", locals.accountInfo);
      varLog("locals.purchase:", locals.purchase);

      // prevent invalid step query
      var isInvalidSteps = (locals.step !== "info" && locals.step !== "company");
      if (!locals.step || isInvalidSteps) {
        locals.step = "info";
      }
      // Prevent step in register company form even if not fill out account info form.
      if (locals.step === "company") {
        if (_.isUndefined(locals.accountInfo) || !locals.accountInfo.password) {
          return res.redirect("/user/register?type=financial-professionals&step=info");
        }
      }

      res.render('register', locals);
    }
  })
  .post(function(req, res, next) {
    req.session.input = req.session.input || {};
    req.session.input.purchase = req.body.purchase;
    var customData = {
      bothCalculators: 1,
      savingsCalculator: 0,
      spendingCalculator: 0
    };
    req.body.customData = customData;

    User.checkEmail(req.body.email)
    .then(function(success) {
      // set session register account info
      req.session.accountInfo = global.getAccountInfo(req.body);
      res.send(success);
    }, function(err) {
      res.status(400).send(err);
    })
    .catch(function(err) {
      d(err);
      res.json(err);
    });

  });

router.route('/set-purchase')
 .post(function(req, res) {
    if (typeof req.body.purchase == "string") {
      req.session.input = req.session.input ? req.session.input : {};
      req.session.input.purchase = req.body.purchase;
      varLog("_set_purchase_req.session.input:", req.session.input.purchase);
      res.json("Success");
    }
    else {
      res.json("Invalid type");
    }
 });

router.route('/ajax-login')
  .post(function(req, res) {
    User.login(req.body)
    .then(function(spHref) {
      req.session.passport.user = spHref;
      res.json('Success');
    })
    .catch(function(err) {
      d(err);
      res.json(err);
    });
  });

router.route('/login')
  .get(function(req, res) {
    if (!_.isUndefined(req.user)) {
      res.redirect('/user');
    }
    else {
      res.render('login', { error : req.session.err });
    }
  })
  .post(function(req, res) {
    User.login(req.body)
    .then(function(spHref) {
      req.session.err = null;
      req.session.passport.user = spHref;

      res.redirect('/user');
    })
    .catch(function(err) {
      d(err);
      req.session.err = err.userMessage;
      res.redirect('/user/login');
    });
  });

router.get('/logout', function(req, res) {
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

router.route('/forgot-password')
  .get(function(req, res) {
    res.render('forgot_password');
  })
  .post(function(req, res) {
    User
    .recoverPassword(req.body.email)
    .then(function(message) {
      res.render('forgot_password', { message : message });
    })
    .catch(d);
  });

router.route('/reset-password')
  .get(function(req, res) {
    // Stormpath will not allow a password reset without this token
    req.session.sptoken = req.query.sptoken || req.session.token;

    !req.session.sptoken ? res.redirect('/user/forgot-password') :
    res.render('password_reset', { token : req.session.sptoken });
  })
  .post(function(req, res) {
    User
    .resetPassword(req.body)
    .then(function(message) {
      res.render('password_reset', { message : message, token : req.session.sptoken });
    })
    .catch(function(err) {
      res.render('password_reset', { message : err.userMessage, token : req.session.sptoken });
    });
  });

router.route('/subscription/update')
  .post(function(req, res) {
    Subscription
    .update(req)
    .then(function(data) {
      res.json(data);
    })
    .catch(d);
  });

router.route('/subscription/cancel')
  .post(function(req, res) {
    Subscription
    .cancel(req)
    .then(function(data) {
      res.json(data);
    })
    .catch(d);
  })

router.route('/subscription/reactivate')
  .post(function(req, res) {
    Subscription
    .reactivate(req)
    .then(function(data) {
      res.json(data);
    })
    .catch(d);
  })

module.exports = router;
