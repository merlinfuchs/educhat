import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "crypto";
import fs from "fs";
import { UploadDocumentRequest, UploadDocumentResponse } from "@/util/wire";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
//@ts-ignore
import pdfExtract from "pdf-extract";
import { Document } from "langchain/document";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "100mb", // Set desired value here
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadDocumentResponse>
) {
  const data: UploadDocumentRequest = req.body;

  const buffer = Buffer.from(data.dataUrl.split(",")[1], "base64");
  const blob = new Blob([buffer], { type: "application/pdf" });

  const loader = new PDFLoader(blob);

  const hash = createHash("sha256").update(buffer).digest("hex");

  const fileDocs = await loader.load();
  if (fileDocs.length === 0) {
    const tempFilePath = `${__dirname}/${hash}.pdf`;
    await fs.promises.writeFile(tempFilePath, buffer);

    const promise = new Promise((resolve, reject) => {
      const processor = pdfExtract(
        tempFilePath,
        {
          type: "ocr",
          ocr_flags: ["--psm 1"],
          enc: "UTF-8",
          clean: true,
        },
        function (err: any) {
          if (err) {
            reject(err);
          }
        }
      );
      processor.on("complete", function (data: any) {
        resolve(data);
      });
      processor.on("error", function (err: any) {
        reject(err);
      });
    });

    try {
      const contents: any = await promise;

      contents.text_pages.forEach((pageText: string, i: number) => {
        fileDocs.push(
          new Document({
            pageContent: pageText,
            metadata: {
              source: "blob",
              blobType: "application/pdf",
              pdf: {
                totalPages: contents.text_pages.length,
              },
              loc: {
                pageNumber: i,
              },
            },
          })
        );
      });
    } catch (err) {
      res.status(200).json({
        success: false,
        error: `Failed to parse (OCR) documents: ${err}`,
      });
      return;
    } finally {
      await fs.promises.rm(tempFilePath);
    }
  }

  if (fileDocs.length === 0) {
    res.status(200).json({
      success: false,
      error: `No documents found`,
    });
    return;
  }

  const fileDump = JSON.stringify(
    fileDocs.map((d) => ({
      pageContent: d.pageContent,
      metadata: d.metadata,
    })),
    null,
    2
  );

  const fileName = `documents/${hash}.json`;

  await fs.promises.mkdir("documents", { recursive: true }).catch(() => {});

  await fs.promises
    .writeFile(fileName, fileDump)
    .then(() => {
      res.status(200).json({ success: true, fileHash: hash });
    })
    .catch((err) => {
      res.status(200).json({ success: false, error: `${err}` });
    });
}
