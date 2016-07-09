var router = require('express').Router();
var auth   = _.lib('auth');
var User   = _.ctrl('users');
var emailService = require("../services/email-service");
var fs = require('fs');

router.use(function(req, res, next) {
  res.locals.user  = req.user;
  next();
});

router.get('/', function(req, res) {
  var locals = {
    savingsPurchased: false,
    spendingPurchased: false
  };

  res.render('index', auth.subscriptions(req, locals));
});


router.route('/about')
  .get(function(req, res) {
    res.render('about');
});

router.route('/features')
  .get(function(req, res) {
    if (req.user) {
      User
      .dashboard(req.user.email)
      .then(function(user) {
        var locals = {};
        if (user.company) {
          locals.manageSubscription = true;
          if (user.subscriptions) {
            locals.subscriptions = user.subscriptions.calculatorType;
          }
        }

        res.render('features', locals);
      })
      .catch(function(err) {
        d(err);
        res.redirect('/');
      });
    } else {
      res.render('features');
    }
});


router.route('/contact')
  .get(function(req, res) {
    res.render('contact');
  })
  .post(function(req, res) {
    var email = require('../services/email-service');
    var valid = require('validator').isEmail(req.body.email);

    if (valid) {
      email.sendContactRequest(req, function(err) {
        if (err) console.log(err);
      });
    }

    res.json(valid? '.email-sent' : '#invalid-email');
  });

router.get('/faq', function(req, res) {
  res.render('faq');
});

router.route('/book-demo')
  .get(function(req, res) {
    res.render('book_demo');
  })
  .post(function(req, res) {
    var email = require('../services/email-service');
    var valid = require('validator').isEmail(req.body.email);

    if (valid) {
      email.sendContactRequest(req, function(err) {
        if (err) console.log(err);
      });
    }

    res.json(valid? '.email-sent' : '#invalid-email');
  });

router.get('/site', function(req, res) {
  res.render('sitemap');
});

router.get('/privacy-policy', function(req, res) {
  res.render('privacy_policy');
});

router.get('/financial-professionals', function(req, res, next) {
  if (req.user) {
    User
    .dashboard(req.user.email)
    .then(function(user) {
      var locals = {};
      if (user.company) {
        locals.manageSubscription = true;
      }

      res.render('financial_professionals', locals);
    })
    .catch(function(err) {
      d(err);
      res.redirect('/');
    });
  } else {
    res.render('financial_professionals');
  }
});

router.post('/report', function(req, res){

  var matches = req.body.data.img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  // write buffer to file
  fs.writeFile(global.rootFolder + '/report/'+req.body.data.rad +'report.png', response.data, function(err) {
    //test send email notify for owner
    if(req.user) {
      emailService.sendEmailReportIssue(req, function (err) {
        console.log("Error: ", err);
      });
    }
  });
});

router.post('/check-subdomain', function(req, res){
  db
  .companies
  .checkSubdomain(req.body.subdomain)
  .then(function(company){
    res.json("true");
  }, function(err){
    res.json(err);
  })
});


module.exports = router;
