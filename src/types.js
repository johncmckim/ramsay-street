'use strict';

const graphql = require('graphql');

module.exports.getType = function(typeName) {
  if(!typeName) {
    throw new Error('Typename not supplied');
  }

  switch (typeName.toLowerCase()) {
    case 'int':
    case 'integer':
      return graphql.GraphQLInt;
    case 'float':
      return graphql.GraphQLFloat;
    case 'string':
      return graphql.GraphQLString;
    case 'boolean':
    case 'bool':
      return graphql.GraphQLBoolean;
    default:
      throw new Error('Typename not supplied');
  }
}
