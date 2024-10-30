const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { CharacterTextSplitter } = require('langchain/text_splitter');

// Function to extract documents from PDFs
const docsFromPDFs = async (paths_to_pdfs) => {
  const splitter = new CharacterTextSplitter({
    separator: '. ',
    chunkSize: 2500,
    chunkOverlap: 200,
  });

  const allDocs = [];

  for (const path of paths_to_pdfs) {
    const loader = new PDFLoader(path);
    const docs = await loader.loadAndSplit(splitter);
    allDocs.push(...docs);
  }

  return allDocs;
};

module.exports = docsFromPDFs;
