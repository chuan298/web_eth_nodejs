//file: index.js
const rp = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
 
const URL = `https://chiacalculator.com/`;
 
const options = {
  uri: URL,
  transform: function (body) {
    //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
    return cheerio.load(body);
  },
};
 
(async function crawler() {
  try {
    // Lấy dữ liệu từ trang crawl đã được parseDOM
    var $ = await rp(options);
  } catch (error) {
    return error;
  }
 
//   let a = $("#_next > div > :nth-child(2) > :nth-child(1) > div > section:nth-child(1) > div > div > input").val()
    let a = $(".chakra-input__group.css-vloijz > input").val()
    console.log(a)
  // Lưu dữ liệu về máy
//   fs.writeFileSync('data.json', JSON.stringify(data))
})();