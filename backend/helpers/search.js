module.exports = (query) => {
  let objectSearch = {
    keyword: "",
  }
  if (query.keyword) {
    objectSearch.keyword = query.keyword; 
    const regex = new RegExp(objectSearch.keyword, "i"); //Tự tìm hiểu vể RegExp
    objectSearch.regex = regex;
  }
  return objectSearch;
};
