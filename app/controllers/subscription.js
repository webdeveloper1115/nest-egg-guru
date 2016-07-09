'use strict';

var moment = require('moment');
var Stripe = require('stripe')(env.STRIPE_SECRET_KEY);

var email = require(cwd +'/app/services/email-service');


exports.update = function(req, _company) {
  var defer = Q.defer();
  var input = req.body;
  var activeCompany = true;

  if (_company) {
    activeCompany = _company.active;
  }

  // Only if the company is active do we check for subscriptions to the same plan
  // Otherwise, if company is inactive, skip this check
  if (_.isEqual(input.currentSubscription, input.plan) && activeCompany) {
    defer.resolve({ error: 'You can\'t subscribe to the same plan!' });
  } else {

    db
    .subscription_types
    .find({ where: { name: input.plan } })
    .then(function(type) {

      return {
        userId: input.userId,
        calculatorType: input.plan,
        subscription_typeId: type.id
      };
    })
    .then(db.subscriptions.createNew)
    .then(function(subscription) {
      return input.userId;
    })
    .then(db.stripe_users.findByUserId)
    .then(function(stripeUser) {
      input.stripeUser = stripeUser;

      return Stripe
            .customers
            .retrieve(stripeUser.customerId);
    })
    .then(function(customer) {
      input.last4 = _.pluck(customer.sources.data, 'last4').pop();

      if (customer.subscriptions.total_count > 0) {
        return Stripe
             .customers
             .updateSubscription(input.stripeUser.customerId, input.stripeUser.planId, { plan: input.plan });
      } else {
        return Stripe
           .customers
           .createSubscription(customer.id, { plan: input.plan });
      }
    })
    .then(function(subscription) {
      req.session.expire       = formatDate(subscription.current_period_end, 'LLLL');
      req.session.chargeAmount = format$(subscription.plan.amount);
      input.subscription       = subscription;

      return input
             .stripeUser
             .updateAttributes({
                planId: subscription.id
             });
    })
    .then(function(stripeUser) {
      return input.subdomain;
    })
    .then(db.companies.findBySubdomain)
    .then(function(company) {

      return company
             .updateAttributes({
                subscription_period_end: input.subscription.current_period_end,
                active: true
             });
    })
    .then(function(company) {
      var oldPlan = _.isEqual(input.subscription.plan.name, 'financialProfessionalMonthly')? 'financialProfessionalYearly' : 'financialProfessionalMonthly';

      if (_.isEqual(input.oldPlan, input.plan)) {
        email.whiteLabelReactivateSubscription(req, input.subscription, company, function(err) {
          d('Financial Professional Reactivation email sent');
          err? defer.reject(err) : defer.resolve({ oldPlan: oldPlan, last4: input.last4, modal: '#secondModal' });
        });

      } else {
        email.whiteLabelUpdateSubscription(req, input.subscription, company, function(err) {
          err? defer.reject(err) : defer.resolve({ oldPlan: oldPlan, last4: input.last4, modal: '#secondModal' });
        });
      }

    })
    .catch(defer.reject);
  }

  return defer.promise;
};

exports.cancel = function(req) {
  var defer = Q.defer();
  var input = req.body;
  var data  = {};

  db
  .stripe_users
  .findByUserId(input.userId)
  .then(function(stripeUser) {
    input.planId = stripeUser.planId;

    return Stripe
          .customers
          .retrieve(stripeUser.customerId);
  })
  .then(function(customer) {
    input.last4 = _.pluck(customer.sources.data, 'last4').pop();

    return Stripe
           .customers
           .cancelSubscription(customer.id, input.planId);
  })
  .then(function(confirmation) {
    data.subscription_period_end = confirmation.current_period_end;
    data.active                  = false;

    input.confirmation = confirmation;

    return input.subdomain;
  })
  .then(db.companies.findBySubdomain)
  .then(function(company) {

    return company
           .updateAttributes(data);
  })
  .then(function(company) {

    email.whiteLabelCancelSubscription(req, input.confirmation, company, function(err) {
      defer.resolve({ modal: '#thirdModal', last4: input.last4, type: 'cancel' });
    });
  })
  .catch(defer.reject);

  return defer.promise;
};

exports.reactivate = function(req) {
  var defer = Q.defer();
  var input = req.body;
  var data  = {};

  db
  .users
  .find({
    where: { id: input.userId },
    include: [db.stripe_users, db.subscriptions]
  })
  .then(function(user) {
    input.prevPlan = getLastFinancialProfessionalSubscription(user.subscriptions);
    input.prevPlan = input.prevPlan? input.prevPlan.calculatorType : 'financialProfessionalMonthly';

    return Stripe
           .customers
           .retrieve(user.stripeUser.customerId);
  })
  .then(function(customer) {
    input.last4 = _.pluck(customer.sources.data, 'last4').pop();

    return Stripe
           .customers
           .createSubscription(customer.id, { plan: input.prevPlan });
  })
  .then(function(subscription) {
    data.subscription_period_end = subscription.current_period_end;
    data.active                  = true;

    input.subscription = subscription;

    return input.userId;
  })
  .then(db.stripe_users.findByUserId)
  .then(function(stripeUser) {
    return stripeUser
           .updateAttributes({
              planId: input.subscription.id
           });
  })
  .then(function(stripeUser) {
    return input.subdomain;
  })
  .then(db.companies.findBySubdomain)
  .then(function(company) {
    return company
           .updateAttributes(data);
  })
  .then(function(company) {

    email.whiteLabelReactivateSubscription(req, input.subscription, company, function(err) {
      defer.resolve({ modal: '#fourthModal', last4: input.last4, type: 'reactivate', plan: input.prevPlan });
    });

  })
  .catch(defer.reject);

  return defer.promise;
}
