const assert = require('assert');
const sinon = require('sinon');
const mongoose = require('mongoose');

// FILE: utils/db.test.js

require('dotenv').config();

describe('Database Connection Tests', () => {
  let connectStub;

  before(() => {
    connectStub = sinon.stub(mongoose, 'connect');
  });

  after(() => {
    sinon.restore();
  });

  it('should call mongoose.connect with correct parameters', () => {
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 27017;
    const dbName = process.env.DB_NAME || 'test';
    const connectionString = `mongodb://${host}:${port}/${dbName}`;

    require('../utils/db'); // This will trigger the connection

    assert.ok(connectStub.calledOnceWith(connectionString));
  });

  it('should log success message on successful connection', async () => {
    const consoleLogStub = sinon.stub(console, 'log');
    connectStub.resolves();

    await require('../utils/db'); // This will trigger the connection

    assert.ok(consoleLogStub.calledWith('Connected to the database'));

    consoleLogStub.restore();
  });

  it('should log error message on connection error', async () => {
    const consoleLogStub = sinon.stub(console, 'log');
    const errorMessage = 'Error connecting to the database';
    connectStub.rejects(new Error(errorMessage));

    await require('../utils/db'); // This will trigger the connection

    assert.ok(
      consoleLogStub.calledWith(
        'Error connecting to the database ',
        sinon.match.instanceOf(Error)
      )
    );

    consoleLogStub.restore();
  });
});
