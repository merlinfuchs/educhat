import { Inter } from "next/font/google";
import FileUpload from "@/components/FileUpload";
import Chat from "@/components/Chat";
import FileList from "@/components/FileList";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="w-screen h-screen bg-gray-100 flex">
      <Head>
        <title>EduChat</title>
      </Head>
      <div className="flex-none w-80 bg-gray-300 shadow-md flex flex-col p-4 overflow-y-hidden">
        <div className="flex-auto">
          <FileList />
        </div>
        <div className="flex-none">
          <FileUpload />
        </div>
      </div>
      <div className="flex-auto flex flex-col">
        <Chat />
      </div>
    </main>
  );
}
