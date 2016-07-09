/*jslint white: true, node:true, browser: true, devel: true, windows: true, forin: true, vars: true, nomen: true, plusplus: true, bitwise: true, regexp: true, sloppy: true, indent: 4, maxerr: 50, camelcase:false */
'use strict';

module.exports = {
  version: env.VERSION,
  admin: env.ADMIN_USER,
  root: process.cwd(),
  port: process.env.PORT || 3000,
  sessionCollection: 'sessions',
  session: {
    module: 'connect-redis',
    host: '127.0.0.1',
    port: 6379,
    config: {
      'ttl': 3600
    }
  },
  madmimi: {
    endpoint: 'api.madmimi.com',
    user: 'Guru@NestEggGuru.com',
    api_key: env.MADMIMI_API_KEY,
    newsletter: 'test',
    ssl: true
  },
  mailgun: {
    user: 'nesteggguru@sudokrew.com',
    password: env.MAILGUN_PSWD,
    host: 'smtp.mailgun.org',
    port: '465',
    ssl: true
  }
};