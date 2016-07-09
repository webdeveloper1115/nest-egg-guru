module.exports = function subscriptionTypeModel(sequelize, types) {

  return {
    name: 'subscription_types',
    schema: {
      'name': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notEmpty: true,
          is: ["^[a-z]+$",'i'],
          isIn: [['savingsCalculator','spendingCalculator','bothCalculators','financialProfessionalMonthly','financialProfessionalYearly']]
        }
      },
      'amount': {
        type: types.DECIMAL(10, 2),
        validate: {
          isDecimal: true
        }
      },
      'recurring': {
        type: types.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      'expTime': {
        type: types.BIGINT,
        validate: {
          notNull: true,
          notEmpty: true,
          isInt: true
        }
      },
      'description': {
        type: types.TEXT,
        defaultValue: null,
        validate: {
          notEmpty: true
        }
      }
    },
    methods: {
      classMethods: {
        associate: function(db) {
          db.subscription_types.hasOne(db.subscriptions);
        },

        getByName: function(name) {
          return new Promise(function(resolve, reject) {

            db
            .subscription_types
            .find({ where: { name: _.camelCase(name) } })
            .success(resolve)
            .fail(reject);

          });
        }

      }

    }
  };

};
