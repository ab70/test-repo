"use client";

import Uploader from "@/components/Uploader";
import React, { useEffect } from "react";

const App = () => {
  const receiveMessage = (event: any) => {
    if (event?.data?.payload) {
      console.log("event", event.data);
    }
  };

  useEffect(() => {
    if (navigator.userAgent !== "ReactSnap") {
      window.addEventListener("message", receiveMessage, false);
      window.parent.postMessage("iframeFinishLoading", "*");
    }

    return () => {
      window.removeEventListener("message", receiveMessage, false);
    };
  }, []);
  return (
    <div className="p-4 h-[100vh]">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold">FAQ Datasource Checker</h1>
        <Uploader />
      </div>
    </div>
  );
};

export default App;
