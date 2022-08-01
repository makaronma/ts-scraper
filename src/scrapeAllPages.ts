import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

// How to get the contents of each element of a nodelist?
// https://stackoverflow.com/questions/52827121/puppeteer-how-to-get-the-contents-of-each-element-of-a-nodelist


const addProducts = async(page:puppeteer.Page, pagesItemsPromises:Promise<[string, string, string][]>[])=>{
  const productsHandles = await page.$$("div.s-main-slot.s-result-list.s-search-results.sg-row > div");

  const itemsPromise = Promise.all(productsHandles.map((productHandle) => {
    const titlePromise = page.evaluate(
      (el) => el.querySelector("h2 > a > span")?.textContent ?? "NULL",
      productHandle
    );
    const pricePromise = page.evaluate(
      (el) =>
        el.querySelector(".a-price > .a-offscreen")?.textContent ?? "NULL",
      productHandle
    );
    const imagePromise = page.evaluate(
      (el) => el.querySelector(".s-image")?.getAttribute("src") ?? "NULL",
      productHandle
    ); 
    return Promise.all([titlePromise, imagePromise, pricePromise]);
  }));

  pagesItemsPromises.push(itemsPromise);
}

const scrapeAllPages=async () => {
  const start = new Date().getTime();
  console.log("loading. . .");
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1700, height: 900 },
    // headless: false,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.amazon.com/s?k=cup+of+tea&crid=26OEX7IOUOB6H&sprefix=cup+of+%2Caps%2C344&ref=nb_sb_noss_2",
    {
      waitUntil: "load",
    }
  );
  const pagesItemsPromises:Promise<[string, string, string][]>[] = [];

  let hasNextPage: boolean = await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled') === null;;
  while (hasNextPage) {
    console.log(pagesItemsPromises.length)
    await page.waitForSelector('.s-pagination-item.s-pagination-next')
    hasNextPage = await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled') === null;;

    await addProducts(page, pagesItemsPromises);

    if (hasNextPage) await page.click('.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator')
  }

  const pages = await Promise.all(pagesItemsPromises)
  
  const allItems = pages.flat(1)
  console.log(allItems.length)
  console.log(pages.length)

  
  const folderPath = path.resolve(__dirname, '../output')
  const filePath = path.resolve(__dirname, '../output/result.html')
  if (!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath);
  }
  fs.closeSync(fs.openSync(filePath, 'w'))

  const file = fs.createWriteStream(filePath)
  file.on("error", (err) => {console.log(err)});
  file.write(
    "<table><tr><td>title</td><td>price</td><td>image</td></tr>\n",
    (err) => console.log(err)
  );
  allItems.forEach((v) => {
    file.write("<tr><td>"+v.join("</td><td>") + "</tr>\n");
  });
  file.write(
    "</table>\n",
  );
  file.end();

  

  await browser.close();
  console.log("done!");
  const end = new Date().getTime();
  const time = end - start;
  console.log(`Execution time: ${time}ms`);
};

export default scrapeAllPages;