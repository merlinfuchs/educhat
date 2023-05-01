import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "crypto";
import fs from "fs";
import { UploadDocumentRequest, UploadDocumentResponse } from "@/util/wire";

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

  const hash = createHash("sha256").update(buffer).digest("hex");
  const fileName = `documents/${hash}.pdf`;

  await fs.promises.mkdir("documents", { recursive: true }).catch(() => {});

  await fs.promises
    .writeFile(fileName, buffer)
    .then(() => {
      res.status(200).json({ success: true, fileHash: hash });
    })
    .catch((err) => {
      res.status(200).json({ success: false, error: `${err}` });
    });
}
