'use strict';

const _ = require('lodash');
const BbPromise = require('bluebird');

const getReturnFields = (fieldAst) => {
  return fieldAst.selectionSet.selections.map((s) => {
    return s.name.value
  });
};

const get = function(docClient, table, args, ast) {
  const fields = getReturnFields(ast.fieldASTs[0]);
  const params = {
    TableName: table.tableName,
    Key: {
      year: args.year,
      title: args.title
    },
    AttributesToGet: fields
  };

  console.log('Querying with params: ', params)
  return docClient.getAsync(params);
}

const query = function(docClient, table, args, ast) {
  const params = {
      TableName : table.tableName,
      KeyConditionExpression: '#hash = :yyyy',
      ExpressionAttributeNames:{
          '#hash': 'year'
      },
      ExpressionAttributeValues: {
          ':yyyy': args.year
      }
  };
  console.log('Querying with params: ', params)
  return docClient.queryAsync(params)
          .then((data) => {
            console.log('Got data', data);
            return data.Items
          });
}


module.exports.resolveGet = function(table, docClient) {
  return function(source, args, root, ast) {
    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return get(docClient, table, args, ast);
  };
};

module.exports.resolveQuery = function(table, docClient) {
  return function(source, args, root, ast) {
    console.log('Getting data from table: ' + table.tableName);

    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return query(docClient, table, args, ast).then(() => console.log('returning resolve query'));
  };
};
