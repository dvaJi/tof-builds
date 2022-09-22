import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "_content", "data");

async function main() {
  const res = await fetch("https://toweroffantasy.info/relics");
  const data = await res.text();
  const dom = new JSDOM(data);
  const charsEl = dom.window.document.querySelectorAll(
    "main > section:nth-child(3) > menu > li > a,main > section:nth-child(4) > menu > li > a"
  );

  const links = [];

  charsEl.forEach((val) => {
    links.push(val.getAttribute("href"));
  });

  console.log("Getting relics");
  for await (const url of links) {
    console.log(`> ${url} (${links.indexOf(url) + 1}/${links.length})`);
    const id = url.replace("/relics/", "");
    const res = await fetch("https://toweroffantasy.info" + url);
    const data = await res.text();
    const dom = new JSDOM(data);

    const charData = JSON.parse(
      dom.window.document.querySelector("#__NEXT_DATA__").innerHTML
    );

    fs.writeFileSync(
      path.join(DATA_PATH, "relics", id + ".json"),
      JSON.stringify(charData.props.pageProps.relic, undefined, 2)
    );
  }
}

main();
