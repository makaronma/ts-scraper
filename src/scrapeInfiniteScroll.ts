import puppeteer from 'puppeteer'

const scroll = async function (page: puppeteer.Page) {
  let items = [];
  let count = 0;
  try {
    while (count < 10) {
      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });
      count++;
      await page.waitForTimeout(1000);
    }
  } catch (e) {}
  return items;
};


const scrapeInfiniteScroll = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  await page.goto("https://channelchk.com/");

  await scroll(page);

  // await browser.close();
};

export default scrapeInfiniteScroll