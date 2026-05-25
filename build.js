const process = require("process");
const child_process = require("child_process");
const fs = require("fs");
const fse = require("fs-extra");

const vscodeVersion = "1.121.0";

if (!fs.existsSync("vscode")) {
  child_process.execSync(`git clone --depth 1 https://github.com/microsoft/vscode.git -b ${vscodeVersion}`, {
    stdio: "inherit",
  });
}
process.chdir("vscode");

const env = {
  ...process.env,
  ELECTRON_SKIP_BINARY_DOWNLOAD: 1,
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: 1,
  VSCODE_SKIP_NODE_VERSION_CHECK: 1,
};

if (!fs.existsSync("node_modules")) {
  child_process.execSync("npm ci", { stdio: "inherit", env });
}
// Use simple workbench
fs.copyFileSync(
  "../workbench.ts",
  "src/vs/code/browser/workbench/workbench.ts"
);

// Compile
child_process.execSync("node --experimental-strip-types --max-old-space-size=4096 ./node_modules/gulp/bin/gulp.js vscode-web-min", { stdio: "inherit", env });

// Extract compiled files
if (fs.existsSync("../dist")) {
  fs.rmdirSync("../dist", { recursive: true });
}
fs.mkdirSync("../dist");
fse.copySync("../vscode-web", "../dist");


