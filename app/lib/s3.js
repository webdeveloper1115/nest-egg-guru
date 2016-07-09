'use-strict';

module.exports = (function () {
  var AWS = require('aws-sdk');
  var s3  = new AWS.S3({ params: { Bucket: env.AWS_BUCKET }});

  var upload = function(params) {
    return new Promise(function(resolve, reject) {

      if (_.isUndefined(params)) {
        resolve(null);
      } else {
        var file = {
          Key: params.subdomain +'-logo.'+ params.extension,
          ContentType: params.mimetype,
          Body: new Buffer(params.buffer)
        };

        s3.upload(file, function(err, data) {
          err? reject(err) : resolve(data.Location);
        });
      }

    });
  };

  return {
    upload: upload
  };

}());
