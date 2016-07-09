'use-strict';

var Promise  = require('bluebird');

var seed = new Promise(function(resolve, reject) {

  // seed subscription_types
  db
  .subscription_types
  .bulkCreate([{
    'name': 'savingsCalculator',
    'amount': '1.99',
    'recurring': false,
    'exptime': 86400000,
    'description': 'Premium Savings Calculator'
  },
  {
    'name': 'spendingCalculator',
    'amount': '1.99',
    'recurring': false,
    'exptime': 86400000,
    'description': 'Premium Spending Calculator'
  },
  {
    'name': 'bothCalculators',
    'amount': '3.98',
    'recurring': false,
    'expTime': 86400000,
    'description': 'Premium Savings & Spending Caclculator'
  },
  {
    'name': 'financialProfessionalMonthly',
    'amount': '30.00',
    'recurring': true,
    'expTime': 2592000000,
    'description': 'Financial Professional Monthly'
  },
  {
    'name': 'financialProfessionalYearly',
    'amount': '300.00',
    'recurring': true,
    'expTime': 31556900000,
    'description': 'Financial Professional Yearly'
  },
  {
    'name': 'financialPlanningHawaii',
    'amount': '0.00',
    'recurring': true,
    'expTime': 31556900000,
    'description': 'Financial Planning Hawaii Infinite'
  }])
  .success(function(sub_types) {
    console.log('Completed seeding: subscription_types');
    resolve(sub_types);
  })
  .fail(reject);

  // seed users
  db
  .users
  .bulkCreate([{
    'firstName': 'beesight',
    'lastName': 'devper',
    'email': 'bss.team.dev@gmail.com',
    'userType': 'Other',
    'proDesignation': 'MBA, AWS.'
  },
  {
    'firstName': 'mike',
    'lastName': 'nguyen',
    'email': 'ngmikeng@gmail.com',
    'userType': 'Other',
    'proDesignation': 'MBA.'
  },
  {
    'firstName': 'thu',
    'lastName': 'tran',
    'email': 'thu.tran@beesightsoft.com',
    'userType': 'Other',
    'proDesignation': 'MBA.'
  }])
  .success(function(sub_types) {
    console.log('Completed seeding: users');
    resolve(sub_types);
  })
  .fail(reject);

  /**
   * Seed register company process
   */
  // seed stripe_users
  db
  .stripe_users
  .bulkCreate([{
    'email': 'bss.team.dev@gmail.com',
    'token': 'tok_182uZ3CRUXRDe5X4txyWj9GG',
    'customerId': 'cus_8JXejYqkOCn25S',
    'planId': 'sub_8JXedcjxZF2nRx',
    'userId': 1
  }])
  .success(function(sub_types) {
    console.log('Completed seeding: stripe_users');
    resolve(sub_types);
  })
  .fail(reject);

  // seed subscriptions
  db
  .subscriptions
  .bulkCreate([{
    'calculatorType': 'financialProfessionalYearly',
    'userId': 1,
    'subscription_typeId': 1
  }])
  .success(function(sub_types) {
    console.log('Completed seeding: subscriptions');
    resolve(sub_types);
  })
  .fail(reject);

  // seed transactions
  db
  .transactions
  .bulkCreate([{
    'amount': 300.00,
    'serviceEndDate': '2017-04-22 17:12:58+07',
    'serviceEndTime': 1492830178000,
    'token': 'tok_182uZ3CRUXRDe5X4txyWj9GG',
    'subscriptionId': 1
  }])
  .success(function(sub_types) {
    console.log('Completed seeding: transactions');
    resolve(sub_types);
  })
  .fail(reject);

  // seed companies
  db
  .companies
  .bulkCreate([{
    'name': 'bss',
    'subdomain': 'bss',
    'logo': 'https://nestegg-development.s3.amazonaws.com/bss-logo.png',
    'phone': '1231231212',
    'email': 'bss.team.dev@gmail.com',
    'address_1': '51 Hoang Viet',
    'address_2': '34 Hoang Viet',
    'address_city': 'Saigon',
    'address_state': 'KY',
    'address_zip': '13231',
    'url': 'http://bss.com',
    'active': true,
    'subscription_period_end': 1492830178000,
    'subscription_subscribed': true,
    'lead_gen_tool': true,
    'userId': 1
  }])
  .success(function(sub_types) {
    console.log('Completed seeding: companies');
    resolve(sub_types);
  })
  .fail(reject);

});
