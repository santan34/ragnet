const assert = require('assert');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const Document = require('../models/documents');
const FileController = require('../controllers/fileController');

// FILE: controllers/fileController.test.js

describe('FileController.downloadFile Tests', () => {
  let req;
  let res;
  let findByIdStub;
  let existsSyncStub;
  let downloadStub;

  beforeEach(() => {
    req = {
      body: {
        docId: '12345',
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      setHeader: sinon.stub(),
      download: sinon.stub(),
    };
    findByIdStub = sinon.stub(Document, 'findById');
    existsSyncStub = sinon.stub(fs, 'existsSync');
    downloadStub = sinon.stub(res, 'download');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should download file successfully', async () => {
    const document = {
      _id: '12345',
      name: 'test.pdf',
      path: 'uploads/test.pdf',
    };
    findByIdStub.resolves(document);
    existsSyncStub.returns(true);

    await FileController.downloadFile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.docId));
    assert.ok(
      existsSyncStub.calledOnceWith(path.join(__dirname, '..', document.path))
    );
    assert.ok(
      res.setHeader.calledWith(
        'Content-Disposition',
        `attachment; filename=${document.name}`
      )
    );
    assert.ok(res.download.calledOnceWith(document.path, document.name));
    assert.ok(res.status.calledOnceWith(200));
    assert.ok(
      res.json.calledOnceWith({ message: 'File downloading successfully' })
    );
  });

  it('should return 400 if file id is not provided', async () => {
    req.body.docId = null;

    await FileController.downloadFile(req, res);

    assert.ok(res.status.calledOnceWith(400));
    assert.ok(res.json.calledOnceWith({ error: 'File id is required' }));
  });

  it('should return 404 if file not found in database', async () => {
    findByIdStub.resolves(null);

    await FileController.downloadFile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.docId));
    assert.ok(res.status.calledOnceWith(404));
    assert.ok(res.json.calledOnceWith({ error: 'File not found' }));
  });

  it('should return 404 if file not found on server', async () => {
    const document = {
      _id: '12345',
      name: 'test.pdf',
      path: 'uploads/test.pdf',
    };
    findByIdStub.resolves(document);
    existsSyncStub.returns(false);

    await FileController.downloadFile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.docId));
    assert.ok(
      existsSyncStub.calledOnceWith(path.join(__dirname, '..', document.path))
    );
    assert.ok(res.status.calledOnceWith(404));
    assert.ok(res.json.calledOnceWith({ error: 'File not found on server' }));
  });

  it('should handle errors during file download', async () => {
    const error = new Error('Database error');
    findByIdStub.rejects(error);

    await FileController.downloadFile(req, res);

    assert.ok(findByIdStub.calledOnceWith(req.body.docId));
    assert.ok(res.status.calledOnceWith(500));
    assert.ok(
      res.json.calledOnceWith({ error: `Internal server error: ${error}` })
    );
  });
});
