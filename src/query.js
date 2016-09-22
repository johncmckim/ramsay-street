'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');
const words = require('./words');

const getProjection = (fieldAst) => {
  const fields = fieldAst.selectionSet.selections.map((s) => {
    return s.name.value
  });

  return fields;
}

const getExpressionAttributeName = (field) => '#_' + field;
const getAttributeName = (field) => words.isReservedWord(field) ? getExpressionAttributeName(field) : field;
const getExpressionAttributeValue = (name) => ':_' + name;

const getKey = (table, args) => {
  const hashKeyName = table.hashKey.name;

  const key = {};
  key[hashKeyName] = args[hashKeyName];

  if(table.rangeKey) {
    const rangeKeyName = table.rangeKey.name;
    key[rangeKeyName] = args[rangeKeyName];
  }

  return key;
};

const getKeyCondition = (table) => {
  const name = table.hashKey.name;
  const expressionName = getAttributeName(name);
  const expressionValue = getExpressionAttributeValue(name);
  return expressionName + ' = ' + expressionValue;
};

const getExpressionAttributeNames = (fields) => {
  const atttributeNames = _.reduce(fields, (result, field) => {
    if(words.isReservedWord(field)) {
      const name = getExpressionAttributeName(field);
      result[name] = field;
    }

    return result;
  }, {});

  console.log('attribute names', atttributeNames);
  return atttributeNames;
};

const getExpressionAttributeValues = (args) => {
  const atttributeValues = _.reduce(args, (result, value, name) => {
    const key = getExpressionAttributeValue(name);
    result[key] = value;
    return result;
  }, {});

  console.log('attribute values', atttributeValues);
  return atttributeValues;
};

const getProjectionExpression = (fields) => {
  const expressionFields = _.map(fields, getAttributeName);
  const expression = _.join(expressionFields, ',');

  console.log('projection expression', expression);
  return expression;
};

const get = function(docClient, table, args, ast) {
  const fields = getProjection(ast.fieldASTs[0]);

  const key = getKey(table, args);
  const atttributeNames = getExpressionAttributeNames(fields);
  const expression = getProjectionExpression(fields);

  const params = {
    TableName: table.tableName,
    Key: key,
    ExpressionAttributeNames: atttributeNames,
    ProjectionExpression: expression
  };

  return docClient
          .getAsync(params)
          .then(result => result.Item);
}

const query = function(docClient, table, args, ast) {
  const fields = getProjection(ast.fieldASTs[0]);

  const keyCondition = getKeyCondition(table);
  const atttributeNames = getExpressionAttributeNames(fields);
  const attributeValues = getExpressionAttributeValues(args);
  const expression = getProjectionExpression(fields);

  const params = {
      TableName : table.tableName,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeNames: atttributeNames,
      ExpressionAttributeValues: attributeValues,
      ProjectionExpression: expression,
  };

  return docClient
          .queryAsync(params)
          .then((result) => {
            return result.Items;
          });
}

const throwErr = (err) => {
  return BbPromise.reject(err.toString());
};

module.exports.resolveGet = function(table, docClient) {
  return function(source, args, root, ast) {
    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return get(docClient, table, args, ast).catch(throwErr);
  };
};

module.exports.resolveQuery = function(table, docClient) {
  return function(source, args, root, ast) {
    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return query(docClient, table, args, ast).catch(throwErr);
  };
};
