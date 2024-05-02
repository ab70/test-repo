"use client";

import useAppStore from "@/store";
import { validateFile } from "@/utils/validate";
import { createTreeAndCheckLevels } from "@/utils/treeCheck";
import { Button, Tooltip, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { downloadCSV } from "@/utils/fileDownloader";
import dynamic from "next/dynamic";
import { TableErrors } from "@/utils/typeDef/types";
const CategoryModal = dynamic(() => import("./components/categoryModal"));


const Table = () => {
  const toast = useToast();
  const { fileData, setFileData } = useAppStore();
  const [errors, setErrors] = useState([]);
  const [tableError, setTableError] = useState<TableErrors[]>([]);
  const [extractedCategory, setExtractedCategory] = useState([]);
  useEffect(() => {
    if (!fileData?.length) {
      setFileData(null);
    } else {
      const { extractedCategories, finalTableErr } = createTreeAndCheckLevels(fileData);
      setTableError(finalTableErr)
      setExtractedCategory(extractedCategories);
      const { isValid, errors, headerError, trimmedFile } =
        validateFile(fileData);
      if (headerError) {
        setFileData(null);
        errors.forEach((error: any) => {
          toast({
            description: error.message,
            status: "error",
            duration: 15000,
            isClosable: true,
            position: "top",
          });
        });
      }
      if (!isValid || errors.length) {
        setErrors(errors);
      } else if (isValid && !errors.length && trimmedFile) {
        toast({
          title: "File Scanned successfully and ready to export",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
        setErrors([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData]);

  const handleFieldChange = (
    rowIndex: number,
    cellIndex: number,
    newValue: string,
  ) => {
    const updatedFileData = [...fileData];
    updatedFileData[rowIndex][cellIndex] = newValue;
    setFileData(updatedFileData);
  };

  const exportFile = () => {
    const csvData = Papa.unparse(fileData);
    downloadCSV(csvData);
  };

  return (
    <div className="p-4">
      <div className="px-4 py-2 flex gap-4 justify-end">
        <Button colorScheme="red" isDisabled={true}>
          Errors: {tableError.length}(Rows)
        </Button>
        <CategoryModal data={extractedCategory} />

        <Button colorScheme="red" onClick={() => (window.location.href = "/")}>
          Re-upload
        </Button>
        <Button
          colorScheme="green"
          isDisabled={!!errors.length || !fileData}
          onClick={exportFile}
        >
          Export
        </Button>
      </div>
      {fileData?.length ? (
        <div className="overflow-x-auto text-xs">
          <table className="table-auto w-full">
            <thead>
              <tr className="bg-gray-200 border">
                {fileData[0].map((header: any, index: number) => (
                  <th key={index} className="px-4 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {fileData.slice(1).map((row, rowIndex) => {
                // find if this row has errors
                const rowErrFind = tableError.findIndex(tr => tr.row === rowIndex)
                return (
                  <tr key={rowIndex} className="divide-y p-4">
                    {row.map((cell: any, cellIndex: number) => {
                      const cellErrors: any[] = errors[rowIndex] || [];
                      const error = cellErrors.find(
                        (errorObj: any) => errorObj[cellIndex],
                      );
                      let errCellMessage = ""
                      if (rowErrFind !== -1) {
                        const findCellError = tableError[rowErrFind].columns.findIndex(col => col === cellIndex)
                        if (findCellError !== -1) {
                          errCellMessage = tableError[rowErrFind].messages[findCellError]
                        }
                      }
                      return error || errCellMessage !== "" ? (
                        <Tooltip hasArrow label={error ? error[cellIndex] : errCellMessage} bg="red.600">
                          <td
                            key={cellIndex}
                            className={`px-4 py-2 ${(error || errCellMessage != "") ? "bg-red-200" : ""}`}
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                handleFieldChange(
                                  rowIndex + 1,
                                  cellIndex,
                                  e.target.value,
                                )
                              }
                              className={error ? "bg-red-200" : ""}
                            />
                          </td>
                        </Tooltip>
                      ) : (
                        <td key={cellIndex} className={`px-4 py-2`}>
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              handleFieldChange(
                                rowIndex + 1,
                                cellIndex,
                                e.target.value,
                              )
                            }
                            className={error ? "bg-red-200" : ""}
                          />
                        </td>
                      );
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-red-400">
          File Contains error, Please fix and re-upload
        </div>
      )}
    </div>
  );
};

export default Table;
