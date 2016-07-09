/*jslint node:true, white: true, browser: true, devel: true, windows: true, forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 2, maxerr: 50, camelcase:false */
'use strict';

module.exports = {
  version: env.VERSION,
  admin: env.ADMIN_USER,
  madmimi: {
    endpoint: 'api.madmimi.com',
    user: 'Guru@NestEggGuru.com',
    api_key: env.MADMIMI_API_KEY,
    newsletter: 'Newsletter-staging',
    ssl: true,
    debug: true
  },
  nodemailer: {
    user: env.NODE_MAILER_USER,
    password: env.NODE_MAILER_PSWD,
    templates : {
      templatePath : process.cwd() + '/app/templates/email/',
      emailCaptureNotification: "email-capture-notification",
      emailSendFinancialReport: "email-send-financial-report",
      emailReportIssue: "email-report-issue",
	  contactUserResponse : 'contact-submission-user-email',
      contactAdminResponse : 'contact-submission-admin-email',
      trialUserNotification: "trial-user-notification",
      trialUserCapture: "trial-user-capture",
      domainExpired: "domain-expired",
      listSubdomainExpired:"list-subdomain-expired"
    }
  },
  mailgun: {
    user: 'postmaster@sandboxa5bde56d57e343db92fc88e80230b3bb.mailgun.org',
    password: env.MAILGUN_PSWD,
    host: 'smtp.mailgun.org',
    port: '465',
    ssl: true,
    templates: {
      templatePath: process.cwd() + '/app/templates/email/',
      contactUserResponse: 'contact-submission-user-email',
      contactAdminResponse: 'contact-submission-admin-email',
      paymentUserResponse: 'payment-submission-user-email',
      whiteLabelPaymentUser: 'payment-white-label-user',
      whiteLabelPaymentAdmin: 'payment-white-label-admin',
      whiteLabelUpdateSubscriptionUser: 'white-label-update-subscription-user',
      whiteLabelUpdateSubscriptionAdmin: 'white-label-update-subscription-admin',
      whiteLabelReactivateUser: 'white-label-reactivate-user',
      whiteLabelReactivateAdmin: 'white-label-reactivate-admin',
      whiteLabelCancelUser: 'white-label-cancel-user',
      whiteLabelCancelAdmin: 'white-label-cancel-admin'
    }
  },
  database: {
    host: 'localhost',
    database_name: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PSWD,
    port: '5432'
  }
};
