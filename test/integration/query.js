'use strict';

const expect = require('chai').expect;

const setup = require('./setup');

const graphqlDynamo = require('../../src');

const AWS = require('aws-sdk');

describe('#query()', () => {
  const opts = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
  };

  AWS.config.update(opts);
  const dynamodb = new AWS.DynamoDB(opts);

  const tables = [{
    typeName: 'movie',
    typeListName: 'movies',
    tableName: 'movies',
    hashKey: {
      name: 'year',
      type: 'int',
    },
    rangeKey: {
      name: 'title',
      type: 'string',
    },
  }];

  const options = {
    dynamodbFactory: () => dynamodb
  };

  beforeEach(() => {
    return setup.init(dynamodb);
  });

  afterEach(function() {
    return setup.cleanup(dynamodb);
  });

  it('should get item', () => {
    const connector = graphqlDynamo(tables, options);

    const query = `{
      movie(year: 2013, title: "Turn It Down, Or Else!") {
        year, title
      }
    }`;

    return connector.query(query)
      .then((response) => {
        console.log(response);
      });
  });

  it('should query items', () => {
    const connector = graphqlDynamo(tables, options);

    const query = `{
      movie(year: 2013) {
        year, title
      }
    }`;

    return connector.query(query)
      .then((response) => {
        console.log(response);
      });
  });
});
