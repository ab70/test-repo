import { requiredStrings } from "./constants";
// import 

export function validateFile(file: any[]) {
  let errors: any = [];
  const trimmedFile = trimValues(file);
  try {
    validateHeader(trimmedFile[0]);
  } catch (errors: any) {
    return { isValid: false, headerError: true, errors };
  }
  errors = checkValues(trimmedFile);

  return errors.length
    ? { isValid: false, errors }
    : { isValid: true, errors, trimmedFile };
}

function trimValues(file: any[][]): any[][] {
  const trimmedFile: any[][] = [];

  for (let i = 0; i < file.length; i++) {
    const innerArray: any[] = [];
    for (let j = 0; j < file[i].length; j++) {
      if (typeof file[i][j] === "string") {
        innerArray.push(file[i][j].trim());
      } else {
        innerArray.push(file[i][j]);
      }
    }
    trimmedFile.push(innerArray);
  }

  return trimmedFile;
}

function validateHeader(arr: any[]) {
  const errors = [];
  for (const requiredString of requiredStrings) {
    if (!arr.includes(requiredString)) {
      errors.push({ message: `${requiredString} is missing in header` });
    }
  }
  const serialError = validateAndSeparateCategories(arr);
  if (serialError) errors.push({ message: serialError });
  if (errors.length) {
    throw errors;
  }
  return true;
}
function validateAndSeparateCategories(arr: any) {
  const arrays = separateCategories(arr);
  return validateSerial(arrays);
}
function separateCategories(arr: string[]): { [key: string]: string[] } {
  const categoryArrays: { [key: string]: string[] } = {};

  arr.forEach((item) => {
    if (item.includes("Category") && !item.includes("Analytics Category")) {
      if (item.includes("Priority")) {
        const categoryName = item.split(" ")[0] + " Priority"; // Extract priority name
        if (!categoryArrays[categoryName]) {
          categoryArrays[categoryName] = [];
        }
        categoryArrays[categoryName].push(item);
      } else {
        const categoryName = item.split(" ")[0]; // Extract category name
        if (!categoryArrays[categoryName]) {
          categoryArrays[categoryName] = [];
        }
        categoryArrays[categoryName].push(item);
      }
    } else if (item.includes("Keyword Group")) {
      const keywordGroupName = item.split(" ")[0] + " Group"; // Extract keyword group name
      if (!categoryArrays[keywordGroupName]) {
        categoryArrays[keywordGroupName] = [];
      }
      categoryArrays[keywordGroupName].push(item);
    }
  });  
  return categoryArrays;
}

function validateSerial(categories: {
  [key: string]: string[];
}): string | null {
  for (const categoryName in categories) {
    const category = categories[categoryName];
    const numbers = category.map((item) =>
      parseInt(item.match(/\d+/)?.[0] || "", 10),
    );

    for (let i = 1; i <= numbers.length; i++) {
      if (!numbers.includes(i)) {
        return `Category "${categoryName}" is not complete or not in serial order.`;
      }
    }
  }

  return null;
}

function checkValues(arr: any[][]): { errors: any[] } {
  const headerIndexes = findIndexes(arr[0]);
  const rowData = arr.slice(1);
  let hasError = false;
  let errors: any = [];

  rowData.forEach((row, idx) => {
    errors[idx] = [];
    // console.log("onsoleLog", row);
    headerIndexes.categoryIndex.forEach((ci, number) => {
      if (row[ci]) {

        const cpi = headerIndexes.categoryPriorityIndex[number];
        if (isNaN(parseFloat(row[cpi]))) {
          hasError = true;
          errors[idx].push({
            [cpi]: `Category priority Value of row: ${idx + 1
              } index: ${cpi} value: ${row[cpi]} is not a valid number.`,
          });
          return;
        }
      }
    });

    headerIndexes.keywordGroupIndex.forEach((index) => {
      if (row[index]) {
        let keywords;
        try {
          keywords = JSON.parse(row[index]);
          if (!Array.isArray(keywords) && typeof keywords !== "string") {
            hasError = true;
            errors[idx].push({
              [index]: `Invalid value at index ${index}: ${row[index]}`,
            });
          }
        } catch (error) {
          hasError = true;
          errors[idx].push({
            [index]: `Invalid JSON string at row: ${idx + 1} index ${index}: ${row[index]
              }`,
          });
        }
      }
    });
  });
  if (hasError) {
    return errors;
  }
  errors = [];
  return errors;
}
function findIndexes(arr: string[]): {
  categoryIndex: number[];
  categoryPriorityIndex: number[];
  keywordGroupIndex: number[];
  generalIndex: { [key: string]: number };
} {
  const categoryIndex: number[] = [];
  const categoryPriorityIndex: number[] = [];
  const keywordGroupIndex: number[] = [];
  const generalIndex: { [key: string]: number } = {};

  arr.forEach((item, index) => {
    generalIndex[item] = index;
    if (/^Category (\d+) Priority$/.test(item)) {
      const match = item.match(/^Category (\d+) Priority$/);
      if (match) {
        const number = parseInt(match[1]);
        if (!isNaN(number)) {
          categoryPriorityIndex[number] = index;
        }
      }
    } else if (/^Category (\d+)$/.test(item)) {
      const match = item.match(/^Category (\d+)$/);
      if (match) {
        const number = parseInt(match[1]);
        if (!isNaN(number)) {
          categoryIndex[number] = index;
        }
      }
    } else if (/^Keyword Group (\d+)$/.test(item)) {
      const match = item.match(/^Keyword Group (\d+)$/);
      if (match) {
        const number = parseInt(match[1]);
        if (!isNaN(number)) {
          keywordGroupIndex[number] = index;
        }
      }
    }
  });

  return {
    categoryIndex,
    categoryPriorityIndex,
    keywordGroupIndex,
    generalIndex,
  };
}
