'use strict';

const _ = require('lodash');
const graphql = require('graphql');
const BbPromise = require('bluebird');

const typeMapper = require('./types');
const query = require('./query');

const addKeyToFields = function(key, fields) {
  fields[key.name] = {
    type: typeMapper.getType(key.type)
  };
}

const addKeyToArgs = function(key, args) {
  args[key.name] = {
    type: typeMapper.getType(key.type)
  };
}

const createTableArgs = function(table) {
  const args = {};

  if(!table.hashKey) {
    throw new Error(`Hash Key for ${table.name} is not supplied`);
  }

  addKeyToArgs(table.hashKey, args);

  if(table.rangeKey) {
    addKeyToArgs(table.rangeKey, args);
  }

  return args;
}

const createTableType = function(table, tableArgs, docClient) {
  const fields = {};

  addKeyToFields(table.hashKey, fields);

  if(table.rangeKey) {
    addKeyToFields(table.rangeKey, fields);
  }

  // console.log(`Creating table ${table.name}`);

  const tableType = new graphql.GraphQLObjectType({
    name: table.typeName,
    fields: fields,
  });

  return tableType;
}

const createTableField = function(table, tableArgs, tableType, docClient) {
  return {
    name: table.typeName,
    description: table.description,
    type: tableType,
    args: tableArgs,
    resolve: query.resolveGet(table, docClient)
  };
}

const createTableListField = function(table, tableArgs, tableType, docClient) {
  return {
    name: table.typeListName,
    description: table.description,
    type: new graphql.GraphQLList(tableType),
    args: tableArgs,
    resolve: query.resolveQuery(table, docClient)
  };
}

module.exports.createSchema = function(tables, opts) {
  const options = _.extend(opts, {
    name: 'Root',
    description: 'Root of the Schema',
  });

  const dynamodb = options.dynamodbFactory();
  const docClient = options.docClientFactory();

  BbPromise.promisifyAll(docClient);

  // console.log(`Creating schema ${options.name}`);

  const fields = _.reduce(tables, (result, table) => {
    if(!table.typeName) {
      throw new Error('typeName for table is not supplied');
    }

    const tableArgs = createTableArgs(table);

    const tableType = createTableType(table, tableArgs, docClient);
    result[table.typeName] = createTableField(table, tableArgs, tableType, docClient);

    if(table.typeListName) {
      const tableListType = createTableListField(table, tableArgs, tableType, docClient);

      result[table.typeListName] = tableListType;
    }

    return result;
  }, {});

  // console.log('Created fields: ', fields);

  const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
      name: options.name,
      description: options.description,
      fields: fields,
    }),
  });

  return schema;
}
