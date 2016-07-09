var router     = require('express').Router();

var auth       = _.lib('auth');
var User         = _.ctrl('users');
var sampleData = _.lib('sample-data');
var calculator = require('../../lib/nest-egg-calculator');

var emailService = require("../services/email-service");
var fs = require('fs');

var PhantomPDF = require('phantom-pdf');
var phantom = require('phantom');


router.route('/')
  .get(function(req, res) {
    if(req.company){
      res.redirect('spending/premium');
    }
    else {
      res.render('calculators/spending', text.freeSpending);
    }
  })
  .post(function(req, res) {
    var calculate = calculator.free.spending;
    var values    = sort.freeSpending(req.body);

    req.session.freeSpendingInputs = req.body;

    calculate(values)
    .then(formatResults)
    .then(formatData)
    .then(function(data) {
      req.session.freeSpendingResults = data;

      res.json(data);

      //Create folder directory if it isn't exist
      var dir =global.rootFolder + '/export';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }

      //Render PDF Report phantom-pdf
      var manifest = {
        templates: {
          body: global.rootFolder + '/app/templates/calculators/export/spending_export.hbs' // Body is required as its the entry point
        },
        css: global.rootFolder + '/public/css/main.min.css', // Less file to render into css
        output: global.rootFolder + '/export/spending_' + req.body.email + '.pdf', // This is the destination of the newly created PDF
        helpers: global.rootFolder + '/app/helpers/phantoms.js',
        helperVariables: {},
        // Settings to be passed into phantom
        // List of settings: http://phantomjs.org/api/webpage/
        phantomSettings: {
          paperSize: {
            format: 'Letter',
            orientation: 'portrait',
            margin: {
              top: '0.25in',
              right: '0.5in',
              bottom: '0.25in',
              left: '0.5in'
            }
          }
        }
      };
      var chartData = data.chartData;
      var keytable = data.keytable;
      var tableHead = data.tableHead;
      var rbtable = data.rbtable;
      var incometable = data.incometable;

      var input = {
        premium: false,
        type: 'free',
        titleType: 'Free',
        freeBorderBottom: ' free-border-bottom',
        input: req.body,
        chartDataString: JSON.stringify(chartData),
        keytableString: JSON.stringify(keytable),
        tableHeadString: JSON.stringify(tableHead),
        rbtableString: JSON.stringify(rbtable),
        incometableString: JSON.stringify(incometable),
        results: data,
        logo: env.PROTOCOL + req.headers.host + '/img/logo.png',
        favicon: env.PROTOCOL + req.headers.host + '/img/favicon.ico',
        css: env.PROTOCOL + req.headers.host + '/css/main.min.css'
      };

      //Check new user subcribe the company in the first time
      if(req.company && req.body.email != ''){
        if(req.company.lead_gen_tool) {
          User
            .getCompanyUser(req.company.id, req.body.email)
            .then(function (data) {
              //just send one time when collect the email
              if (data == 'not_subscribed') {
                User
                  .subcribeCompany(req.company, req.body.email)
                  .then(function (data) {
                    var pdf = new PhantomPDF(manifest, input, function (err) {
                      req.fileNamePDFReport = 'spending_';
                      req.isFirstTime = true;

                      //test send email notify for owner
                      emailService.sendEmailCaptureNotification(req, function (err) {
                        console.log("Error: ", err);
                      });
                    });
                  })
                  .catch(function (err) {
                    d(err);
                    return res.redirect('/user/login');
                  });
              }
              // else {
              //   var pdf = new PhantomPDF(manifest, input, function (err) {
              //     req.fileNamePDFReport = 'spending_';
              //     req.isFirstTime = false;
              //
              //     emailService.sendEmailCaptureNotification(req, function (err) {
              //       console.log("Error: ", err);
              //     });
              //   });
              // }
            })
            .catch(function (err) {
              d(err);
            });
        }
      }
    });
  });

router.route('/print')
  .get(function(req, res) {
    res.render('calculators/print/spending_print', {
      layout: 'layout/print',
      premium: false,
      type: 'free',
      titleType: 'Free',
      freeBorderBottom: ' free-border-bottom',
      dataPath: '/spending/print/data',
      input: req.session.freeSpendingInputs,
      results: req.session.freeSpendingResults
    });
  });

router.route('/print/data')
  .get(function(req, res) {
    res.json(req.session.freeSpendingResults);
  });

router.route('/print/sample')
  .get(function(req, res) {
    req.session.freeSpendingResults = sampleData.spendingResults;

    res.render('calculators/print/spending_print', {
      layout: 'layout/print',
      premium: true,
      premiumCopy: 'Premium ',
      type: 'premium',
      titleType: 'Premium',
      dataPath: '/spending/print/data',
      input: sampleData.spendingInputs,
      results: sampleData.spendingResults,
      company: sampleData.company,
      whiteLabel: sampleData.whiteLabel
    });
  });


router.use(auth.subscription);


router.route('/premium')
  .get(function(req, res) {
    if(req.company){
      if(req.company.lead_gen_tool){
        text.premiumSpending.leadGenTool = req.company.lead_gen_tool;
      }
      else {
        text.premiumSpending.leadGenTool = false;
      }
    }
    res.render('calculators/spending', text.premiumSpending);
  })
  .post(function(req, res) {
    var calculate = calculator.premium.spending;
    var values    = sort.premiumSpending(req.body);

    req.session.premiumSpendingInputs = req.body;

    calculate(values)
    .then(formatResults)
    .then(formatData)
    .then(function(data) {
      req.session.premiumSpendingResults = data;

      res.json(data);

      //Create folder directory if it isn't exist
      var dir =global.rootFolder + '/export';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }

      //Render PDF Report phantom-pdf
      var manifest = {
        templates: {
          body: global.rootFolder + '/app/templates/calculators/export/spending_export.hbs' // Body is required as its the entry point
        },
        css: global.rootFolder + '/public/css/main.min.css', // Less file to render into css
        output: global.rootFolder + '/export/spending_premium_' + req.body.email + '.pdf', // This is the destination of the newly created PDF
        helpers: global.rootFolder + '/app/helpers/phantoms.js',
        helperVariables: {},
        // Settings to be passed into phantom
        // List of settings: http://phantomjs.org/api/webpage/
        phantomSettings: {
          paperSize: {
            format: 'Letter',
            orientation: 'portrait',
            margin: {
              top: '0.25in',
              right: '0.5in',
              bottom: '0.25in',
              left: '0.5in'
            }
          }
        }
      };
      var chartData = data.chartData;
      var keytable = data.keytable;
      var tableHead = data.tableHead;
      var rbtable = data.rbtable;
      var incometable = data.incometable;

      var input = {
        premium: true,
        type: 'premium',
        titleType: 'Premium',
        premiumCopy: 'Premium ',
        freeBorderBottom: ' free-border-bottom',
        input: req.body,
        chartDataString: JSON.stringify(chartData),
        keytableString: JSON.stringify(keytable),
        tableHeadString: JSON.stringify(tableHead),
        rbtableString: JSON.stringify(rbtable),
        incometableString: JSON.stringify(incometable),
        results: data,
        logo: env.PROTOCOL + req.headers.host + '/img/logo.png',
        favicon: env.PROTOCOL + req.headers.host + '/img/favicon.ico',
        css: env.PROTOCOL + req.headers.host + '/css/main.min.css'
      };

      //Check new user subcribe the company in the first time
      if(req.company && req.body.email != ''){
        if(req.company.lead_gen_tool) {
          User
            .getCompanyUser(req.company.id, req.body.email)
            .then(function (data) {
              User.getUserDataForReport(req.company.userId).then(function(companyData) {
                varLog("data", companyData);
                input.infomationReports = companyData.infomationReports
                input.userData = companyData.userData;
                input.whiteLabel = {
                  url: req.company.url,
                  name: req.company.name,
                  logo: req.company.logo,
                  site: req.company.url
                };
                if (data == 'not_subscribed') {
                  User
                    .subcribeCompany(req.company, req.body.email)
                    .then(function (data) {
                      var pdf = new PhantomPDF(manifest, input, function (err) {
                        req.fileNamePDFReport = 'spending_premium_';
                        req.isFirstTime = true;
                        //test send email notify for owner
                        emailService.sendEmailCaptureNotification(req, function (err) {
                          console.log("Error: ", err);
                        });
                      });

                    })
                    .catch(function (err) {
                      d(err);
                      return res.redirect('/user/login');
                    });
                }
                // else {
                //   var pdf = new PhantomPDF(manifest, input, function (err) {
                //     req.fileNamePDFReport = 'spending_premium_';
                //     req.isFirstTime = false;
                //     //test send email notify for owner
                //     emailService.sendEmailCaptureNotification(req, function (err) {
                //       console.log("Error: ", err);
                //     });
                //   });
                // }
              });
            })
            .catch(function (err) {
              d(err);
            });
        }
      }

    });
  });

router.route('/premium/print')
  .get(function(req, res) {

    // get advisor info
    var responseData = {
      layout: 'layout/print',
      premium: true,
      premiumCopy: 'Premium ',
      type: 'premium',
      titleType: 'Premium',
      dataPath: '/spending/premium/print/data',
      input: req.session.premiumSpendingInputs,
      results: req.session.premiumSpendingResults,
    };

    User.getUserDataForReport(req.company.userId)
    .then(function(data) {
      responseData.infomationReports = data.infomationReports
      responseData.userData = data.userData;

      res.render('calculators/print/spending_print', responseData);
    });
  });

router.route('/premium/print/data')
  .get(function(req, res) {
    res.json(req.session.premiumSpendingResults);
  });

module.exports = router;
