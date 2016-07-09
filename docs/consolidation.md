# Differences
- white-label has over nest-egg-guru

* white-label utilizes bootstrap where nest-egg-guru utilizes bootstrap
* all assets & views are immensely different due to redesign

### Dependencies
- method-override
- dotenv

#### Dev Dependencies
- del
- browsersync
- run-sequence
- stream-combine
- jshint-stylish
- gulp-util
- gulp-changed

### Server
- express-hbs3 (in white-label) vs. express-hbs-4 (nest-egg-guru)
- white-label is missing https reinforced middleware
  `
  /**
  * Reinforce HTTPS / footer version
  */
  app.use(function(req, res, next){
    var environment = env.NODE_ENV;
    req.forwardedSecure = (req.headers["x-forwarded-proto"] == "https");

    if(_.isEqual(environment, 'staging') || _.isEqual(environment, 'production')) {
      if (!req.forwardedSecure && !req.secure) {
        res.redirect("https://" + req.headers.host + req.url);
      }
    }

    res.locals.PROD_MODE = _.isEqual('production', environment);
    res.locals.VERSION   = config.version; // current dev version in footer
    next();
  });
  `
- white-label is using method-override (puts/deletes)

- white-label has a handlebar conditional
  `
  // if condition handlebar helper
  hbs.registerHelper('compare', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  `
- white-label has the 2 middle ware to handle sub-domains
  - checkSubdomain
  - activeSubdomain

### Lib
  - helpers is heavily re-factored in nest-egg-guru and consolidated into a file rather than a directory
  - default scripts for interpolation are no longer required in nest-egg-guru due to d3 rather than jqplot
  - white-label has a seed script for db

### Routes
  - white-label has an admin file that also has controller logic in the same file
    - nest-egg-guru does not have a admin route file
    - white-label has admin login, with some CRUD capabilities
  - index file in nest-egg-guru handles most static views i.e: faq, contact, financial_professionals, index, etc
  - savings/spendings differs immensely from each other
    - nest-egg-guru doesn't coerce the order in the router, instead utilizes a helper method
    - nest-egg-guru also utilizes promises for the posts

### Models
  - Company          = identical
  - Stipe_user       = identical
  - subscription     = identical
  - subscripton_type = identical
  - Transaction      = identical
  - Users            = identical

### Controllers
  - white-label has no controller directory
  - nest-egg-guru controllers handles stripe payments (checkout), user (signup, login, subscription), company (signup, login, subscription)

### Configs
  - identical

### Services
  - identical

### Gulp
  - Gulp process is extremely different between the 2
  - white-label's structure utilizes a directory with a file for every task whereas nest-egg-guru is a single file
  - other than browsersync they perform the same tasks


# Proposal for consolidation
- Merge package.json, and then frozen utilizing shrink-wrap
  - installing differences
  * need a decision to either utilize browsersync or not

- Set up workflow
  * suggest to utilizes nest-egg-guru due to it's already in use for the redesign

- setting up server file, to add the extra middleware to handle sub domain checking
  - research the handlebars conditional middleware in server file

- Merge lib
  - add the middleware for the subdomain logic
  - refactor middleware

- Merging routes will be the bulk of the work
  - need to dissect controller logic from admin route into controllers dir
  - refactor for RESTful

  - Routing
    - index file:
      - '/'              = index
      - '/about'         = about
      - '/faq'           = faq
      - '/contact'       = contact
      - '/professionals' = financial_professionals

    - savings file:
      - '/savings'         = free savings calculator
      - '/savings/premium' = premium savings calculator

    - spending file:
      - '/spending'         = free spending calculator
      - '/spending/premium' = premium spending calculator

    - user file:
      - '/user/register/:type'  = user registration
      - '/user/login/:type'     = user login
      - '/user/logout'          = user logout
      - '/user/forgot-password' = password recovery
      - '/user/reset-password'  = reset password

    - checkout file:
      - '/checkout/:type'         = purchase choice
      - '/checkout/:type/confirm' = confirm purchase
      - '/checkout/:type/success' = review purchase / call to action

- May I re-factor controller logic???????
  - simplification
  - utilizing promises to return to routes rather than callbacks