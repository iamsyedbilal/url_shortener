export const getSorting = (
  sortBy: string,
  sortOrder: string,
  allowedFields: string[]
): {
  sortField: string;
  sortDirection: 1 | -1;
} => {
  return {
    sortField: allowedFields.includes(sortBy) ? sortBy : 'createdAt',
    sortDirection: sortOrder === 'asc' ? 1 : -1,
  };
};
