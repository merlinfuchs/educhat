import { useUploadedFilesStore } from "@/util/uploadedFilesStore";
import { UploadDocumentRequest, UploadDocumentResponse } from "@/util/wire";
import { ChangeEvent, useRef, useState } from "react";
import UploadModal from "./UploadModal";

export default function FileUpload() {
  const addFile = useUploadedFilesStore((state) => state.addFile);

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 90_000_000) {
        alert("File too large! Max 8MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        setUploadStatus("uploading");
        fetch("/api/document", {
          method: "POST",
          body: JSON.stringify({
            dataUrl,
          } as UploadDocumentRequest),
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(async (resp) => {
            setUploadStatus("done");
            setUploadError(null);

            const data: UploadDocumentResponse = await resp.json();
            if (data.success) {
              addFile({
                name: file.name,
                hash: data.fileHash,
                uploadedAt: new Date(),
                selected: false,
              });
            } else {
              setUploadStatus("done");
              setUploadError(`${data.error}`);
            }
          })
          .catch((err) => {
            setUploadStatus("done");
            setUploadError(`${err}`);
          });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div>
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        accept=".pdf"
        onChange={handleFile}
        multiple
      />
      <button
        className="px-3 py-2 w-full bg-gray-100 rounded"
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        Upload File
      </button>
      <UploadModal
        status={uploadStatus}
        close={() => setUploadStatus("idle")}
        error={uploadError}
      />
    </div>
  );
}
