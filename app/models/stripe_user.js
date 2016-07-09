module.exports = function stripeUserModel(sequelize, types) {

  return {
    name: 'stripe_users',
    schema: {
      'email': {
        type: types.STRING(100),
        validate: {
          isEmail: true,
          isLowercase: true
        },
        unique: true
      },
      'token': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notEmpty: true
        },
        unique: true

      },
      'customerId': {
        type: types.STRING,
        defaultValue: null,
        validate: {
          notEmpty: true
        },
        unique: true
      },
      'planId': {
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
          db.stripe_users.belongsTo(db.users);
        },

        saveUser: function(user) {
          return new Promise(function(resolve, reject) {

            db
            .stripe_users
            .create({
              userId: user.userId,
              email: user.email.toLowerCase(),
              token: user.token,
              planId: user.planId,
              customerId: user.customerId
            })
            .success(resolve)
            .fail(reject);

          });
        },

        findByUserId: function(userId) {
          return new Promise(function(resolve, reject) {

            db
            .stripe_users
            .find({ where: { userId: userId } })
            .success(function(_stripe_user) {
              resolve(_stripe_user);
            })
            .fail(reject);

          });
        }

      }
    }
  };
};
