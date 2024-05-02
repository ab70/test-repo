
import { TableErrors, CategoryWithDifferentPriority, SubcategoriesWithDifferentPriorities } from "./typeDef/types";

export function createTreeAndCheckLevels(file: any[]) {
    const data = file;
    // const data = [
    //     ["_id", "Analytics Action", "Analytics Category", "Analytics Label", "Category 1", "Category 1 Priority", "Category 2", "Category 2 Priority", "Category 3", "Category 3 Priority"],
    //     ["1", "Click", "", "", "Category 1 Value", "0", "Category 2 Value", "1", "Category 3 Value", "3"],
    //     ["2", "Hover", "", "", "Category 1 Value", "0", "Category 2 Value", "2", "Category 3 Value", "4"],
    //     ["3", "Hover", "", "", "Category 1 Value", "0", "Category 2 Value", "5", "Category 3 Value", "5"]
    // ];
    const { categoryIndexes, categoryPriorityIndexes, } = findCategoryIndexes(
        data[0]
    );
    const { extractedCategories, subcategoriesWithDifferentPriorities } =
        extractCategoriesFromRows(
            data.slice(1),
            categoryIndexes,
            categoryPriorityIndexes
        );
    const tableErr: TableErrors[] = [];
    //Create mesages for errors
    subcategoriesWithDifferentPriorities.map((p: SubcategoriesWithDifferentPriorities) => {
        p.rowIndexes.map(r => {
            const findRowInErrorList = tableErr.findIndex((t: TableErrors) => t.row === r)
            // Found row number in that list then push column index and error message
            if (findRowInErrorList !== -1) {
                const errMessage = `This category has different priority values: ${p.priorities.join(', ')} `
                tableErr[findRowInErrorList].columns.push(p.columnIndex);
                tableErr[findRowInErrorList].messages.push(errMessage)
            }
            // Could not find the row in the error list, now create one
            else {
                const errMessage = `This category has different priority values: ${p.priorities.join(', ')} `
                tableErr.push({
                    row: r,
                    columns: [p.columnIndex],
                    messages: [errMessage]
                })
            }
        })
    });

    const { finalTableErr } = getMissingCategories(extractedCategories, categoryIndexes, data.slice(1), tableErr);

    return {
        extractedCategories: extractedCategories,
        subcategoriesWithDifferentPriorities: subcategoriesWithDifferentPriorities,
        finalTableErr
    }
}

function extractCategoriesFromRows(
    data: any[][],
    categoryIndexes: number[],
    categoryPriorityIndexes: number[]
): any {
    const extractedCategories: any[] = [];
    const subcategoriesMap: Map<string, Set<string>> = new Map();
    const subcategoriesWithDifferentPriorities: SubcategoriesWithDifferentPriorities[] = [];
    const categoryWithDifferentPriority: CategoryWithDifferentPriority[] = [];
    // const tableErr: TableErrors[] = [];
    for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        let currentCategory: any = null;

        for (let j = 0; j < categoryIndexes.length; j++) {
            let pCategory: string = "";
            let parentIndex: number = -1;
            if (j > 0) {
                parentIndex = categoryIndexes[j - 1];
                pCategory = rowData[parentIndex];
            }
            const categoryIndex = categoryIndexes[j];
            const categoryPriorityIndex = categoryPriorityIndexes[j];
            const category = rowData[categoryIndex];
            // this will skip the loop if category is empty wont do anything
            if (category.trim() == "") {
                continue;
            }
            const categoryPriority = rowData[categoryPriorityIndex];
            // check iif category is in the different liist
            const findCategoryInDiffList = categoryWithDifferentPriority.findIndex(c => c.category === category)
            // in the list was not found then push this one
            if (findCategoryInDiffList == -1) {
                categoryWithDifferentPriority.push({ category: category, parentCategory: pCategory, priorities: [categoryPriority], columnIndex: categoryPriorityIndex, rowIndexes: [i] });
            } else {
                // else if that category is   in the list of different list check if different value and push the Priority
                if (!categoryWithDifferentPriority[findCategoryInDiffList].priorities.includes(categoryPriority)) {

                    if (categoryWithDifferentPriority[findCategoryInDiffList]?.parentCategory === pCategory) {
                        categoryWithDifferentPriority[findCategoryInDiffList].priorities.push(categoryPriority);
                        categoryWithDifferentPriority[findCategoryInDiffList].columnIndex = categoryPriorityIndex;
                        categoryWithDifferentPriority[findCategoryInDiffList].rowIndexes.push(i);
                    }
                }
            }
            if (!currentCategory) {
                // Check if the category already exists in extractedCategories
                const existingCategory = extractedCategories.find(
                    (cat) => cat.category === category
                );
                if (existingCategory) {
                    currentCategory = existingCategory;
                } else {
                    currentCategory = {
                        category: category,
                        categoryPriority: categoryPriority,
                        childCategory: [],
                    };
                    extractedCategories.push(currentCategory);
                }
            } else {
                let foundChild = false;
                for (let k = 0; k < currentCategory.childCategory.length; k++) {
                    if (currentCategory.childCategory[k].category === category) {
                        const subcategory = currentCategory.childCategory[k];
                        const subcategoryPriorities =
                            subcategoriesMap.get(category) || new Set<string>();
                        if (!subcategoryPriorities.has(categoryPriority)) {
                            const findExistingOne =
                                subcategoriesWithDifferentPriorities.findIndex(
                                    (e) => e.category === category
                                );
                            if (findExistingOne !== -1) {
                                // if the parent category is the same then push the priority/ to solve same name but diff parent issue
                                if (subcategoriesWithDifferentPriorities[findExistingOne].parentCategory === pCategory) {
                                    subcategoriesWithDifferentPriorities[
                                        findExistingOne
                                    ].priorities.push(categoryPriority);
                                    subcategoriesWithDifferentPriorities[
                                        findExistingOne
                                    ].columnIndex = categoryPriorityIndexes[j];
                                    subcategoriesWithDifferentPriorities[
                                        findExistingOne
                                    ].rowIndexes.push(i);
                                }

                            } else {
                                const uniqueArr = Array.from(new Set([subcategory.categoryPriority, categoryPriority]))

                                if (uniqueArr.length > 1) {
                                    subcategoriesWithDifferentPriorities.push({
                                        category: category,
                                        parentCategory: pCategory,
                                        priorities: uniqueArr,
                                        columnIndex: categoryPriorityIndexes[j],   // missing vaaaaaaaaalueeeeeeeeeeeeeeeeeeeeee
                                        rowIndexes: [i]
                                    });
                                }
                            }
                        }
                        subcategoryPriorities.add(categoryPriority);
                        subcategoriesMap.set(category, subcategoryPriorities);
                        currentCategory = subcategory;
                        foundChild = true;
                        break;
                    }
                }
                if (!foundChild) {
                    const newChildCategory = {
                        category: category,
                        categoryPriority: categoryPriority,
                        childCategory: [],
                    };
                    const subcategoryPriorities = new Set<string>();
                    subcategoryPriorities.add(categoryPriority);
                    subcategoriesMap.set(category, subcategoryPriorities);
                    currentCategory.childCategory.push(newChildCategory);
                    currentCategory = newChildCategory;
                }
            }
        }
    }
    categoryWithDifferentPriority.map(c => {
        const findIfCategoryIsAlreadyThere = subcategoriesWithDifferentPriorities.findIndex(e => e.category == c.category);
        if (c.priorities.length > 1) {
            if (findIfCategoryIsAlreadyThere === -1) {
                subcategoriesWithDifferentPriorities.push(c);
            }
        }
    })
    return { extractedCategories, subcategoriesWithDifferentPriorities, };
}

function findCategoryIndexes(arr: string[]): {
    categoryIndexes: number[];
    categoryPriorityIndexes: number[];
} {
    const categoryIndexes: number[] = [];
    const categoryPriorityIndexes: number[] = [];

    arr.forEach((item, index) => {
        if (/^Category (\d+)$/.test(item)) {
            categoryIndexes.push(index);
        } else if (/^Category (\d+) Priority$/.test(item)) {
            categoryPriorityIndexes.push(index);
        }
    });

    return { categoryIndexes, categoryPriorityIndexes };
}

function getMissingCategories(
    extractedCategories: any[],
    categoryIndexes: number[],
    data: any[][],
    tableErr: TableErrors[]
): {
    finalTableErr: TableErrors[]
} {
    const finalTableErr: TableErrors[] = tableErr;
    data.map((d, rowIndex) => {
        // Inside a row
        // find the parentCategory
        const parentCategory = extractedCategories.find(c => c.category === d[categoryIndexes[0]])
        // let parentCategory = null;
        for (let i = 0; i < categoryIndexes.length; i++) {
            let cParent = null;
            const childCat = d[categoryIndexes[i]];
            if (i > 0) {
                const findNewParentIndex = parentCategory.childCategory.findIndex((c: any) => c.category == childCat);
                if (findNewParentIndex !== -1) {
                    cParent = parentCategory.childCategory[findNewParentIndex];
                } else {
                    cParent = parentCategory
                }
            }
            if (childCat.trim() == "" && cParent.childCategory?.length > 0) {

                const findIfThisRowInErrList = finalTableErr.findIndex(e => e.row === rowIndex + 1)
                if (findIfThisRowInErrList !== -1) {
                    finalTableErr[findIfThisRowInErrList].messages.push(`Missing Category ${i + 1}`)
                    finalTableErr[findIfThisRowInErrList].columns.push(categoryIndexes[i])
                } else {
                    finalTableErr.push({
                        row: rowIndex,
                        messages: [`Missing Category${i + 1}`],
                        columns: [categoryIndexes[i]]
                    })
                }
            }
        }

    })
    return { finalTableErr };
}