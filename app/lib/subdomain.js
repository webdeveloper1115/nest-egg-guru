'use strict';

var Stripe = require('stripe')(env.STRIPE_SECRET_KEY);
var moment = require("moment");

exports.check = function(req, res, next) {
   var subdomains  = req.headers.host.split('.');
   var development = subdomains.length > 4 &&
                     _.isEqual(env.NODE_ENV, 'development');

   var production = (subdomains.length > 2 &&
                      _.isEqual(env.NODE_ENV, 'production') &&
                      req.headers.host.indexOf('nesteggguru.com') > -1);

   var staging     = subdomains.length > 3 &&
                     _.indexOf(subdomains, 'staging') >= 0 &&
                     _.isEqual(env.NODE_ENV, 'staging');

  // for dynamic credit card exp years
  var expYears = getExpiredYears(11);
  var cardYear = req.session.input ? req.session.input.cardYear : undefined;
  res.locals.expYears = setSelectedExpiredYear(expYears, cardYear)

  if (staging || development || production) {
    db
    .companies
    .findBySubdomain(subdomains[0])
    .then(function(company) {
      if (_.isNull(company) || !company.active) {
        res.redirect(req.protocol +'://'+ subdomains.splice(1, subdomains.length).join('.'));
      } else {
        req.company        = company;
        res.locals.company = company.dataValues;
        next();
      }
    })
    .catch(function(err) {
      d('Subdomain Check Error', err);
    });
  } else {
    next();
  }

};

exports.active = function(req, res, next) {
  var subscription;
  varLog("subdomain.req.company:", req.company);
  if (!_.isUndefined(req.company) && req.company.active) {
    // check user subscription
    if (req.company.subscription_subscribed) {
      varLog("Subscription End: ", _.milliSecsToDate(req.company.subscription_period_end));

      db
      .stripe_users
      .findByUserId(req.company.userId)
      .then(function(user) {
        return Stripe
              .customers
              .retrieveSubscription(user.customerId, user.planId);
      })
      .then(function(plan) {
        subscription = plan;

        return req.company.subdomain;
      })
      .then(db.companies.findBySubdomain)
      .then(function(company) {
        company.active = _.isEqual(subscription.status, 'active');
        company.subscription_period_end = company.active? company.subscription_period_end : null;

        return company;
      })
      .then(db.companies.update)
      .then(function(company) {
        var remove = new RegExp(company.subdomain+'.', 'i'); // Do not use 'g' flag, only remove subdomain on first match

        res.locals.whiteLabel = {
          url: company.url,
          name: company.name,
          logo: company.logo,
          domain: company.subdomain,
          main: res.locals.DOMAIN ? res.locals.DOMAIN.replace(remove, '') : "",
          site: company.url ? company.url.replace(/.*?:\/\/www./g, "") : "",
          disclosure_info: company.disclosure_info
        };

        company.active? next() : res.render('expired', {domain: res.locals.DOMAIN ? '//' + res.locals.DOMAIN.replace(remove, '') : "" });
      })
      .catch(function(err) {
        d('Subdomain Active Error ', err);
      });
    }
    else {
      //check the time to lock the domain
      var company = req.company;
      var remove = new RegExp(company.subdomain+'.', 'i'); // Do not use 'g' flag, only remove subdomain on first match

      var expiredDate = company.subscription_period_end ? moment(company.subscription_period_end) : moment(company.createdAt).add((global.daysTrial || 14), 'days');

      var remainingPeriod = expiredDate.diff(moment())

      if( remainingPeriod < 0 ){
        return res.render('expired', { domain: res.locals.DOMAIN ? '//' + res.locals.DOMAIN.replace(remove, '') : "" });
      }else{
        res.locals.whiteLabel = {
          url: company.url,
          name: company.name,
          logo: company.logo,
          domain: company.subdomain,
          main: res.locals.DOMAIN ? res.locals.DOMAIN.replace(remove, '') : "",
          site: company.url ? company.url.replace(/.*?:\/\/www./g, "") : "",
          disclosure_info: company.disclosure_info
        };
        next();
      }
    }

  } else {
    next();
  }

};
