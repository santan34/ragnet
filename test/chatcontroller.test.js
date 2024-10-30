const assert = require('assert');
const sinon = require('sinon');
const Conversation = require('../models/conversations');
const ChatController = require('../controllers/chatcontroller');

// FILE: controllers/chatcontroller.test.js

describe('ChatController.restartChat Tests', () => {
  let req;
  let res;
  let findByIdStub;
  let saveStub;

  beforeEach(() => {
    req = {
      body: {
        chatId: '12345',
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    findByIdStub = sinon.stub(Conversation, 'findById');
    saveStub = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should restart chat successfully', async () => {
    const conversation = {
      _id: '12345',
      messages: ['message1', 'message2'],
      save: saveStub.resolves(),
    };
    findByIdStub.resolves(conversation);

    await ChatController.restartChat(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.chatId));
    assert.strictEqual(conversation.messages.length, 0);
    assert.ok(saveStub.calledOnce);
    assert.ok(res.status.calledOnceWith(200));
    assert.ok(
      res.json.calledOnceWith({ message: 'Chat restarted successfully' })
    );
  });

  it('should return 404 if chat not found', async () => {
    findByIdStub.resolves(null);

    await ChatController.restartChat(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.chatId));
    assert.ok(res.status.calledOnceWith(404));
    assert.ok(res.json.calledOnceWith({ error: 'Chat not found' }));
  });

  it('should handle errors during chat restart', async () => {
    const error = new Error('Database error');
    findByIdStub.rejects(error);

    await ChatController.restartChat(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.chatId));
    assert.ok(res.status.calledOnceWith(500));
    assert.ok(
      res.json.calledOnceWith({ error: `Internal server error: ${error}` })
    );
  });
});
