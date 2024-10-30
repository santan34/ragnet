const assert = require('assert');
const sinon = require('sinon');
const User = require('../models/users');
const UserController = require('../controllers/userController');

// FILE: controllers/userController.test.js

describe('UserController.getUserProfile Tests', () => {
  let req;
  let res;
  let findByIdStub;

  beforeEach(() => {
    req = {
      userId: '12345',
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    findByIdStub = sinon.stub(User, 'findById');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return user profile successfully', async () => {
    const user = { _id: '12345', email: 'test@example.com' };
    findByIdStub.resolves(user);

    await UserController.getUserProfile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.userId));
    assert.ok(res.status.calledOnceWith(200));
    assert.ok(res.json.calledOnceWith(user));
  });

  it('should return 404 if user not found', async () => {
    findByIdStub.resolves(null);

    await UserController.getUserProfile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.userId));
    assert.ok(res.status.calledOnceWith(404));
    assert.ok(res.json.calledOnceWith({ error: 'User not found' }));
  });

  it('should handle errors during user profile retrieval', async () => {
    const error = new Error('Database error');
    findByIdStub.rejects(error);

    await UserController.getUserProfile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.userId));
    assert.ok(res.status.calledOnceWith(500));
    assert.ok(
      res.json.calledOnceWith({ error: `Internal server error: ${error}` })
    );
  });
});
