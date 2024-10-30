const assert = require('assert');
const sinon = require('sinon');
const embeddingClient = require('./chroma');
const { ChromaClient } = require('chromadb');

// FILE: utils/chroma.test.js

describe('EmbeddingsClient Tests', () => {
  let chromaClientMock;

  before(() => {
    chromaClientMock = sinon.stub(ChromaClient.prototype);
  });

  after(() => {
    sinon.restore();
  });

  it('should initialize ChromaClient correctly', async () => {
    const initializeSpy = sinon.spy(embeddingClient, 'initialize');
    await embeddingClient.ensureInitialized();
    assert.ok(initializeSpy.calledOnce);
    initializeSpy.restore();
  });

  it('should add documents successfully', async () => {
    const getOrCreateCollectionStub =
      chromaClientMock.getOrCreateCollection.resolves({
        add: sinon.stub().resolves(),
      });

    const documents = [
      { pageContent: 'Document 1' },
      { pageContent: 'Document 2' },
    ];
    await embeddingClient.addDocuments('botName', documents);

    assert.ok(getOrCreateCollectionStub.calledOnce);
    getOrCreateCollectionStub.restore();
  });

  it('should handle errors during document addition', async () => {
    const getOrCreateCollectionStub =
      chromaClientMock.getOrCreateCollection.throws(
        new Error('Collection error')
      );

    const documents = [
      { pageContent: 'Document 1' },
      { pageContent: 'Document 2' },
    ];
    try {
      await embeddingClient.addDocuments('botName', documents);
    } catch (error) {
      assert.strictEqual(error.message, 'Collection error');
    }

    getOrCreateCollectionStub.restore();
  });

  it('should delete collection successfully', async () => {
    const getOrCreateCollectionStub =
      chromaClientMock.getOrCreateCollection.resolves({});
    const deleteCollectionStub = chromaClientMock.deleteCollection.resolves();

    await embeddingClient.deleteCollection('botName');

    assert.ok(getOrCreateCollectionStub.calledOnce);
    assert.ok(deleteCollectionStub.calledOnce);

    getOrCreateCollectionStub.restore();
    deleteCollectionStub.restore();
  });

  it('should handle errors during collection deletion', async () => {
    const getOrCreateCollectionStub =
      chromaClientMock.getOrCreateCollection.throws(
        new Error('Collection error')
      );

    try {
      await embeddingClient.deleteCollection('botName');
    } catch (error) {
      assert.strictEqual(error.message, 'Collection error');
    }

    getOrCreateCollectionStub.restore();
  });

  it('should query collection successfully', async () => {
    const getCollectionStub = chromaClientMock.getCollection.resolves({
      query: sinon.stub().resolves({
        documents: [['Document 1']],
        distances: [[0.1]],
        metadatas: [[{ botName: 'botName', chunkId: 0 }]],
      }),
    });

    const results = await embeddingClient.queryCollection(
      'botName',
      'searchText'
    );
    assert.strictEqual(results.documents.length, 1);
    assert.strictEqual(results.documents[0], 'Document 1');

    getCollectionStub.restore();
  });

  it('should handle errors during collection query', async () => {
    const getCollectionStub = chromaClientMock.getCollection.throws(
      new Error('Query error')
    );

    try {
      await embeddingClient.queryCollection('botName', 'searchText');
    } catch (error) {
      assert.strictEqual(error.message, 'Query error');
    }

    getCollectionStub.restore();
  });
});
