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

  return docClient.getAsync(params);
}

const query = function(docClient, tableName, args) {
  const params = {
      TableName : tableName,
      //KeyConditionExpression: "#yr = :yyyy",
      //ExpressionAttributeNames:{
      //    "#yr": "year"
      //},
      //ExpressionAttributeValues: {
      //    ":yyyy":1985
      //}
  };

  return docClient.queryAsync(params);
}


module.exports.resolveGet = function(table, docClient) {
  return function(source, args, root, ast) {
    console.log('Getting data from table: ' + table.tableName);
    console.log('Args: ', args);
    console.log('Ast: ', _.omit(ast, ['schema', 'parentType', 'returnType']));

    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return get(docClient, table, args, ast)
        .then((data) => data.Item)
        .then((item) => console.log(item));
  };
};

module.exports.resolveQuery = function(table, docClient) {
  return function(source, args, root, ast) {
    console.log('Getting data from table: ' + table.tableName);
    console.log('Args: ', args);
    console.log('Ast: ', ast);
    console.log('Field ast: ', ast.fieldASTs)

    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return query(docClient, table, args)
        .then((data) => console.log(data));
  };
};
