var router = require('express').Router();
var auth   = _.lib('auth');
var User   = _.ctrl('users');

router.route('/')
  .get(function(req, res) {
    var locals   = req.session.input || {};
    locals.type  = req.session.type;
    locals.error = req.session.error;
    locals.user  = global.getAccountInfo(req.session.accountInfo);
    locals.lead_gen_tool = locals.lead_gen_tool ? true : false;
    varLog("input:", req.session.input);
    varLog("user:", req.session.accountInfo);
    if (locals.type === 'Subscription') {
      User
      .dashboard(locals.user.email)
      .then(function(user) {
        if (user.company) {
          locals.type = 'Pass';
        }

        res.render('checkout', auth.subscriptions(req, locals));
      })
      .catch(function(err) {
        d(err);
        res.redirect('/user/register');
      });
    } else {
      res.render('checkout', auth.subscriptions(req, locals));
    }
  })
  .post(function(req, res) {
    // init session input
    if (req.session.input) {
      _.each(req.body, function(value, key) {
        req.session.input[key] = value;
      });
    }
    else {
      req.session.input = req.body || {};
    }

    var type   = req.session.type;
    var logo   = req.files.logo || null;
    // var isLogo = _.isEqual(type, 'Subscription') && !_.isNull(logo);
    var isLogo = _.contains(['Subscription', 'Trial'], type) && !_.isNull(logo);
    req.body.type = type;
    varLog("req.session.accountInfo", req.session.accountInfo);
    varLog("req.user", req.user);
    varLog("req.body", req.body);

    // keep session logo
    if (req.body.keepLogo) {
      req.body.logo = req.files.logo ? _.cloneDeep(req.files.logo) : _.cloneDeep(req.session.input.logo);
      var logoPrevious = req.body.logo ? _.cloneDeep(req.body.logo) : _.cloneDeep(req.session.input.logo);
      req.session.input.logo = (_.contains(['Subscription', 'Trial'], type) && logoPrevious) ? logoPrevious : undefined;
      req.session.input.img  = (_.contains(['Subscription', 'Trial'], type) && logoPrevious) ? _.base64(logoPrevious.buffer) : undefined;
    }
    else {
      req.body.logo = isLogo? logo : undefined;
      req.body.img  = isLogo? _.base64(logo.buffer) : undefined;

      req.session.input = req.body;
    }

    if(req.body.coupon){
      req.session.input.coupon = JSON.parse(req.body.coupon);
    }

    req.session.input.accountInfo = global.getAccountInfo(req.session.accountInfo);

    res.redirect('/checkout/confirm');
  });

router.route('/confirm')
  .get(function(req, res) {
    if (!_.isUndefined(req.user)) {
      res.redirect('/user');
    }
    else {
      if(req.body.coupon){
        req.session.input.coupon = JSON.parse(req.body.coupon);
      }

      if(req.session.input.coupon && req.session.input.coupon.amount_off){
        req.session.input.coupon.amount_off = req.session.input.coupon.amount_off / 100;
      }
      res.render('confirm_payment', req.session.input);
    }
  })
  .post(function(req, res) {
    req.session.error = null;
    var input = req.session.input;
    input.coupon = req.session.input.coupon;
    input.user = req.session.accountInfo;
    varLog("_INPUT:", input);
    varLog("req.session.type:", req.session.type);
    // Register user
    User.register(req.session.accountInfo)
    .then(function(spHref) {
      req.session.passport.user = spHref;
      req.user = req.session.accountInfo;

      return input;
    })
    .then(_.ctrl('checkout')[req.session.type])
    .then(function(saved) {
      saved.type        = req.session.type;
      req.session.input = saved;
      req.session.input.coupon = input.coupon;
      req.session.input.lead_gen_tool = input.lead_gen_tool;
      varLog("__Saved:", saved);
      return req;
    })
    .then(_.lib('email')[req.session.type])
    .then(function() {
      res.redirect('/checkout/success');
    })
    .catch(function(err) {
      d(err);
      req.session.error = err.message? err.message : err;
      res.redirect('/user/register?type=financial-professionals&step=info');
    });

  });

router.route('/release-payment')
  .post(function(req, res) {
    varLog("_TRIAL_BODY:", req.body);
    _.ctrl('checkout').releasePayment(req.body)
    .then(function(result) {
      varLog("_RELEASE_PAYMENT:", result);
      req.session.input = result;
      res.redirect('/checkout/success');
    })
    .catch(function(err) {
      d(err);
      res.send(err);
    });
  });

router.route('/check-coupon')
  .post(function(req, res){
    _.ctrl('checkout').couponCodeCheck(req.body.couponCode)
    .then(function(coupon){
      res.send(coupon);
    })
    .catch(function(err){
      res.send(err);
    });

  });

router.route('/coupon-delete')
  .delete(function(req,res){
    if(req.session.input.coupon){
      delete req.session.input.coupon;
    }
    res.send();
  });

router.route('/success')
  .get(function(req, res) {
    res.render('checkout_success', req.session.input);
  });

module.exports = router;
