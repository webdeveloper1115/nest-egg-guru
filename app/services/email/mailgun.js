/*jslint white: true, node:true, browser: true, devel: true, windows: true, forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
'use strict';

var http           = require('http');
var https          = require('https');
var moment         = require('moment');
var _              = require('lodash');
var email          = require('emailjs');
var emailTemplates = require('email-templates');
var admin          = require(cwd + '/app/config').admin;
var logger;

function MailGun(opts) {

  if (opts && opts.debug) {
    logger = d;
  } else {
    logger = function() {};
  }

  //validate mailgun credentials
  if (!opts || !opts.user || !opts.host || !opts.templates) {
    throw new Error('Invalid Mailgun configuration');
  }

  var self      = this;
  self.opts     = opts;
  self.user     = opts.user;
  self.password = opts.password;
  self.host     = opts.host;
  self.port     = opts.port;
  self.ssl      = opts.ssl;


  function sendEmail(req, opts, callback) {
    _.extend(opts, self.opts);
    var server = email.server.connect(opts);
    if (!server) callback('Could not connect to mail server');
    server.send(opts, callback);
  }

  self.sendContactRequest = function(req, callback) {

    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
        fullName: formatName(req.body.firstName +' '+ req.body.lastName),
        email: req.body.email,
        message: req.body.message
      };

      //send submission response to user
      template(self.opts.templates.contactUserResponse, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.body.email,
          subject: "We Have Received Your Request!",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
          callback();
        });
      });

      //send admin contact request
      template(self.opts.templates.contactAdminResponse, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: "'Nest Egg Guru Admin' <"+admin+">",
          subject: req.body.email + " contact request",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req.body, opts, function(err, message) {
          logger(err || message);
          callback();
        });
      });
    });
  };

  self.send24HourPaymentResponse = function(req, transaction, callback) {  
    emailTemplates(self.opts.templates.templatePath, function(err, template) {   
      if (!template) {    
        callback('Error: Template folder does not exist');   
      }
         
      var name = formatName(req.user.fullName), calculator;

      switch(transaction.purchase) {
        case 'savingsCalculator':
          calculator = 'Premium Savings Calculator';
          break;
        case 'spendingCalculator':
          calculator = 'Premium Spending Calculator';
          break;
        case 'bothCalculators':
          calculator = 'Premium Savings & Premium Spending Calculators';
          break;
        default:
          calculator = 'premium calculators';
      }

      var content = {  
        name: name,
        amount: transaction.amount,
        calculator: calculator,
        expires: moment(new Date(Number(transaction.serviceEndTime))).format('MMMM Do YYYY, h:mm:ss a'),
        domain: domainEnv()
      };

      //send submission response to user
      template(self.opts.templates.paymentUserResponse, content, function(err, html, text) {
        if (err) {     
          callback(err);    
        }
            
        var opts = {
          text: text,
          from: "'Nest Egg Guru' <" + admin + ">",
          to: req.user.email,
          subject: "Thank you for purchasing our Premium Calculator service!",
          attachment: [{      
            data: html,
            alternative: true 
          }]    
        };

        sendEmail(req, opts, function(err, message) {     
          logger(err || message);     
          callback();    
        });   
      });  
    }); 
  };

  self.sendWhiteLabelPaymentResponse = function(req, transaction, company, callback) {
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var startedOn = moment().format('LL');

      var name = formatName(req.user.fullName);
      var content = {
        name: name,
        email: req.user.email,
        subName: Number(transaction.amount) > 30? 'annual' : 'monthly',
        amount: transaction.amount,
        startedOn: startedOn,
        nextPaymentDate: _.emailDate(transaction.serviceEndTime),
        companySubdomain: company.subdomain,
        domain: domainEnv()
      };

      //send submission response to user
      template(self.opts.templates.whiteLabelPaymentUser, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.user.email,
          subject: "Your Nest Egg Guru financial professional branded subscription",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
        });
      });

      //send response to Admin
      template(self.opts.templates.whiteLabelPaymentAdmin, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: "'Nest Egg Guru Admin' <"+admin+">",
          subject: req.user.email + " subscription has been activated!",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
          callback();
        });
      });
    });
  };

  self.sendWhiteLabelUpdateSubscription = function(req, subscription, company, callback) {
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var nextPaymentDate = moment.unix(subscription.current_period_end).format('LL'),
          amount = (subscription.plan.amount / 100).toFixed(2),
          subName;

      if (_.isEqual(subscription.plan.interval, 'month')) {
        subName = 'monthly';
      } else if (_.isEqual(subscription.plan.interval, 'year')) {
        subName = 'annual';
      }

      var name = formatName(req.user.fullName);
      var content = {
        name: name,
        email: req.user.email,
        day: moment.unix(subscription.current_period_end).format('Do'),
        monthly: _.isEqual(subName, 'monthly'),
        subName: subName,
        amount: amount,
        nextPaymentDate: nextPaymentDate,
        companySubdomain: company.subdomain,
        domain: domainEnv()
      };

      //send response to User
      template(self.opts.templates.whiteLabelUpdateSubscriptionUser, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.user.email,
          subject: "Your Nest Egg Guru financial professional subscription status has been updated!",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
        });
      });

      //send response to Admin
      template(self.opts.templates.whiteLabelUpdateSubscriptionAdmin, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: "'Nest Egg Guru Admin' <"+admin+">",
          subject: req.user.email + " subscription has been updated!",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
          callback();
        });
      });
    });
  };

  self.sendWhiteLabelCancelSubscription = function(req, confirmation, company, callback) {
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var currentPeriodEnd = moment.unix(confirmation.current_period_start).format('LL'),
          startedOn = moment.unix(confirmation.start).format('LL'),
          amount = (confirmation.plan.amount / 100).toFixed(2),
          subName;

      if (_.isEqual(confirmation.plan.interval, 'month')) {
        subName = 'monthly';
      } else if (_.isEqual(confirmation.plan.interval, 'year')) {
        subName = 'yearly';
      }

      var name = formatName(req.user.fullName);
      var content = {
        name: name,
        email: req.user.email,
        subName: subName,
        amount: Number(amount),
        startedOn: startedOn,
        currentPeriodEnd: currentPeriodEnd,
        companySubdomain: company.subdomain,
        domain: domainEnv()
      };

      //send response to User
      template(self.opts.templates.whiteLabelCancelUser, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.user.email,
          subject: "Nest Egg Guru subscription cancellation",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
        });
      });

      //send response to Admin
      template(self.opts.templates.whiteLabelCancelAdmin, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: "'Nest Egg Guru Admin' <"+admin+">",
          subject: req.user.email + " cancellation notice",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
          callback();
        });
      });
    });
  };

  self.sendWhiteLabelReactivateSubscription = function(req, subscription, company, callback) {
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var nextPaymentDate = moment.unix(subscription.current_period_end).format('LL'),
          activatedOn = moment().format('LL'),
          amount = (subscription.plan.amount / 100).toFixed(2),
          subName;

      if (_.isEqual(subscription.plan.interval, 'month')) {
        subName = 'monthly';
      } else if (_.isEqual(subscription.plan.interval, 'year')) {
        subName = 'annual';
      }

      var name = formatName(req.user.fullName);
      var content = {
        name: name,
        email: req.user.email,
        subName: subName,
        amount: amount,
        activatedOn: activatedOn,
        nextPaymentDate: nextPaymentDate,
        companySubdomain: company.subdomain,
        domain: domainEnv()
      };

      //send response to User
      template(self.opts.templates.whiteLabelReactivateUser, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.user.email,
          subject: "Your Nest Egg Guru financial professional subscription has been reactivated!",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
        });
      });

      //send response to Admin
      template(self.opts.templates.whiteLabelReactivateAdmin, content, function(err, html, text) {
        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: "'Nest Egg Guru Admin' <"+admin+">",
          subject: req.user.email + " subscription has been reactivated!",
          attachment: [{
            data: html,
            alternative: true
          }]
        };

        sendEmail(req, opts, function(err, message) {
          logger(err || message);
          callback();
        });
      });
    });
  };
}

exports = module.exports = function(opts) {
  return new MailGun(opts);
};
