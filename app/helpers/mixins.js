_.mixin({

  cleanStr: function(str) {
    if (str && typeof str == "string") {
      return str.replace(/-|\s/g,"").toLowerCase();
    }
    return "";
  },

  base64: function(obj) {
    return new Buffer(obj, 'binary').toString('base64');
  },

  lib: function(str) {
    return require('./../lib/'+ str);
  },

  ctrl: function(str) {
    return require('./../controllers/'+ str);
  },

  fromUnix: function(milliSecs) {
    return Number(milliSecs) * 1000;
  },

  toUnix: function(milliSecs) {
    return moment(milliSecs).unix();
  },

  oneDay: function(milliSecs) {
    return Date.now() + Number(milliSecs);
  },

  psqlDate: function(milliSecs) {
    return moment(new Date(milliSecs)).format(psqlDate);
  },

  milliSecsToDate: function(milliSecs) {
    return moment(new Date(Number(milliSecs))).format('LLLL');
  },

  dayToMilliSecs: function(day) {
    return day * 86400000;
  },

  stripe$: function(str) {
    return str * 100;
  },

  setType: function(type) {
    return _.isEmpty(type)? 'Pass' : 'Subscription';
  },

  emailDate: function(milliSecs) {
    return moment(new Date( Number(milliSecs) )).format('LL');
  },

  formatUrl: function(url) {
    var domain = _.isString(url)? url.replace(/^(https?:\/\/)?(www\.)?/,'') : null;
    return _.isNull(domain)? null : 'http://'+ domain.toLowerCase();
  },

  getLastSub: function(allSubs) {
    var subscriptions = _.map(_.sortBy(allSubs, 'id'), function(subscription) {
      return _.isEqual(subscription.calculatorType, 'financialProfessionalMonthly') ||
             _.isEqual(subscription.calculatorType, 'financialProfessionalYearly') ||
             _.isEqual(subscription.calculatorType, 'financialPlanningHawai')? subscription : null;
    });

    return _.without(subscriptions, null).pop();
  },

  formatPhoneNumber: function(phoneNumber) {
    phoneNumber = phoneNumber.toString();
    return phoneNumber.substr(0,3) + "-" + phoneNumber.substr(3,3) + "-" + phoneNumber.substr(6,4);
  }



});
