const fs = require("fs");
const path = require("path");
require("util").inspect.defaultOptions.depth = null;

function main() {
  const builds = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "builds.json"), "utf8")
  );

  for (const key in builds) {
    if (Object.hasOwnProperty.call(builds, key)) {
      const element = builds[key];

      for (const build of element) {
        build.sets = build.sets.map((s) => Object.values(s));
      }
    }
  }

  console.log(builds);

  // console.log(missingsObj)
  fs.writeFileSync(
    path.join(__dirname, "..", "data", "builds.json"),
    JSON.stringify(builds, null, 0)
  );
}

main();
