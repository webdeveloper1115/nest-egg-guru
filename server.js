var express    = require('express');
var passport   = require('passport');
var stormpath  = require('stormpath');
var bodyParser = require('body-parser');
var session    = require('express-session');
var spStrategy = require('passport-stormpath');
var cronJob = require('cron').CronJob;
var RedisStore = require('connect-redis')(session);

require('dotenv').load();
require('./app/helpers/init');

var app       = express();
var auth      = require('./app/lib/auth');
var subdomain = require('./app/lib/subdomain');
var route     = require('./app/routes/index');
var strategy  = new spStrategy({ expansions : 'groups,customData' });

/**
 * Database initialization
 */
var models = require('./app/models/init')();
global.db  = models.init(require(cwd + '/app/config'));

global.rootFolder = cwd;

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb'}));

/**
 * Reinforce HTTPS / footer version
 */
app.use(function(req, res, next) {
  var environment = process.env.NODE_ENV;

  req.forwardedSecure = (_.isEqual(req.headers['x-forwarded-proto'], 'https'));

  if (_.isEqual(environment, 'staging') || _.isEqual(environment, 'production')) {
    if (!req.forwardedSecure && !req.secure && !process.env.NO_SECURE) {
      return res.redirect('https://' + req.headers.host + req.url);
    }
  }

  res.locals.DEVELOPMENT = _.isEqual(environment, 'development');
  res.locals.PRODUCTION  = _.isEqual(environment, 'production');
  res.locals.DOMAIN      = req.headers.host;
  next();
});

/**
 * View Engine
 */
app.engine('hbs', require('express-hbs').express4({
  defaultLayout : __dirname + '/app/templates/layout/default.hbs',
  partialsDir : __dirname + '/app/templates/layout/partials',
  layoutDir : __dirname + '/app/templates/layout',
  extname : '.hbs'
}));

// configure views path
app.set('view engine', 'hbs');
app.set('views', __dirname + '/app/templates');

/**
 * Session middleware
 */
app.use(bodyParser.json());
app.use(require('compression')())
app.use(require('morgan')('dev'));
app.use(require('cookie-parser')());
app.use(require('multer')({ inMemory : true }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(session({
  store : new RedisStore(),
  secret : process.env.EXPRESS_SECRET,
  key : 'sid',
  resave : true,
  saveUninitialized : true,
  cookie : { secure : false }
}));

/**
 * Authentication middleware
 */
passport.use(strategy);
passport.serializeUser(strategy.serializeUser);
passport.deserializeUser(strategy.deserializeUser);

app.use(require('connect-flash')());
app.use(passport.initialize());
app.use(passport.session());
app.use(auth.user);

app.use(subdomain.check);
app.use(subdomain.active);

/**
 * Routes
 */
app.use('/', route.root);
app.use('/user', route.user);
app.use('/savings', route.savings);
app.use('/spending', route.spending);
app.use('/checkout', route.checkout);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * Error handlers
 */

// Development/staging error handler will print stacktrace
if (_.isEqual(app.get('env'), 'development') || _.isEqual(app.get('env'), 'staging')) {
  app.use(function(err, req, res, next) {
    d(err)
    res.status(err.status || 500);
    res.render('error', { message : err.message, error : err });
  });
}

/**
 * Production error handler
 */

// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', { message : err.message, error : {} });
});

app.listen(env.PORT || 3000, function() {
  console.log('Listening on port %d', this.address().port);
});


/**
 * CronJob for check subdomain expired
 */
 var email = require("./app/lib/email");
 var job = new cronJob('00 00 00 * * *', function() {
  /*
   * Runs everyday
   * at 00:00:00 AM.
   */
   db.companies.findByExpiredDomain().then(function(listCompany){
     if(listCompany.length){
       listUserEmail = _.map(listCompany, function(company){
         return company.user.email;
       });

       console.log(listUserEmail);
       email.Expire(listUserEmail);
     }
   }, function(err){
     d(err);
   });

 },null,
  true
);
