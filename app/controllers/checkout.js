'use strict';

module.exports = (function() {
  var Stripe = _.lib('stripe');

  var subscription = function(input) {
    return new Promise(function(resolve, reject) {
      var S3        = _.lib('s3');
      var subdomain = input.subdomain.toLowerCase();
      var amountOff = 0;
      var percentOff = 0;
      var amountResult = 0;

      db
      .companies
      .checkSubdomain(subdomain)
      .then(function(noCompany) {
        varLog("noCompany", noCompany);
        varLog("_INPUT_PARAM", input);
        return input.user.email;
      })
      .then(db.users.findByEmail)
      .then(function(user) {
        input.userId = user.id;
        var payload = {
          email: input.user.email,
          card: input.stripeToken,
          plan: input.purchase
        };
        if(input.coupon !== undefined){
          payload.couponId = input.coupon.id;
        }
        return payload;
      })
      .then(Stripe.newCustomer)
      .then(function(customer) {
        if (customer.discount && customer.discount.coupon.percent_off){
          percentOff = customer.discount.coupon.percent_off / 100;
        }
        else if (customer.discount && customer.discount.coupon.amount_off){
          amountOff = customer.discount.coupon.amount_off / 100;
        }
        var subscription = customer.subscriptions.data.shift();
        input.subscription_period_end = _.fromUnix(subscription.current_period_end);
        input.token = customer.token;

        return {
          userId: input.userId,
          email: input.user.email,
          token: input.stripeToken,
          planId: subscription.id,
          customerId: customer.id
        };
      })
      .then(db.stripe_users.saveUser)
      .then(function(stripe_user) {
        if (!_.isUndefined(input.logo)) {
          input.logo.subdomain = subdomain;
        }

        return input.logo;
      })
      .then(S3.upload)
      .then(function(logo) {
        input.logo = logo;

        return input.purchase;
      })
      .then(db.subscription_types.getByName)
      .then(function(sub_type) {
        input.amount = sub_type.amount;
        input.subscription_typeId = sub_type.id;

        return {
          userId: input.userId,
          calculatorType: input.purchase,
          subscription_typeId: input.subscription_typeId
        };
      })
      .then(db.subscriptions.createNew)
      .then(function(subscription) {
        var endTime = input.subscription_period_end;

        return {
          amount: input.amount,
          token: input.stripeToken,
          serviceEndDate: endTime,
          serviceEndTime: endTime,
          subscriptionId: subscription.id
        };
      })
      .then(db.transactions.saveNew)
      .then(function(transaction) {
        input.active = true;

        return input;
      })
      .then(db.companies.saveCompany)
      .then(function(company) {
        var inputAmount = parseInt(input.amount);
        if(percentOff){
          var percentOffSub = percentOff * inputAmount;
          amountResult = inputAmount - parseInt(percentOffSub);
        }
        else if(amountOff){
          amountResult = Math.round((inputAmount - amountOff) * 100) / 100;
        }
        else{
          amountResult = inputAmount;
        }

        resolve({
          amount: amountResult,
          last4: input.last4,
          subscription: input.purchase,
          subdomain: company.subdomain,
          expires: input.subscription_period_end
        });
      })
      .catch(reject);

    });
  };

  var pass = function(input) {
    return new Promise(function(resolve, reject) {
      var Stormpath = _.lib('stormpath');
      db
      .subscription_types
      .getByName(input.purchase)
      .then(function(sub_type) {
        input.subscription_typeId = sub_type.id;
        input.serviceEndTime      = _.oneDay(sub_type.expTime);
        input.amount              = sub_type.amount;

        return {
          amount: input.amount,
          card: input.stripeToken,
          description: sub_type.description
        };
      })
      .then(Stripe.charge)
      .then(function(charge) {
        return input.user.email;
      })
      .then(db.users.findByEmail)
      .then(function(user) {
        input.userId = user.id;

        return {
          userId: input.userId,
          calculatorType: input.purchase,
          subscription_typeId: input.subscription_typeId
        };
      })
      .then(db.subscriptions.createNew)
      .then(function(subscription) {
        var endTime = input.serviceEndTime;

        return {
          amount: input.amount,
          token: input.stripeToken,
          serviceEndTime: endTime,
          serviceEndDate: endTime,
          subscriptionId: subscription.id
        };
      })
      .then(db.transactions.saveNew)
      .then(function(transaction) {
        input.serviceEndTime = transaction.serviceEndTime;

        return input;
      })
      .then(Stormpath.getApp)
      .then(function(app) {
        return { app: app, email: input.user.email };
      })
      .then(Stormpath.getAcct)
      .then(function(account) {
        return {
          account: account,
          calculatorType: input.purchase,
          serviceEndTime: input.serviceEndTime
        };
      })
      .then(Stormpath.updateAcct)
      .then(function(account) {
        resolve({
          amount: input.amount,
          last4: input.last4,
          purchase: input.purchase,
          expires: input.serviceEndTime
        });
      })
      .catch(reject);

    });
  };

  var couponCodeCheck = function(couponCode){
    return new Promise(function(resolve, reject){
      Stripe.validateCoupon(couponCode)
      .then(resolve)
      .catch(reject);
    });
  };

  var trialSubscribe = function(input) {
    return new Promise(function(resolve, reject) {
      var S3        = _.lib('s3');
      var subdomain = input.subdomain.toLowerCase();

      db
      .companies
      .checkSubdomain(subdomain)
      .then(function(noCompany) {
        return input.user.email;
      })
      .then(db.users.findByEmail)
      .then(function(user) {
        input.userId = user.id;
        if (!_.isUndefined(input.logo)) {
          input.logo.subdomain = subdomain;
        }

        return input.logo;
      })
      .then(S3.upload)
      .then(function(logo) {
        input.logo = logo;

        input.active = true;
        // set 14 days period
        var now = new Date();
        var millisecEndPeriod = now.getTime() + _.dayToMilliSecs(global.daysTrial);
        input.subscription_period_end = millisecEndPeriod;
        input.subscription_subscribed = false;

        return input;
      })
      .then(db.companies.saveCompany)
      .then(function(company) {

        resolve({
          subscription: input.purchase,
          subdomain: company.subdomain,
          expires: input.subscription_period_end
        });
      })
      .catch(reject);

    });
  };

  var releasePayment = function(input) {
    var amountOff = 0;
    var percentOff = 0;
    var amountResult = 0;
    var company = {};

    return new Promise(function(resolve, reject) {
      var payload = {
        email: input.userEmail,
        card: input.stripeToken,
        plan: input.purchase,
        metadata: {
          userId: input.userId
        }
      };

      if (input.coupon) {
        var coupon = JSON.parse(input.coupon);
        payload.couponId = coupon.id;
      }

      Stripe.newCustomer(payload)
        .then(function(customer) {
          if (customer.discount && customer.discount.coupon.percent_off){
            percentOff = customer.discount.coupon.percent_off / 100;
          }
          else if (customer.discount && customer.discount.coupon.amount_off){
            amountOff = customer.discount.coupon.amount_off / 100;
          }
          var subscription = customer.subscriptions.data.shift();
          input.subscription_period_end = _.fromUnix(subscription.current_period_end);
          input.token = customer.token;

          return {
            userId: input.userId,
            email: input.userEmail,
            token: input.stripeToken,
            planId: subscription.id,
            customerId: customer.id
          };
        })
        .then(db.stripe_users.saveUser)
        .then(function() {
          return input.purchase;
        })
        .then(db.subscription_types.getByName)
        .then(function(sub_type) {
          input.amount = sub_type.amount;
          input.subscription_typeId = sub_type.id;

          return {
            userId: input.userId,
            calculatorType: input.purchase,
            subscription_typeId: input.subscription_typeId
          };
        })
        .then(db.subscriptions.createNew)
        .then(function(subscription) {
          var endTime = input.subscription_period_end;

          return {
            amount: input.amount,
            token: input.stripeToken,
            serviceEndDate: endTime,
            serviceEndTime: endTime,
            subscriptionId: subscription.id
          };
        })
        .then(db.transactions.saveNew)
        .then(function() {
          return input.subdomain;
        })
        .then(db.companies.findBySubdomain)
        .then(function(companyRes) {
          company = companyRes;

          return {
            company: companyRes,
            input: input
          };
        })
        .then(db.companies.updateSubscriptionSubscribed)
        .then(function() {
          var inputAmount = parseInt(input.amount);
          if(percentOff){
            var percentOffSub = percentOff * inputAmount;
            amountResult = inputAmount - parseInt(percentOffSub);
          }
          else if(amountOff){
            amountResult = Math.round((inputAmount - amountOff) * 100) / 100;
          }
          else{
            amountResult = inputAmount;
          }

          resolve({
            amount: amountResult,
            last4: input.last4,
            subscription: input.purchase,
            subdomain: input.subdomain,
            expires: input.subscription_period_end,
            type: "Subscription",
            lead_gen_tool: company.lead_gen_tool
          });
        })
        .catch(reject);

    });
  };

  return {
    Subscription: subscription,
    Pass: pass,
    Trial: trialSubscribe,
    couponCodeCheck: couponCodeCheck,
    releasePayment: releasePayment
  };

})();
