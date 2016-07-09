/**
 * Created by Tan-PC on 4/6/16.
 */
'use strict';

var emailTemplates = require('email-templates');
var nodemailer = require("nodemailer");
var admin      = require(cwd + '/app/config').admin;

function NodeMailer(opts) {

  if (!opts || !opts.user || !opts.templates) {
    throw new Error('Invalid NodeMailer configuration');
  }

  var self      = this;
  self.opts     = opts;
  var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: opts.user,
      pass: opts.password
    }
  };
  self.smtpTransport = nodemailer.createTransport(smtpConfig);

  self.sendEmailCapture = function(req, callback){
    req.company.user = req.company.user || {}

    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname
      };

      if(req.isFirstTime) {
        //send submission response to user
        template(self.opts.templates.emailCaptureNotification, content, function (err, html, text) {

          if (err) {
            callback(err);
          }

          var opts = {
            text: text,
            from: "'Nest Egg Guru' <info@nesteggguru.com>",
            to: req.company.user.email || req.company.email,
            subject: "New Lead from Nest Egg Guru",
            html: html
          };

          console.log(opts);

          self.smtpTransport.sendMail(opts, function (err, info) {
            console.log(err || info);
            callback();
          });
        });
      }

      //send pdf report to user
      template(self.opts.templates.emailSendFinancialReport, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.body.email,
          subject: "Your Retirement Stress Test Report",
          html: html,
          attachments:{
            filename: req.fileNamePDFReport + req.body.email + '.pdf',
            path: global.rootFolder + '/export/' + req.fileNamePDFReport + req.body.email + '.pdf'
          }
        };

        console.log(opts);

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  };

  //Send email Report issue to Admin
  self.sendReportIssue = function(req, callback){

    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
        email: req.user.email
      };

      //send pdf report to user
      template(self.opts.templates.emailReportIssue, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: env.ADMIN_EMAIL,
          subject: "Report Issue",
          html: html,
          attachments:{
            filename: req.body.data.rad + 'report.png',
            path: global.rootFolder + '/report/' + req.body.data.rad + 'report.png'
          }
        };

        console.log(opts);

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  };

  //Send contact email
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

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
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

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  };

  //Send email trial subscribed
  self.sendTrialSubscribed = function(req, callback) {
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var nextPaymentDate = moment.unix(subscription.current_period_end).format('LL');

      var name = formatName(req.user.fullName);
      var content = {
        name: name,
        email: req.user.email,
        day: moment.unix(subscription.current_period_end).format('Do'),
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

        self.smtpTransport.sendEmail(opts, function(err, message) {
          console.log(err || message);
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

        self.smtpTransport.sendEmail(opts, function(err, message) {
          console.log(err || message);
          callback();
        });
      });
    });
  };

  //email notification about 14 days trial
  self.send14DaysTrialEmail = function(req, callback){
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
      };

      template(self.opts.templates.trialUserNotification, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: req.user.email,
          subject: "14 Days Trial Email",
          html: html
        };

        console.log(opts);

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  }

  //email to notification admin about new trial user
  self.sendNotificationAboutNewTrialUser = function(req, callback){
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
        email: req.user.email
      };

      template(self.opts.templates.trialUserCapture, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: env.ADMIN_EMAIL,
          subject: "New Trial User",
          html: html
        };

        console.log(opts);

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  }

  //email to send user when subdomain over time
  self.sendDomainExpiredEmail = function(userData ,callback){
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
        email: userData.email
      };

      template(self.opts.templates.domainExpired, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: userData.email,
          subject: "Subdomain Expired",
          html: html
        };

        console.log(opts);

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  }

  //email to send list expired domain to admin
  self.sendEmailAboutDomainExpiredForAdmin = function(listEmail ,callback){
    emailTemplates(self.opts.templates.templatePath, function(err, template) {
      if (!template) {
        callback('Error: Template folder does not exist');
      }

      var content = {
        listEmail: listEmail.join(" , ")
      };

      template(self.opts.templates.listSubdomainExpired, content, function(err, html, text) {

        if (err) {
          callback(err);
        }

        var opts = {
          text: text,
          from: "'Nest Egg Guru' <info@nesteggguru.com>",
          to: env.ADMIN_EMAIL,
          subject: "Some Subdomain Will Be Expired Today",
          html: html
        };

        console.log(opts);

        self.smtpTransport.sendMail(opts, function(err, info) {
          console.log(err || info);
          callback();
        });
      });
    });
  }

}

module.exports = function(opts) {
  return new NodeMailer(opts);
};
