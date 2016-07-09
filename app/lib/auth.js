'use-strict';

exports.user = function(req, res, next) {
  var access = {}, user, savingsExpire, spendingExpire;

  if (!_.isUndefined(req.user)) {
    user                  = req.user.customData;
    access.savingsExpire  = moment(Number(user.savingsCalculator)).format('LLLL');
    access.spendingExpire = moment(Number(user.spendingCalculator)).format('LLLL');

    if (user.savingsCalculator > Date.now()) {
      if (user.spendingCalculator > Date.now()) {
        access.all = [ { savings: access.savingsExpire }, { spending: access.spendingExpire } ];
      } else {
        access.savings = access.savingsExpire;
      }
    } else {
      if (user.spendingCalculator > Date.now()) {
        access.spending = access.spendingExpire;
      } else {
        access.none = true;
      }
    }
  }

  res.locals.access = access;
  next();
};

exports.subscription = function(req, res, next) {
  var calculator = req.originalUrl.split('/')[1];
  var company    = req.company;

  if (!_.isUndefined(company)) {
    var validSubscription = company.subscription_period_end > Math.round(Date.now() / 1000);

    validSubscription? next() : res.redirect('/' + calculator);
  } else if (!_.isUndefined(req.user)) {
    // Keys are savingsCalculator, spendingCalculator, or bothCalculators
    var serviceEndTime    = Math.max(req.user.customData[calculator + 'Calculator'], req.user.customData.bothCalculators);
    var validSubscription = serviceEndTime > Date.now();

    validSubscription? next() : res.redirect('/' + calculator);
  } else {
    res.redirect('/' + calculator);
  }
};

exports.subscriptions = function(req, locals) {
  if (!_.isUndefined(req.user)) {
    var now = Date.now();

    var savingsEndTime = Math.max(req.user.customData.savingsCalculator, req.user.customData.bothCalculators);
    var validSavings = savingsEndTime > now;

    var spendingEndTime = Math.max(req.user.customData.spendingCalculator, req.user.customData.bothCalculators);
    var validSpending = spendingEndTime > now;

    locals.savingsPurchased = validSavings? moment(Number(savingsEndTime)).format('LLLL') : false;
    locals.spendingPurchased = validSpending? moment(Number(spendingEndTime)).format('LLLL') : false;
  }

  return locals;
};
