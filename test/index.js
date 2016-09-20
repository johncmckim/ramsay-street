'use strict';

const AWS = require('aws-sdk');

const region = process.env.DYNAMODB_REGION || 'us-east-1';
const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';

AWS.config.update({
  region: region,
  endpoint: endpoint,
});

require('./integration');
require('./unit');
