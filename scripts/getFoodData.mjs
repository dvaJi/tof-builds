import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "..", "_content", "data");

async function main() {
  const res = await fetch("https://toweroffantasy.info/food", {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
    },
  });
  const data = await res.text();
  const dom = new JSDOM(data);
  const charsEl = dom.window.document.querySelectorAll(
    "div.middle > main > section > table > tbody > tr"
  );

  const rows = [];

  charsEl.forEach((val) => {
    const imgCol = val.querySelector("th");
    const effectCol = val.querySelector("td.col-effect");
    const recipeCol = val.querySelector("td.col-recipe");
    const imgSrc = imgCol
      .querySelector("div > img")
      .getAttribute("src")
      .replace("/static/images/food/dishes/", "");
    const recipe = [];

    recipeCol.querySelectorAll("ul > li").forEach((el) => {
      const recipeImg = el.querySelector("div > img");
      const recipeSrc = recipeImg
        .getAttribute("src")
        .replace("/static/images/food/ingredients/", "");

      recipe.push({
        name: recipeImg.getAttribute("alt"),
        rarity: imgCol
          .querySelector("div")
          .getAttribute("class")
          .replace(/.*rarity-(\d)/, "$1"),
        uri: recipeSrc.replace(".webp", ""),
        imgSrc: recipeSrc,
        amount: Number(el.querySelector("div > h3").textContent),
      });
    });

    rows.push({
      name: imgCol.querySelector("span").textContent,
      uri: imgSrc.replace(".webp", ""),
      imgSrc,
      rarity: imgCol
        .querySelector("div")
        .getAttribute("class")
        .replace(/.*rarity-(\d)/, "$1"),
      chinaOnly: !!imgCol.querySelector("div > abbr"),
      effect: effectCol
        .querySelector("p")
        .innerHTML.replaceAll("<strong>", "**")
        .replaceAll("</strong>", "**")
        .replaceAll("<!-- -->", "")
        .replace("<br>", "")
        .trim(),
      recipe,
    });
  });

  console.log("Getting mounts");
  for await (const row of rows) {
    const id = row.uri;
    console.log(`> ${id} (${rows.indexOf(row) + 1}/${rows.length})`);

    fs.writeFileSync(
      path.join(DATA_PATH, "food", id + ".json"),
      JSON.stringify(row, undefined, 2)
    );
  }
}

main();
