import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CharacterTextSplitter } from '@langchain/text_splitter';

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

export default docsFromPDFs;
