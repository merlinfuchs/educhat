export type QueryRequest = {
  fileHashes: string[];
  query: string;
};

export type QueryResponse =
  | {
      success: true;
      answer: string;
    }
  | {
      success: false;
      error: string;
    };

export type UploadDocumentRequest = {
  dataUrl: string;
};

export type UploadDocumentResponse =
  | {
      success: true;
      fileHash: string;
    }
  | {
      success: false;
      error: string;
    };
