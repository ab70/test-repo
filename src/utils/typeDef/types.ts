type SubcategoriesWithDifferentPriorities = {
    category: string;
    parentCategory: string;
    priorities: string[];
    columnIndex: number;
    rowIndexes: number[];
}
type CategoryWithDifferentPriority = {
    category: string;
    parentCategory: string;
    priorities: string[];
    columnIndex: number;
    rowIndexes: number[];
}
type TableErrors = {
    row: number;
    columns: number[];
    messages: string[];
}


export type {
    TableErrors,
    SubcategoriesWithDifferentPriorities,
    CategoryWithDifferentPriority
}