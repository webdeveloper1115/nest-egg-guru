module.exports = function CompanyUserModel(sequelize, types) {

  return {
    name: 'company_users',
    schema: {
      'companyEmail': {
        type: types.STRING,
        defaultValue: null
      },
      'userEmail': {
        type: types.STRING,
        validate: {
          notEmpty: true
        },
        unique: false
      }
    },
    methods: {
      classMethods: {
        associate: function(db) {
          db.company_users.belongsTo(db.users);
          db.company_users.belongsTo(db.companies);
        },

        saveFirstUser: function(company, userEmail) {
          return new Promise(function(resolve, reject) {

            db
              .company_users
              .create({
                companyId: company.id,
                companyEmail: company.user.email || company.email,
                userId: company.userId,
                userEmail: userEmail
              })
              .success(resolve)
              .fail(reject);

          });
        },

        findByCompanyId: function(companyId, userEmail) {
          return new Promise(function(resolve, reject) {

            db
              .company_users
              .find({ where: { companyId: companyId, userEmail: userEmail } })
              .success(function(_company_users) {
                resolve(_company_users);
              })
              .fail(reject);

          });
        }

      }
    }
  };
};
