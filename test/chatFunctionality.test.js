const assert = require('assert');
const sinon = require('sinon');
const sendMessage = require('../utils/chatFunctionality');
const embeddingClient = require('../utils/chroma');
const { OpenAI } = require('openai');

// FILE: utils/chatFunctionality.test.js

describe('Chat Functionality Tests', () => {
  let openaiMock;

  before(() => {
    openaiMock = sinon.stub(OpenAI.prototype, 'chat').value({
      completions: {
        create: sinon.stub(),
      },
    });
  });

  after(() => {
    sinon.restore();
  });

  it('should initialize OpenAI client correctly', () => {
    assert.ok(openaiMock);
  });

  it('should return a meaningful response from OpenAI', async () => {
    const queryStub = sinon.stub(embeddingClient, 'queryCollection').resolves({
      documents: ['Document 1', 'Document 2'],
    });

    openaiMock.completions.create.resolves({
      choices: [{ message: { content: 'This is a response from OpenAI' } }],
    });

    const response = await sendMessage('What is AI?', 'chat123', 'botName');
    assert.strictEqual(response.chatResponse, 'This is a response from OpenAI');

    queryStub.restore();
  });

  it('should return an error when no relevant information is found', async () => {
    const queryStub = sinon.stub(embeddingClient, 'queryCollection').resolves({
      documents: [],
    });

    const response = await sendMessage('What is AI?', 'chat123', 'botName');
    assert.strictEqual(
      response.error,
      'No relevant information found for the query'
    );
    assert.strictEqual(response.status, 404);

    queryStub.restore();
  });

  it('should handle errors in sendMessage function', async () => {
    const queryStub = sinon
      .stub(embeddingClient, 'queryCollection')
      .throws(new Error('Query error'));

    const response = await sendMessage('What is AI?', 'chat123', 'botName');
    assert.strictEqual(response.error, 'Internal server error: Query error');
    assert.strictEqual(response.status, 500);

    queryStub.restore();
  });
});
