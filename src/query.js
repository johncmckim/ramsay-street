'use strict';

const getProjection = (fieldAst) => {
  return fieldAst.selectionSet.selections.map((s) => {
    return s.name.value
  });
};

const get = function(docClient, table, args, ast) {
  const fields = getProjection(ast.fieldASTs[0]);
  const params = {
    TableName: table.tableName,
    Key: {
      year: args.year,
      title: args.title
    },
    AttributesToGet: fields
  };

  return docClient.getAsync(params)
          .then(result => result.Item)
          .catch(err => {
            throw { message: err.message };
          });
}

const query = function(docClient, table, args, ast) {
  const fields = getProjection(ast.fieldASTs[0]);

  console.log('Fields ', fields);

  const params = {
      TableName : table.tableName,
      KeyConditionExpression: '#hash = :yyyy',
      ExpressionAttributeNames:{
          '#hash': 'year'
      },
      ExpressionAttributeValues: {
          ':yyyy': args.year
      },
      AttributesToGet: fields,
  };

  return docClient
          .queryAsync(params)
          .then((result) => {
            console.log('Result', result)
            return result.Items;
          })
          .catch(err => {
            throw { message: err.message };
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
    if(ast.operation.operation !== 'query') {
      throw new Error('Only query is supported');
    }

    return query(docClient, table, args, ast);
  };
};
