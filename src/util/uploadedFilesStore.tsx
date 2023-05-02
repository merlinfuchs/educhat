import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UploadeFile {
  name: string;
  hash: string;
  uploadedAt: Date;
  selected: boolean;
}

interface UploadedFilesStore {
  files: UploadeFile[];
  addFile: (file: UploadeFile) => void;
  removeFile: (i: number) => void;
  setFileSelected: (i: number, selected: boolean) => void;
}

export const useUploadedFilesStore = create<UploadedFilesStore>()(
  persist(
    (set) => ({
      files: [],
      addFile: (file) =>
        set((state) => {
          if (state.files.find((f) => f.hash === file.hash)) return state;
          return { files: [...state.files, file] };
        }),
      removeFile: (i) =>
        set((state) => ({
          files: state.files.filter((_, index) => index !== i),
        })),
      setFileSelected: (i, selected) =>
        set((state) => {
          const files = [...state.files];
          files[i].selected = selected;
          return { files };
        }),
    }),
    { name: "uploaded-files", version: 1 }
  )
);
