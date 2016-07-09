module.exports = function userModel(sequelize, types) {

  return {
    name: 'users',
    schema: {
      'firstName': {
        type: types.STRING(100),
        validate: {
          notNull: true,
          notEmpty: true
        }
      },
      'lastName': {
        type: types.STRING(100),
        validate: {
          notNull: true,
          notEmpty: true
        }
      },
      'email': {
        type: types.STRING(100),
        validate: {
          isEmail: true,
          isLowercase: true
        },
        unique: true
      },
      'userType': {
        type: types.STRING(100),
        defaultValue: 'Other'
      },
      'proDesignation': {
        type: types.STRING,
        defaultValue: false
      }
    },
    methods: {
      classMethods: {
        associate: function(db) {
          db.users.hasOne(db.companies);
          db.users.hasMany(db.subscriptions);
          db.users.hasOne(db.stripe_users);
        },

        findByEmail: function(email) {
          return new Promise(function(resolve, reject) {

            db
            .users
            .find({ where: { email: email.toLowerCase() } })
            .success(resolve)
            .fail(reject);

          });
        },

        findById: function(id) {
          return new Promise( function(resolve, reject) {

            db
            .users
            .find({
              where: { id: id },
              include: [
                db.companies,
                db.stripe_users,
                { model: db.subscriptions, include: db.transactions }
              ]
            })
            .success(resolve)
            .fail(reject);

          });
        },

        updateInfo: function(data) {
          return new Promise(function(resolve, reject) {
            var user = data.user;
            user
            .updateAttributes({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email.toLowerCase(),
              proDesignation: data.proDesignation
            })
            .success(resolve)
            .fail(reject);

          });
        },

        saveUser: function(input) {
          return new Promise(function(resolve, reject) {

            db
            .users
            .create({
              firstName: input.firstName,
              lastName: input.lastName,
              email: input.email.toLowerCase(),
              proDesignation: input.proDesignation
            })
            .success(resolve)
            .fail(reject);
          });
        }

      }
    }
  };

};
