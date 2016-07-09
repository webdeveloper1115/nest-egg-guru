'use-strict';

module.exports = (function () {
  var Email = require(cwd +'/app/services/email-service');

  var subscription = function(req) {
    return new Promise(function(resolve, reject) {

      db
      .users
      .findByEmail(req.user.email)
      .then(function(user) {
        return user.id;
      })
      .then(db.users.findById)
      .then(function(user) {
        var transaction = {};
        var input = req.session.input;

        if (input) {
          transaction.amount = input.amount? input.amount : '30.00';
          transaction.serviceEndTime = input.expires? input.expires : Date.now();
        }

        Email.whiteLabelPaymentResponse(req, transaction, user.company, function(err) {
          err? reject(err) : resolve(req);
        });
      })
      .catch(reject);

    });
  };

  var pass = function(req) {
    return new Promise(function(resolve, reject) {

      db
      .users
      .findByEmail(req.user.email)
      .then(function(user) {
        return user.id;
      })
      .then(db.users.findById)
      .then(function(user) {
        var transaction = {};
        var input = req.session.input;

        if (input) {
          transaction.purchase = input.purchase? input.purchase : 'none specified';
          transaction.amount = input.amount? input.amount : '1.99';
          transaction.serviceEndTime = input.expires? input.expires : Date.now();
        }

        Email.paymentUserResponse(req, transaction, function(err) {
          err? reject(err) : resolve(req);
        });
      })
      .catch(reject);

    });
  };

  var trial = function(req) {
    return new Promise(function(resolve, reject) {
      Email.sendEmailAbout14DaysTrial(req, function(err) {
        Email.sendEmailAboutNewTrialUser(req, function(error){
            err = error || err
            err? reject(err) : resolve(req);
        })
      });
    });
  };

  var expire = function(expiredEmailList){
    if(typeof expiredEmailList == "string"){
      expiredEmailList = [expiredEmailList]
    }
    var emailHandler = [];
    //send email to user that owned expired domain
    _.each(expiredEmailList, function(email){
      var tmp = function(){
        return new Promise(function(resolve, reject) {
          Email.sendEmailAboutDomainExpired({email: email}, function(err) {
            err? reject(err) : resolve(email);
          });
        });
      };
      emailHandler.push(tmp());
    })

    return Promise.all(emailHandler).then(function(listEmail){
      //send email to admin
      Email.emailAboutDomainExpiredForAdmin(expiredEmailList, function(err){
        if(err){
          d(err);
          console.log(err);
          throw(err);
        }else{
          return expiredEmailList;
        }
      })
    })
  }

  return {
    Subscription: subscription,
    Pass: pass,
    Trial: trial,
    Expire: expire
  };

}());
