var fs        = require('fs');
var path      = require('path');
var _         = require('lodash');
var Sequelize = require('sequelize');

// sample skeleton model to extend from
var skeletonModel = {
  name: false,
  schema: {},
  methods: {}
};


module.exports = function() {
  return {

    init: function(config) {
      var creds     = config.database;
      var sequelize = new Sequelize(creds.database_name, creds.username, creds.password, {
        host: creds.host,
        dialect: 'postgres',
        port: creds.port,
        native: typeof(creds.native) !== 'unknown' ? creds.native : true,
        logging: false
      });

      var db = this.extend(sequelize);

      this.credentials(db.sequelize);
      this.sync(db.sequelize);

      return db;
    },

    // extend db object with sequelize methods
    extend: function(sequelize) {
      var db = {};

      var injected = this.inject(sequelize, db);
      sequelize = injected.sequelize;
      db = injected.db;

      return _.extend({
        sequelize: sequelize,
        Sequelize: Sequelize
      }, db);
    },

    // inject models in to the db object
    inject: function(sequelize, db) {
      var models = this;

      fs
        .readdirSync(__dirname)
        .filter(function(file) {
          return (file.indexOf('.') !== 0) && (file !== 'init.js');
        })
        .forEach(function(file) {
          var model = sequelize.import(path.join(__dirname, file));
          // add model to db object
          db[model.name] = models.defineModel(sequelize, model);

        });

      Object.keys(db).forEach(function(modelName) {
        if ('associate' in db[modelName]) {
          db[modelName].associate(db);
        }
      });

      return {
        db: db,
        sequelize: sequelize
      };
    },

    // test authentication credentials
    credentials: function(sequelize) {
      sequelize
        .authenticate()
        .complete(function(err) {
          if ( !! err) {
            d('Unable to connect to the database:', err);
          } else {
            d('Sequelize Connected');
          }
        });
    },

    // sync models
    sync: function(sequelize) {
      var env        = process.env;
      var safeToSeed = _.isEqual(env.SEED_DATA, 'seed') &&
                       (_.isEqual(env.NODE_ENV, 'development') || _.isEqual(env.NODE_ENV, 'stagging'));

      return safeToSeed? seedData(true, '../lib/seed') : false;

      function seedData(bool, path) {
        sequelize
        .sync({ force: bool })//creates tables
        .complete(function(err) {
          if (err) {
            throw err[0];
          } else {
            console.log('Tables successfully synced.');
            // inject data if seed data is true
            if (process.env.SEED_DATA) {
              d('start seeding data!');
              require(path);
            }
          }
        });
      }
    },


    defineModel: function(sequelize, model) {
      model = _.extend(skeletonModel, model);
      return sequelize.define(model.name, model.schema, model.methods);
    }
  };
};
