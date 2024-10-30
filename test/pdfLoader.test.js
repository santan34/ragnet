const assert = require('assert');
const sinon = require('sinon');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { CharacterTextSplitter } = require('langchain/text_splitter');
const docsFromPDFs = require('../services/pdfLoader');

// FILE: services/pdfLoader.test.js

describe('docsFromPDFs Tests', () => {
  let splitterStub;
  let pdfLoaderStub;
  let loadAndSplitStub;

  before(() => {
    splitterStub = sinon
      .stub(CharacterTextSplitter.prototype, 'constructor')
      .returns({
        separator: '. ',
        chunkSize: 2500,
        chunkOverlap: 200,
      });

    loadAndSplitStub = sinon.stub().resolves(['doc1', 'doc2']);
    pdfLoaderStub = sinon
      .stub(PDFLoader.prototype, 'loadAndSplit')
      .callsFake(loadAndSplitStub);
  });

  after(() => {
    sinon.restore();
  });

  it('should initialize CharacterTextSplitter with correct parameters', async () => {
    await docsFromPDFs(['path/to/pdf1', 'path/to/pdf2']);
    assert.ok(
      splitterStub.calledOnceWith({
        separator: '. ',
        chunkSize: 2500,
        chunkOverlap: 200,
      })
    );
  });

  it('should extract documents from multiple PDF paths successfully', async () => {
    const paths = ['path/to/pdf1', 'path/to/pdf2'];
    const result = await docsFromPDFs(paths);

    assert.strictEqual(result.length, 4);
    assert.ok(pdfLoaderStub.calledTwice);
    assert.ok(loadAndSplitStub.calledTwice);
  });

  it('should handle errors during document extraction', async () => {
    loadAndSplitStub.rejects(new Error('Load error'));

    try {
      await docsFromPDFs(['path/to/pdf1']);
    } catch (error) {
      assert.strictEqual(error.message, 'Load error');
    }
  });
});
