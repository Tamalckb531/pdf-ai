"use client";
import { Upload } from "lucide-react";
import React from "react";

const FileUpload: React.FC = () => {
  const handleFileUploadBtnClick = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");

    el.addEventListener("change", async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append("pdf", file);

          await fetch("http://localhost:8000/upload/pdf", {
            method: "POST",
            body: formData,
          });

          console.log("File uploaded");
        }
      }
    });

    el.click();
  };
  return (
    <div className=" bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border border-white h-fit">
      <div
        onClick={handleFileUploadBtnClick}
        className=" flex justify-center items-center flex-col"
      >
        <h3> Upload PDF File</h3>
        <Upload />
      </div>
    </div>
  );
};

export default FileUpload;
