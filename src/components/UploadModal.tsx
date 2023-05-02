interface Props {
  status: "idle" | "uploading" | "done";
  close: () => void;
  error: string | null;
}

export default function UploadModal({ status, close, error }: Props) {
  if (status === "idle") {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-screen w-screen flex items-center justify-center z-30 bg-black bg-opacity-70">
      <div className="w-96 p-4 bg-gray-300 rounded-lg">
        <div className="mb-5">
          {status === "uploading" ? (
            <div>
              <div className="text-lg text-gray-800 mb-2">
                The file is being uploaded ...
              </div>
              <div className="text-gray-600">
                Depending on the file this can take multiple minutes. Especially
                extracting text from scanned PDFs takes a long time!
              </div>
            </div>
          ) : (
            <div className="text-lg text-gray-800">
              {error
                ? `There was an error: ${error}`
                : "The file has been uploaded!"}
            </div>
          )}
        </div>
        {status === "done" && (
          <div className="flex justify-end">
            <button
              className="px-3 py-2 rounded border-2 border-gray-500"
              onClick={close}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
