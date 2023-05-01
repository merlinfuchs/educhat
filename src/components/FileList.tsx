import { useHasHydrated } from "@/util/hasHydrated";
import { useUploadedFilesStore } from "@/util/uploadedFilesStore";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function FileList() {
  const hasHydrated = useHasHydrated();
  const files = useUploadedFilesStore((state) => state.files);

  const setSelected = useUploadedFilesStore((state) => state.setFileSelected);

  return (
    <div className="space-y-4 overflow-y-auto">
      {hasHydrated &&
        files.map((file, i) => (
          <div
            key={file.hash}
            className="text-gray-800 flex space-x-5 border-b pb-2 items-center"
          >
            <div className="break-all flex-auto">{file.name}</div>
            <div
              className="w-7 h-7 p-1 flex-none bg-gray-100 rounded cursor-pointer"
              onClick={() => setSelected(i, !file.selected)}
            >
              {file.selected && <CheckIcon />}
            </div>
          </div>
        ))}
    </div>
  );
}
