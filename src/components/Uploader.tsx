import { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Papa from "papaparse";
import { redirect } from "next/navigation";
import useAppStore from "@/store";

const fileTypes = ["CSV"];

export default function Uploader() {
  const { setFileData } = useAppStore();
  const [file, setFile] = useState<any>(null);

  const handleChange = (file: any) => {
    setFile(file);
  };
  useEffect(() => {
    if (file) {
      Papa.parse(file, {
        transform: (value) => value.trim(),
        complete: (res) => setFileData(res.data),
      });
      redirect("/table");
    }
  }, [file, setFileData]);
  return (
    <div className="flex flex-col items-center gap-4">
      <h1>You can Drag & Drop Files or click here to upload</h1>
      <FileUploader
        multiple={false}
        handleChange={handleChange}
        name="file"
        types={fileTypes}
        onTypeError={(err: any) => console.log(err)}
      />
    </div>
  );
}
