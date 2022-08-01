import puppeteer from 'puppeteer'

// How to get the contents of each element of a nodelist?
// https://stackoverflow.com/questions/52827121/puppeteer-how-to-get-the-contents-of-each-element-of-a-nodelist

(async () => {
  const start = new Date().getTime();
  console.log("loading. . .");
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1700, height: 900 },
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();
  await page.goto("https://www.amazon.com/s?k=gaming+headsets&pd_rd_r=9e7adca8-c9e5-45bb-a261-cd9116aac938&pd_rd_w=YTbZv&pd_rd_wg=Apfom&pf_rd_p=12129333-2117-4490-9c17-6d31baf0582a&pf_rd_r=CB0QBX3XEN8AHDWV00B8&ref=pd_gw_unk");
  await page.screenshot({ path: "example.png" });

  const productsHandles = await page.$$("div.s-main-slot.s-result-list.s-search-results.sg-row > div");

  const items = await Promise.all(productsHandles.map((productHandle) => {
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

  items.forEach(item => console.log(item))

  await browser.close();
 
  console.log("done!");

  const end = new Date().getTime();
  const time = end - start;
  console.log(`Execution time: ${time}ms`);
})();