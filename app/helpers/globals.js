var _ = require('lodash');

// Default values on saving and spending calculators
var calculatorDefaultValues = {
  saving: {
    years: 25,    // Years until retirement
    curSaving: 100000,  // Current retirement nest egg value
    curSalary: 50000,   // Current annual salary/wages
    expContrib: 10,     // Total expected annual retirement contribution:
    contribRate: 3,     // Rate at which you expect your contribution amount will increase each year
    BAA: {
      stock: 80,
      bond: 20,
      cash: 0,
    },
    DSA: {
      large: 45,
      mid: 30,
      foreign: 25
    },
    cdRate: 2,
    moneyRate: 0,
    investmentRate: 1,
  },
  spending: {
    years: 30,
    curSpending: 1000000,
    expSpending: 45000,
    living: 3,
    BAA: {
      stock: 60,
      bond: 30,
      cash: 10,
    },
    DSA: {
      large: 45,
      mid: 30,
      foreign: 25
    },
    cdRate: 2,
    moneyRate: 0,
    investmentRate: 1,
  },
};

var helpers = {

  _: _,

  env: process.env,

  cwd: process.cwd(),

  Q: require('q'),

  moment: require('moment'),

  Promise: require('bluebird'),

  d: require('eyes').inspector({ maxLength: -1 }),

  psqlDate: 'YYYY-MM-DD HH:mm:ss-10',

  daysTrial: 14,

  domainEnv: function() {
    var domain;

    switch(process.env.NODE_ENV) {
      case 'staging':
        domain = 'staging.nesteggguru.com';
        break;
      case 'production':
        domain = 'nesteggguru.com';
        break;
      default:
        domain = 'localhost:3000'
        break;
    }

    return domain;
  },

  setUser: function(user) {
    return user? {
      href: user.href,
      username: user.username,
      email: user.email,
      givenName: user.givenName,
      middleName: user.middleName,
      surname: user.surname,
      fullName: user.fullName,
      status: user.status,
      createdAt: user.createdAt,
      modifiedAt: user.modifiedAt,
      emailVerificationToken: user.emailVerifcationToken,
      active: 'active',
      customData: {
        bothCalculators: user.customData.bothCalculators,
        savingsCalculator: user.customData.savingsCalculator,
        spendingCalculator: user.customData.spendingCalculator
      }
    } : undefined;
  },

  getAccountInfo: function(input) {
    return input ? {
      username: input.email,
      password: input.password,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: input.firstName + " " + input.lastName,
      proDesignation: input.proDesignation,
      purchase: input.purchase,
      status: 'active',
      active: 'active',
      customData: {
        bothCalculators: 1,
        savingsCalculator: 0,
        spendingCalculator: 0
      }
    } : undefined;
  },

  getValues: function(object) {
    var values = [];

    _.forIn(object, function(val, key) {
      values.push(Number(val));
    });

    return values;
  },

  formatResults: function(results) {
    var defer = Q.defer();

    _.forIn(results, function(value) {
      _.forIn(value, function(val, key) {
        var newName = key.replace(/\W/g, '');

        if (_.isArray(val)) {
          value[newName] = _.map(val, function(va) {
            return Number(va).toFixed(0);
          });
        } else if (_.isEqual(newName, "ProbabilityofSuccessinHorizonPeriod")) {
          value[newName] = Number(val * 100).toFixed(0);
        } else if ( _.isEqual(newName, "PercentageofTimeSavingsFailed")) {
          value[newName] = Number(val * 100).toFixed(0);
        } else {
          value[newName] = Number(val).toFixed(0);
        }

        delete value[key];
      });
    });

    defer.resolve(results);

    return defer.promise;
  },

  formatData: function(results) {
    var years     = +results.keytable.NumberofYearsinRetirementHorizon / 5;
    var chartData = [], yearsAxis = [], yearsHeader = [], num = 0;
    var defer     = Q.defer();

    _.times(years, function(i) {
      var obj = {};
      num += 5;

      obj[num+'years'] = 'After '+ num +' Years';
      yearsHeader.push(obj);
      yearsAxis.push(num+'+ Years');
    });

    _.forEach(yearsAxis, function(year, i) {
      var obj    = {};

      obj.values = [];
      obj.year   = year;

      _.forIn(results.rbtable, function(val, key) {
        obj.values.push({ name: key, value: +val[i] });
      });

      chartData.push(obj);
    });

    results.rbtable = _.reduce(results.rbtable, function(result, value, key) {
      value = _.map(value, function(val) {
        return '$'+val;
      });

      result[key] = _.take(value, years);
      return result;
    }, {});

    results.tableHead = yearsHeader;
    results.chartData = chartData;

    defer.resolve(results);

    return defer.promise;
  },

  getLastFinancialProfessionalSubscription: function(allSubscriptions) {
    var subscriptions = _.map(_.sortBy(allSubscriptions, 'id'), function(subscription) {
      return _.isEqual(subscription.calculatorType, 'financialProfessionalMonthly') ||
             _.isEqual(subscription.calculatorType, 'financialProfessionalYearly') ||
             _.isEqual(subscription.calculatorType, 'financialPlanningHawai')? subscription : null;
    });

    return _.without(subscriptions, null).pop();
  },

  isValidCalculatorType: function(calculatorParam) {
    var availableCalculators = ['premium-savings-calculator', 'premium-spending-calculator'];
    return availableCalculators.indexOf(calculatorParam) > -1;
  },

  removeTLD: function(domain) {
    return domain.replace(/^(?:[a-z0-9\-\.]+\.)??([a-z0-9\-]+)(?:\.com|\.net|\.org|\.biz|\.ws|\.in|\.me|\.co\.uk|\.co|\.org\.uk|\.ltd\.uk|\.plc\.uk|\.me\.uk|\.edu|\.mil|\.br\.com|\.cn\.com|\.eu\.com|\.hu\.com|\.no\.com|\.qc\.com|\.sa\.com|\.se\.com|\.se\.net|\.us\.com|\.uy\.com|\.ac|\.co\.ac|\.gv\.ac|\.or\.ac|\.ac\.ac|\.af|\.am|\.as|\.at|\.ac\.at|\.co\.at|\.gv\.at|\.or\.at|\.asn\.au|\.com\.au|\.edu\.au|\.org\.au|\.net\.au|\.id\.au|\.be|\.ac\.be|\.adm\.br|\.adv\.br|\.am\.br|\.arq\.br|\.art\.br|\.bio\.br|\.cng\.br|\.cnt\.br|\.com\.br|\.ecn\.br|\.eng\.br|\.esp\.br|\.etc\.br|\.eti\.br|\.fm\.br|\.fot\.br|\.fst\.br|\.g12\.br|\.gov\.br|\.ind\.br|\.inf\.br|\.jor\.br|\.lel\.br|\.med\.br|\.mil\.br|\.net\.br|\.nom\.br|\.ntr\.br|\.odo\.br|\.org\.br|\.ppg\.br|\.pro\.br|\.psc\.br|\.psi\.br|\.rec\.br|\.slg\.br|\.tmp\.br|\.tur\.br|\.tv\.br|\.vet\.br|\.zlg\.br|\.br|\.ab\.ca|\.bc\.ca|\.mb\.ca|\.nb\.ca|\.nf\.ca|\.ns\.ca|\.nt\.ca|\.on\.ca|\.pe\.ca|\.qc\.ca|\.sk\.ca|\.yk\.ca|\.ca|\.cc|\.ac\.cn|\.com\.cn|\.edu\.cn|\.gov\.cn|\.org\.cn|\.bj\.cn|\.sh\.cn|\.tj\.cn|\.cq\.cn|\.he\.cn|\.nm\.cn|\.ln\.cn|\.jl\.cn|\.hl\.cn|\.js\.cn|\.zj\.cn|\.ah\.cn|\.gd\.cn|\.gx\.cn|\.hi\.cn|\.sc\.cn|\.gz\.cn|\.yn\.cn|\.xz\.cn|\.sn\.cn|\.gs\.cn|\.qh\.cn|\.nx\.cn|\.xj\.cn|\.tw\.cn|\.hk\.cn|\.mo\.cn|\.cn|\.cx|\.cz|\.de|\.dk|\.fo|\.com\.ec|\.tm\.fr|\.com\.fr|\.asso\.fr|\.presse\.fr|\.fr|\.gf|\.gs|\.co\.il|\.net\.il|\.ac\.il|\.k12\.il|\.gov\.il|\.muni\.il|\.ac\.in|\.co\.in|\.org\.in|\.ernet\.in|\.gov\.in|\.net\.in|\.res\.in|\.is|\.it|\.ac\.jp|\.co\.jp|\.go\.jp|\.or\.jp|\.ne\.jp|\.ac\.kr|\.co\.kr|\.go\.kr|\.ne\.kr|\.nm\.kr|\.or\.kr|\.li|\.lt|\.lu|\.asso\.mc|\.tm\.mc|\.com\.mm|\.org\.mm|\.net\.mm|\.edu\.mm|\.gov\.mm|\.ms|\.nl|\.no|\.nu|\.pl|\.ro|\.org\.ro|\.store\.ro|\.tm\.ro|\.firm\.ro|\.www\.ro|\.arts\.ro|\.rec\.ro|\.info\.ro|\.nom\.ro|\.nt\.ro|\.se|\.si|\.com\.sg|\.org\.sg|\.net\.sg|\.gov\.sg|\.sk|\.st|\.tf|\.ac\.th|\.co\.th|\.go\.th|\.mi\.th|\.net\.th|\.or\.th|\.tm|\.to|\.com\.tr|\.edu\.tr|\.gov\.tr|\.k12\.tr|\.net\.tr|\.org\.tr|\.com\.tw|\.org\.tw|\.net\.tw|\.ac\.uk|\.uk\.com|\.uk\.net|\.gb\.com|\.gb\.net|\.vg|\.sh|\.kz|\.ch|\.info|\.ua|\.gov|\.name|\.pro|\.ie|\.hk|\.com\.hk|\.org\.hk|\.net\.hk|\.edu\.hk|\.us|\.tk|\.cd|\.by|\.ad|\.lv|\.eu\.lv|\.bz|\.es|\.jp|\.cl|\.ag|\.mobi|\.eu|\.co\.nz|\.org\.nz|\.net\.nz|\.maori\.nz|\.iwi\.nz|\.io|\.la|\.md|\.sc|\.sg|\.vc|\.tw|\.travel|\.my|\.se|\.tv|\.pt|\.com\.pt|\.edu\.pt|\.asia|\.fi|\.com\.ve|\.net\.ve|\.fi|\.org\.ve|\.web\.ve|\.info\.ve|\.co\.ve|\.tel|\.im|\.gr|\.ru|\.net\.ru|\.org\.ru|\.hr|\.com\.hr)$/, '$1');
  },

  sanitizeSubdomain: function(subdomain) {
    subdomain = removeTLD(subdomain);

    return subdomain? subdomain.replace(/[^A-Z0-9]+/ig, '').toLowerCase() : null;
  },

  isFinancialProfessionals: function(subscriptionType) {
    return subscriptionType === 'monthly-subscription' || subscriptionType === 'annual-subscription';
  },

  formatUrl: function(url) {
    var domain = _.isString(url)? url.replace(/^(https?:\/\/)?(www\.)?/,'') : null;

    return _.isNull(domain)? null : 'http://'+ domain.toLowerCase();
  },

  sort: {
    premiumSavings: function(data) {
      // If user selected first choice "maintain current asset allocation"
      //   Set targetStocks to the same value the user set for stocks
      if (data.investmentStrategy === '1') {
        data.targetStocks = data.stocks;
      }
      // Else user selected second choice "apply declining glidepath strategy"
      //   Just use the value of targetStocks

      var ordered = {
        years: data.years,
        salary: data.salary,
        contributionOption: data.contributionOption,
        percentageContribution: data.percentageContribution,
        dollarContribution: data.dollarContribution,
        increase: data.increase,
        investment: data.investment,
        current: data.current,
        stocks: data.stocks,
        targetStocks: data.targetStocks,
        bonds: data.bonds,
        smEquities: data.smEquities,
        iEquities: data.iEquities,
        bondSelect: data.bondSelect,
        cdRate: data.cdRate,
        cashSelect: data.cashSelect,
        moneyRate: data.moneyRate
      };

      return getValues(removeCommas(ordered));
    },

    premiumSpending: function(data) {
      var firstInc  = _.isEqual(data.firstWithdrawalStartDelta, 'true');
      var secondInc = _.isEqual(data.secondWithdrawalStartDelta, 'true');
      var firstVal  = data.firstWithdrawalAmount.replace(/[, ]+/g, "").trim();
      var secondVal = data.secondWithdrawalAmount.replace(/[, ]+/g, "").trim();

      var ordered = {
        current: data.current,
        years: data.years,
        expenses: data.expenses,
        living: data.living,
        withdrawalOption: data.withdrawalOption,
        firstWithdrawalAmount: firstInc? firstVal : (Number(firstVal) * -1).toFixed(0),
        firstWithdrawalStart: data.firstWithdrawalStart,
        firstWithdrawalEnd: data.firstWithdrawalEnd,
        secondWithdrawalAmount: secondInc? secondVal : (Number(secondVal) * -1).toFixed(0),
        secondWithdrawalStart: data.secondWithdrawalStart,
        investment: data.investment,
        stocks: data.stocks,
        bonds: data.bonds,
        smEquities: data.smEquities,
        iEquities: data.iEquities,
        bondSelect: data.bondSelect,
        cdRate: data.cdRate,
        cashSelect: data.cashSelect,
        moneyRate: data.moneyRate,
        withdrawalStrategy: data.withdrawalStrategy
      };

      return getValues(removeCommas(ordered));
    },

    freeSavings: function(data) {
      var ordered = {
        years: data.years,
        salary: data.salary,
        percentageContribution: data.percentageContribution,
        increase: data.increase,
        investment: data.investment,
        current: data.current,
        stocks: data.stocks,
        bonds: data.bonds,
        cash: data.cash,
        bondSelect: data.bondSelect,
        cdRate: data.cdRate,
        cashSelect: data.cashSelect,
        moneyRate: data.moneyRate
      };

      return getValues(removeCommas(ordered));
    },

    freeSpending: function(data) {
      var ordered = {
        current: data.current,
        years: data.years,
        expenses: data.expenses,
        living: data.living,
        investment: data.investment,
        stocks: data.stocks,
        bonds: data.bonds,
        cash: data.cash,
        bondSelect: data.bondSelect,
        cdRate: data.cdRate,
        cashSelect: data.cashSelect,
        moneyRate: data.moneyRate
      };

      return getValues(removeCommas(ordered));
    }
  },
  text: {
    premiumSavings: {
      calculator: 'Retirement Savings Calculator',
      type: 'premium',
      premium: true,
      premiumCopy: 'Premium ',
      postRoute: '/savings/premium',
      printRoute: '/savings/premium/print',
      cdRate: 2,
      moneyRate: 0,
      pageVersion: ' page-calculators-premium',
      defaultValues: calculatorDefaultValues.saving,
      leadGenTool: false
    },
    premiumSpending: {
      calculator: 'Retirement Spending Calculator',
      type: 'premium',
      premium: true,
      premiumCopy: 'Premium ',
      postRoute: '/spending/premium',
      printRoute: '/spending/premium/print',
      cdRate: 2,
      moneyRate: 0,
      pageVersion: '  page-calculators-premium',
      defaultValues: calculatorDefaultValues.spending,
      leadGenTool: false
    },
    freeSavings: {
      calculator: 'Retirement Savings Calculator',
      type: 'free',
      premium: false,
      postRoute: '/savings',
      printRoute: '/savings/print',
      cdRate: 1,
      moneyRate: 0,
      pageVersion: ' page-calculators-free',
      freeVersion: ' free-version',
      freeDisabled: ' free-disabled',
      disabled: ' disabled',
      calculatorSelected: 'premium-savings-calculator',
      defaultValues: calculatorDefaultValues.saving,
      leadGenTool: false
    },
    freeSpending: {
      calculator: 'Retirement Spending Calculator',
      type: 'free',
      premium: false,
      postRoute: '/spending',
      printRoute: '/spending/print',
      cdRate: 1,
      moneyRate: 0,
      pageVersion: '  page-calculators-free',
      freeVersion: ' free-version',
      freeDisabled: ' free-disabled',
      disabled: ' disabled',
      calculatorSelected: 'premium-spending-calculator',
      defaultValues: calculatorDefaultValues.spending,
      leadGenTool: false
    }
  },

  getExpiredYears: function(num) {
    var year  = new Date().getFullYear();
    var years = [{ year: year }];

    for (var i = 0; i < (num - 1); i++) {
      years.push({year: ++year});
    }

    return years;
  },

  // handle selected years on card.
  setSelectedExpiredYear: function(years, selectedYear) {
    var years = years;
    if (selectedYear) {
      _.each(years, function(value) {
        if (value.year == selectedYear) {
          value.selected = true;
        }
      });
    }
    return years;
  },

  formatName: function(name) {
    return name.toLowerCase().replace(/\b./g, function(m){ return m.toUpperCase(); });
  },

  formatDate: function(date, format) {
    return moment(new Date(Math.round(Number(date) * 1000))).format(format);
  },

  format$: function(amount) {
    return (Number(amount) / 100).toFixed(2);
  },

  removeCommas: function(object) {
    return _.mapValues(object, function(key) {
      return key.replace(/[, ]+/g, "").trim();
    });
  },

  // user for debug only
  varLog: function(name, value) {
    if (env.NODE_ENV == "development") {
      console.log(name, JSON.stringify(value));
    }
  },

  availableCalculators: ['premium-savings-calculator', 'premium-spending-calculator'],
  availableInfomationReports: [
    'advisorName',
    'companyName',
    'website',
    'advisorEmail',
    'companyEmail',
    'phoneNumber',
    'companyAddress'
  ],


};

global = _.assign(global, helpers);
