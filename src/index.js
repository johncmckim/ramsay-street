'use strict';

const _ = require('lodash');
const graphql = require('graphql');

const clientFactory = require('./client');
const schemaBuilder = require('./schema');

const defaultOptions = {
  dynamodbFactory: clientFactory.dynamodb,
  docClientFactory: clientFactory.docClient
};

module.exports = function(tables, opts) {
  if(!tables) {
    throw new Error('No tables were supplied');
  }

  const options = _.extend(opts, defaultOptions);

  const schema = schemaBuilder.createSchema(tables, options);

  const query = function(q) {
    return graphql.graphql(schema, q);
  }

  return {
    query: query
  };
}
