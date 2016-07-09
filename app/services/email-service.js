/*jslint white: true, node:true, browser: true, devel: true, windows: true, forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50 */
'use strict';

var config  = require(cwd +'/app/config');
var madmimi = require(cwd +'/app/services/email/madmimi')(config.madmimi);
var mailgun = require(cwd +'/app/services/email/mailgun')(config.mailgun);
var nodemailer = require(cwd +'/app/services/email/nodemailer')(config.nodemailer);

module.exports = {
  addToNewsletter : function(req, callback){
    madmimi.addToNewsletter(req, callback);
  },
  sendContactRequest : function(req, callback){
    nodemailer.sendContactRequest(req, callback);
  },
  paymentUserResponse : function(req, transaction, callback) {
    mailgun.send24HourPaymentResponse(req, transaction, callback);
  },
  whiteLabelPaymentResponse : function(req, subscription_type, company, callback) {
    mailgun.sendWhiteLabelPaymentResponse(req, subscription_type, company, callback);
  },
  whiteLabelUpdateSubscription : function(req, subscription, company, callback) {
    mailgun.sendWhiteLabelUpdateSubscription(req, subscription, company, callback);
  },
  whiteLabelCancelSubscription : function(req, confirmation, company, callback) {
    mailgun.sendWhiteLabelCancelSubscription(req, confirmation, company, callback);
  },
  whiteLabelReactivateSubscription : function(req, subscription, company, callback) {
    mailgun.sendWhiteLabelReactivateSubscription(req, subscription, company, callback);
  },
  sendEmailCaptureNotification: function(req, callback){
    nodemailer.sendEmailCapture(req, callback);
  },
  sendEmailReportIssue: function(req, callback){
    nodemailer.sendReportIssue(req, callback);
  },
  sendEmailTrialSubscribed: function(req, callback){
    nodemailer.sendTrialSubscribed(req, callback);
  },
  sendEmailAbout14DaysTrial: function(req, callback){
    nodemailer.send14DaysTrialEmail(req, callback);
  },
  sendEmailAboutNewTrialUser: function(req, callback){
    nodemailer.sendNotificationAboutNewTrialUser(req, callback);
  },
  sendEmailAboutDomainExpired: function(user , callback){
    nodemailer.sendDomainExpiredEmail(user, callback);
  },
  emailAboutDomainExpiredForAdmin: function(listEmail, callback){
    nodemailer.sendEmailAboutDomainExpiredForAdmin(listEmail, callback);
  }
};
