var router = require('express').Router();

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
      res.redirect('savings/premium');
    }
    else {
      res.render('calculators/savings', text.freeSavings);
    }
  })
  .post(function(req, res) {

    var calculate = calculator.free.saving;
    var values    = sort.freeSavings(req.body);

    req.session.freeSavingsInputs = req.body;

    calculate(values)
    .then(formatResults)
    .then(function(data) {
      data.keytable.increase = req.body.increase;
      data.keytable.initial  = req.body.percentageContribution + '%';

      req.session.freeSavingsResults = data;

      res.json(data);

      //Create folder directory if it isn't exist
      var dir =global.rootFolder + '/export';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }

      //Define PDF Report
      var manifest = {
        templates: {
          body: global.rootFolder + '/app/templates/calculators/export/savings_export.hbs' // Body is required as its the entry point
        },
        css: global.rootFolder + '/public/css/main.min.css', // Less file to render into css
        output: global.rootFolder + '/export/savings_' + req.body.email + '.pdf', // This is the destination of the newly created PDF
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
      var accumtable = data.accumtable;
      var keytable = data.keytable;

      var input = {
        layout: global.rootFolder + '/app/templates/layout/print',
        premium: false,
        type: 'free',
        titleType: 'Free',
        freeBorderBottom: ' free-border-bottom',
        input: req.body,
        accumtableString: JSON.stringify(accumtable),
        keytableString: JSON.stringify(keytable),
        results: data,
        logo: env.PROTOCOL + req.headers.host + '/img/logo.png',
        favicon: env.PROTOCOL + req.headers.host + '/img/favicon.ico',
        css: env.PROTOCOL + req.headers.host + '/css/main.min.css'
      };

      //Check new user subcribe the company in the first time
      if(req.company && req.body.email != ''){
        if(req.company.lead_gen_tool) {
          input.whiteLabel = {
            url: req.company.url,
            name: req.company.name,
            logo: req.company.logo,
            site: req.company.site
          };

          User
            .getCompanyUser(req.company.id, req.body.email)
            .then(function (data) {
              //just send one time when collect the email
              if (data == 'not_subscribed') {
                User
                  .subcribeCompany(req.company, req.body.email)
                  .then(function (data) {
                    var pdf = new PhantomPDF(manifest, input, function (err) {
                      req.fileNamePDFReport = 'savings_';
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
              //     req.fileNamePDFReport = 'savings_';
              //     req.isFirstTime = false;
              //
              //     //test send email notify for owner
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
    res.render('calculators/print/savings_print', {
      layout: 'layout/print',
      premium: false,
      type: 'free',
      titleType: 'Free',
      freeBorderBottom: ' free-border-bottom',
      dataPath: '/savings/print/data',
      input: req.session.freeSavingsInputs,
      results: req.session.freeSavingsResults
    });
  });

router.route('/print/data')
  .get(function(req, res) {
    res.json(req.session.freeSavingsResults);
  });

router.route('/print/sample')
  .get(function(req, res) {
    req.session.freeSavingsResults = sampleData.savingsResults;

    res.render('calculators/print/savings_print', {
      layout: 'layout/print',
      premium: true,
      premiumCopy: 'Premium ',
      type: 'premium',
      titleType: 'Premium',
      dataPath: '/savings/print/data',
      input: sampleData.savingsInputs,
      results: sampleData.savingsResults,
      company: sampleData.company,
      whiteLabel: sampleData.whiteLabel
    });
  });


router.use(auth.subscription);


router.route('/premium')
  .get(function(req, res) {
    if(req.company){
      if(req.company.lead_gen_tool){
        text.premiumSavings.leadGenTool = req.company.lead_gen_tool;
      }
      else {
        text.premiumSavings.leadGenTool = false;
      }
    }
    res.render('calculators/savings', text.premiumSavings);
  })
  .post(function(req, res) {
    var calculate = calculator.premium.saving;
    var values    = sort.premiumSavings(req.body);

    req.session.premiumSavingsInputs = req.body;
    calculate(values)
    .then(formatResults)
    .then(function(data) {
      data.keytable.increase = req.body.increase;
      data.keytable.initial  = (req.body.contributionOption === '2')? '$' + req.body.dollarContribution : req.body.percentageContribution + '%';

      req.session.premiumSavingsResults = data;

      res.json(data);

      //Create folder directory if it isn't exist
      var dir =global.rootFolder + '/export';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }

      //Render to PDF Report
      var manifest = {
        templates: {
          body: global.rootFolder + '/app/templates/calculators/export/savings_export.hbs' // Body is required as its the entry point
        },
        css: global.rootFolder + '/public/css/main.min.css', // Less file to render into css
        output: global.rootFolder + '/export/savings_premium_' + req.body.email + '.pdf', // This is the destination of the newly created PDF
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
      var accumtable = data.accumtable;
      var keytable = data.keytable;

      var input = {
        premium: true,
        premiumCopy: 'Premium ',
        type: 'premium',
        titleType: 'Premium',
        input: req.body,
        accumtableString: JSON.stringify(accumtable),
        keytableString: JSON.stringify(keytable),
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
                varLog("req.company:", req.company);
                input.infomationReports = companyData.infomationReports;
                input.userData = companyData.userData;
                input.whiteLabel = {
                  url: req.company.url,
                  name: req.company.name,
                  logo: req.company.logo,
                  site: req.company.url
                };
                //just sending one time
                if (data == 'not_subscribed') {
                  User
                    .subcribeCompany(req.company, req.body.email)
                    .then(function (data) {
                      var pdf = new PhantomPDF(manifest, input, function (err) {
                        req.fileNamePDFReport = 'savings_premium_';
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
                //     req.fileNamePDFReport = 'savings_premium_';
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
      dataPath: '/savings/premium/print/data',
      input: req.session.premiumSavingsInputs,
      results: req.session.premiumSavingsResults,
    };

    User.getUserDataForReport(req.company.userId)
    .then(function(data) {
      responseData.infomationReports = data.infomationReports
      responseData.userData = data.userData;

      res.render('calculators/print/savings_print', responseData);
    });

  });

router.route('/premium/print/data')
  .get(function(req, res) {
    res.json(req.session.premiumSavingsResults);
  });

module.exports = router;
