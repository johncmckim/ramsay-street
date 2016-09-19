'use strict';

const AWS = require('aws-sdk');

let dynamodb = null;

const dynamodbFactory = () => {
  if(!dynamodb) {
    dynamodb = new AWS.DynamoDB();
  }

  return dynamodb;
};

const docClientFactory = (dbclient) => {
  return new AWS.DynamoDB.DocumentClient({ service: dbclient });
}

module.exports = {
  dynamodb: dynamodbFactory,
  docClient: docClientFactory
};
