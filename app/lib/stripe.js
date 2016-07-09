'use-strict';

module.exports = (function () {
  var Stripe = require('stripe')(env.STRIPE_SECRET_KEY);

  var newCustomer = function(user) {
    return new Promise(function(resolve, reject) {
      var sendCustomer = {
        card: user.card,
        plan: _.camelCase(user.plan),
        email: user.email.toLowerCase(),
        metadata: user.metadata
      };
      if(user.couponId !== undefined){
        sendCustomer.coupon = user.couponId;
      }
      Stripe
      .customers
      .create(
        sendCustomer
      )
      .then(resolve)
      .catch(reject);

    });
  };

  var charge = function(chrg) {
    return new Promise(function(resolve, reject) {
      Stripe
      .charges
      .create({
        amount: _.stripe$(chrg.amount),
        currency: 'usd',
        card: chrg.card,
        description: chrg.description
      })
      .then(resolve)
      .catch(reject);

    });
  };

  var validateCoupon = function(promoCode){
    return new Promise(function(resolve, reject){
      Stripe
      .coupons
      .retrieve(
        promoCode
      )
      .then(resolve)
      .catch(reject);
    });

  };

  return {
    newCustomer: newCustomer,
    charge: charge,
    validateCoupon: validateCoupon
  };

}());
