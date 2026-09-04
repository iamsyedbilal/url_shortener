export const getPagination = (page = '1', limit = '10') => {
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

  return {
    pageNumber,
    limitNumber,
    skip: (pageNumber - 1) * limitNumber,
  };
};
