'use-strict';

var Stormpath = _.lib('stormpath');

exports.register = function(input) {
  return new Promise(function(resolve, reject) {

    Stormpath.getApp()
    .then(function(app) {
      return { app: app, input: input };
    })
    .then(Stormpath.createAcct)
    .then(function(account) {
      input.spHref = account.href;

      return input;
    })
    .then(db.users.saveUser)
    .then(function(user) {
      resolve(input.spHref);
    })
    .catch(reject);

  });
};

exports.login = function(user) {
  return new Promise(function(resolve, reject) {

    Stormpath.getApp()
    .then(function(app) {
      return { app: app, user: user };
    })
    .then(Stormpath.authAcct)
    .then(function(account) {
      resolve(account.href);
    })
    .catch(reject);

  });
};

exports.getSubscriptions = function(email) {
  var defer = Q.defer();
  var data  = {};

  db
  .users
  .find({
    where: { email: email },
    include: [db.subscriptions]
  })
  .then(function(user) {
    user.subscriptions = getLastFinancialProfessionalSubscription(user.subscriptions);
    data.user = user;

    defer.resolve(data);
  })
  .catch(defer.reject);

  return defer.promise;
};

exports.dashboard = function(email) {
  return new Promise(function(resolve, reject) {

    db
    .users
    .findByEmail(email)
    .then(function(user) {
      return user.id;
    })
    .then(db.users.findById)
    .then(function(user) {
      user.account = true;

      if (!_.isNull(user.company)) {
        user.company.DOMAIN = domainEnv();
      }

      resolve({
        user: user,
        company: user.company || null,
        subscriptions: _.getLastSub(user.subscriptions)
      });
    })
    .catch(reject);

  });
};

exports.update = function(data) {
  return new Promise(function(resolve, reject) {
    var input = data.input;
    var S3    = _.lib('s3');

    db
    .users
    .findByEmail(data.user.email)
    .then(function(user) {
      return _.isNull(user)? reject('No user found') : user;
    })
    .then(function(user) {
      return {
        user: user,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        proDesignation: input.proDesignation
      };
    })
    .then(db.users.updateInfo)
    .then(function(user) {
      var reqUser = data.user;

      // set stormpath info
      reqUser.givenName = user.firstName;
      reqUser.surname   = user.lastName;
      reqUser.username  = user.email;
      reqUser.email     = user.email;

      reqUser.save(reject);

      return user.id;
    })
    .then(db.users.findById)
    .then(function(user) {
      return _.isNull(user.company)? resolve(user) : user.id;
    })
    .then(db.companies.findByUserId)
    .then(function(company) {
      data.company = company;

      if (!_.isUndefined(data.logo)) {
        data.logo.subdomain = company.subdomain;
      };
      return data.logo;
    })
    .then(S3.upload)
    .then(function(logo) {
      input.logo = logo ? logo : input.logo;
      return {
        company: data.company,
        input: input
      };
    })
    .then(db.companies.updateInfo)
    .then(function(company) {
      resolve(company);
    })
    .catch(reject);

  });
};

exports.recoverPassword = function(email) {
  return new Promise(function(resolve, reject) {

    db
    .users
    .find({ where: { email: email } })
    .success(function(user) {
      return _.isNull(user)? resolve('Email does not exist!') : user.email;
    })
    .then(Stormpath.getApp)
    .then(function(app){
      return { app: app, email: email };
    })
    .then(Stormpath.recoverPassword)
    .then(function(resetToken) {
      resolve('Password reset instructions have been sent to your inbox!');
    })
    .catch(reject);

  });
};

exports.resetPassword = function(input) {
  return new Promise(function(resolve, reject) {

    if (!_.isEqual(input.password, input.confirmPassword)) {
      resolve('Passwords Do Not Match!');
    } else {
      Stormpath.getApp()
      .then(function(app) {
        return {
          app: app,
          sptoken: input.sptoken,
          password: input.password
        };
      })
      .then(Stormpath.resetPassword)
      .then(function(response) {
        resolve('Passwords Changed and Updated!');
      })
      .catch(reject);
    }

  });
};

exports.subcribeCompany = function(company, userEmail) {
  return new Promise(function(resolve, reject) {

    db
      .company_users
      .saveFirstUser(company, userEmail)
      .then(function(company) {
        resolve(company);
      })
      .catch(reject);

  });
};

exports.getCompanyUser = function(companyId, userEmail) {
  return new Promise(function(resolve, reject) {

    db
      .company_users
      .findByCompanyId(companyId, userEmail)
      .then(function(company) {

        if(_.isNull(company)){
          resolve('not_subscribed');
        }else{
          resolve('subscribed');
        }
      })
      .catch(reject);

  });
};

exports.getUserDataForReport = function(userId) {
  return new Promise(function(resolve, reject) {

    // get advisor info
    db.users.findById(userId)
    .then(function(data) {
      // get customize infomation reports
      var infomationReports = {};
      if (data.company && data.company.infomation_reports) {
        var arrayInfomationReports = JSON.parse(data.company.infomation_reports) || [];
        _.each(arrayInfomationReports, function(value) {
          infomationReports[value] = value;
        });
      }

      data.company.phone = _.formatPhoneNumber(data.company.phone);

      resolve({
        infomationReports: infomationReports,
        userData: data
      });
    })
    .catch(reject);

  });
};

exports.checkEmail = function(_email) {
  return new Promise(function(resolve, reject) {
    db
    .users
    .findByEmail(_email)
    .then(function(user) {
      varLog("USER_PARA", user);
      if (!user || !user.id) {
        resolve("That email available.");
      }
      else {
        reject("That email already exists.");
      }
    })
    .catch(reject);
  });
};
