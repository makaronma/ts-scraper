import puppeteer from 'puppeteer'

const requestContinued: string[] = [];
const requestAborted: string[] = [];

const captureRequest = async () => {
  const browser = await puppeteer.launch({});
  try {
    const page = await browser.newPage();
    page.setRequestInterception(true);

    page.on("request", (request) => {
      const u = request.url();
      if (request.resourceType()==="script"||request.resourceType()==="stylesheet") {
        requestAborted.push(`${u.substring(0, 50)}...${u.substring(u.length - 5)}`)
        request.abort();
        return;
      }
      requestContinued.push(`${u.substring(0, 50)}...${u.substring(u.length - 5)}`)
      request.continue();
    });

    await page.goto("https://www.google.com/");
  } 
  catch (e) {console.log(e)}
  finally {
    await browser.close();
  }

  console.log("=================requestContinued=================")
  console.log(requestContinued)
  
  console.log("=================requestAborted=================")
  console.log(requestAborted)
}

export default captureRequest;