const fs = require("fs");
const path = ".env";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

lines.forEach((ln, i) => {
  if (!ln.trim() || ln.trim().startsWith("#")) return;

  if (!ln.includes("=")) {
    console.log("BAD(no =):", i + 1, ln);
    return;
  }

  const [, v] = ln.split("=", 2);

  // Unbalanced quotes
  if ((/^"[^"]*$/.test(v)) || (/^'[^']*$/.test(v))) {
    console.log("BAD(unbalanced quotes):", i + 1, ln);
  }

  // Broken ${...}
  if (v.includes("${") && !v.includes("}")) {
    console.log("BAD(${ without }):", i + 1, ln);
  }
});

console.log("Done checking .env");
