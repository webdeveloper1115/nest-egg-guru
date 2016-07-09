module.exports = function companyModel(sequelize, types) {

  var localHelpers = {
    setInfomationReports: function(company) {
      var values = [];
      _.each(global.availableInfomationReports, function(value) {
        if (company[value]) {
          values.push(company[value]);
        }
      });

      return JSON.stringify(values);
    },
  };

  return {
    name: 'companies',
    schema: {
      'name': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notNull: true,
          notEmpty: true
        }
      },
      'subdomain': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notNull: true,
          isLowercase: true,
          notEmpty: true
        },
        unique: true
      },
      'logo': {
        type: types.STRING,
        defaultValue: null
      },
      'copy': {
        type: types.TEXT,
        defaultValue: null,
        allowNull: true,
        validate: {
          notNull: false
        }
      },
      'phone': {
        type: types.STRING,
        defaultValue: null
      },
      'email': {
        type: types.STRING,
        defaultValue: null
      },
      'address_1': {
        type: types.STRING,
        defaultValue: null
      },
      'address_2': {
        type: types.STRING,
        defaultValue: null
      },
      'address_city': {
        type: types.STRING,
        defaultValue: null
      },
      'address_state': {
        type: types.STRING,
        defaultValue: null
      },
      'address_zip': {
        type: types.STRING,
        defaultValue: null
      },
      'url': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          // notEmpty: true,
          // notNull: true,
          // isLowercase: true,
          // isUrl: true
        }
      },
      'active': {
        type: types.BOOLEAN,
        defaultValue: false
      },
      'subscription_period_end': {
        type: types.BIGINT,
        allowNull: true,
        validate: {
          notNull: true,
          notEmpty: true
        }
      },
      'subscription_subscribed': {
        type: types.BOOLEAN,
        defaultValue: false
      },
      'lead_gen_tool': {
        type: types.BOOLEAN,
        defaultValue: false
      },
      'infomation_reports': {
        type: types.STRING,
        defaultValue: null
      },
      'disclosure_info': {
        type: types.STRING,
        defaultValue: null
      }
    },
    methods: {
      classMethods: {
        associate: function(db) {
          db.companies.belongsTo(db.users);
        },

        saveCompany: function(company) {
          return new Promise(function(resolve, reject) {
            db
            .companies
            .create({
              name: company.name,
              subdomain: _.cleanStr(company.subdomain),
              logo: company.logo,
              copy: company.copy,
              phone: _.cleanStr(company.phone),
              email: company.emailCompany ? company.emailCompany.toLowerCase() : null,
              address_1: _.capitalize(company.address_1),
              address_2: _.capitalize(company.address_2),
              address_city: _.capitalize(company.address_city),
              address_state: company.address_state,
              address_zip: company.address_zip ? Number(company.address_zip) : null,
              url: _.formatUrl(company.url),
              subscription_period_end: company.subscription_period_end ? Number(company.subscription_period_end) : null,
              subscription_subscribed: company.subscription_subscribed,
              active: company.active,
              userId: company.userId,
              lead_gen_tool: company.lead_gen_tool ? true : false,
              infomation_reports: localHelpers.setInfomationReports(company),
              disclosure_info: company.disclosure_info
            })
            .success(resolve)
            .fail(reject);

          });
        },

        updateInfo: function(inputParam) {
          var input = inputParam.input;
          return new Promise(function(resolve, reject) {
            var company = inputParam.company;
            company
            .updateAttributes({
              name: input.name,
              url: _.formatUrl(input.url),
              email: input.emailCompany ? input.emailCompany.toLowerCase() : null,
              logo: input.logo,
              phone: _.cleanStr(input.phone),
              address_1: _.capitalize(input.address_1),
              address_2: _.capitalize(input.address_2),
              address_city: _.capitalize(input.address_city),
              address_state: input.address_state,
              address_zip: input.address_zip ? Number(input.address_zip) : null,
              copy: input.copy,
              lead_gen_tool: input.lead_gen_tool ? true : false,
              infomation_reports: localHelpers.setInfomationReports(input),
              disclosure_info: input.disclosure_info
            })
            .success(resolve)
            .fail(reject);

          });
        },

        updateSubscriptionSubscribed: function(inputParam) {
          var input = inputParam.input;
          return new Promise(function(resolve, reject) {
            var company = inputParam.company;
            company
            .updateAttributes({
              subscription_subscribed: true,
              subscription_period_end: input.subscription_period_end ? Number(input.subscription_period_end) : null,
            })
            .success(resolve)
            .fail(reject);
          });
        },

        update: function(company) {
          var defer = Q.defer();

          company
          .save()
          .success(function(saved) {
            defer.resolve(saved);
          })
          .fail(defer.reject);

          return defer.promise;
        },

        findByUserId: function(userId) {
          var defer = Q.defer();

          db
          .companies
          .find({ where: { userId: userId } })
          .success(function(_company) {
            defer.resolve(_company);
          })
          .fail(function(err) {
            defer.reject(err);
          });

          return defer.promise;
        },

        checkSubdomain: function(subdomain) {
          return new Promise(function(resolve, reject) {

            db
            .companies
            .findBySubdomain(subdomain)
            .then(function(company) {
              _.isNull(company)? resolve(company) : reject('That subdomain already exists.');
            })
            .catch(reject);

          });
        },


        findBySubdomain: function(subdomain) {
          return new Promise(function(resolve, reject) {

            db
            .companies
            .find({ where: { subdomain: subdomain }, include: [{ model: db.users }] })
            .success(resolve)
            .fail(reject);

          });
        },

        findByExpiredDomain: function(){
          var startDay = moment().startOf('day').toDate().getTime()
          var endDay = moment().endOf('day').toDate().getTime()

          return new Promise(function(resolve, reject) {
            db
            .companies
            .findAll({ where: {
              subscription_period_end: {
                lt: endDay,
                gt: startDay
              }
            }, include: [{ model: db.users }] })
            .success(resolve)
            .fail(reject);
          });
        }

      }
    }
  };

};
