module.exports = function transactionModel(sequelize, types) {

  return {
    name: 'transactions',
    schema: {
      'amount': {
        type: types.DECIMAL(10, 2),
        validate: {
          isDecimal: true
        }
      },
      'serviceEndDate': {
        type: types.DATE,
        allowNull: true,
        defaultValue: null
      },
      'serviceEndTime': {
        type: types.BIGINT,
        allowNull: true,
        defaultValue: null
      },
      'token': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notEmpty: true
        }
      }
    },
    methods: {
      classMethods: {
        associate: function(db) {
          db.transactions.belongsTo(db.subscriptions);
        },

        saveNew: function(trans) {
          return new Promise(function(resolve, reject) {

            db
            .transactions
            .create({
              amount: trans.amount,
              serviceEndDate: _.psqlDate(trans.serviceEndTime),
              serviceEndTime: trans.serviceEndTime,
              token: trans.token,
              subscriptionId: trans.subscriptionId
            })
            .success(resolve)
            .fail(reject);

          });
        }

      }

    }
  };
};
