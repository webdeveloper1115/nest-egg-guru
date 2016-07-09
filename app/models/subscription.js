module.exports = function subscriptionModel(sequelize, types) {

  return {
    name: 'subscriptions',
    schema: {
      'calculatorType': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notEmpty: true,
          is: ["^[a-z]+$",'i'],
          isIn: [['savingsCalculator','spendingCalculator','bothCalculators','financialProfessionalMonthly','financialProfessionalYearly']]
        }
      }
    },
    methods: {
      classMethods: {
        associate: function(db) {
          db.subscriptions.belongsTo(db.users);
          db.subscriptions.belongsTo(db.subscription_types);

          db.subscriptions.hasMany(db.transactions);
        },

        saveSubscription: function(subTypeName, userId) {
          return db.subscription_types
            .find({ where: { name: subTypeName } })
            .then(function(_subscription_type) {
              return db.subscriptions
                .create({
                  calculatorType: subTypeName,
                  subscription_typeId: _subscription_type.id,
                  userId: userId
                });
            });
        },

        createNew: function(sub) {
          return new Promise(function(resolve, reject) {

            db
            .subscriptions
            .create({
              userId: sub.userId,
              calculatorType: _.camelCase(sub.calculatorType),
              subscription_typeId: sub.subscription_typeId
             })
            .success(resolve)
            .fail(reject);

          });
        },

        findByUserId: function(userId) {
          return new Promise( function(resolve, reject) {

            db
            .subscriptions
            .find({ where: { userId: userId } })
            .success(resolve)
            .fail(reject);

          });
        },

        findLastByUserId: function(userId) {
          return new Promise( function(resolve, reject) {

            db
            .subscriptions
            .findAll({ where: { userId: userId }, order: [['id','DESC']], limit: 1 })
            .success(function(_subscription) {
              resolve(_subscription[0]);
            })
            .fail(reject);

          });
        },

        // check user subscription
        checkSubscription: function(userId) {
          return new Promise(function(resolve, reject) {
            db
            .subscriptions
            .find({ where: { userId: userId } })
            .then(function(subscription) {
              if (subscription) {
                resolve({status: "subscribed"});
              }
              else {
                resolve({status: "trialing"});
              }
            })
            .catch(reject);
          });
        }

      }
    }
  };

};
