"use strict";
const path = require("path");
const fs = require("fs/promises");
const fs$1 = require("fs");
async function find(rootPath, includeFile, exclude) {
  if (exclude == null ? void 0 : exclude.test(rootPath))
    return [];
  const root = await fs.stat(rootPath).catch(() => null);
  if (!root)
    return [];
  if (root.isFile() && includeFile.test(rootPath))
    return [rootPath];
  if (root.isDirectory()) {
    const files = [];
    const dirFiles = await fs.readdir(rootPath);
    for (let it of dirFiles) {
      const childrens = await find(path.join(rootPath, it), includeFile, exclude);
      files.push(...childrens);
    }
    return files;
  } else {
    return [];
  }
}
const imageReg = /\.(png|jpeg|jpg|webp)$/i;
const excludeDirReg = /^(\.|node_modules)/i;
window.preload = window.preload || {};
const tempPath = path.join(utools.getPath("temp"), "utools.tinypng");
async function handlePluginEnter({ code, type, payload }) {
  try {
    console.log("tempPath: ", tempPath);
    console.log("code, type, payload: ", code, type, payload);
    const stat = await fs.stat(tempPath).catch(() => null);
    if (!(stat == null ? void 0 : stat.isDirectory()))
      await fs.mkdir(tempPath, { recursive: true });
    const date = Date.now();
    const config = {
      date,
      images: [],
      tempdir: path.join(tempPath, String(date))
    };
    const paths = [];
    if (["files", "drop"].includes(type)) {
      paths.push(...payload.filter((it) => it.path).map((it) => it.path));
    } else if (type === "window") {
      const curentDir = await utools.readCurrentFolderPath().catch(() => null);
      if (curentDir)
        paths.push(curentDir);
    }
    for (const it of paths) {
      if (excludeDirReg.test(it))
        continue;
      const fileType = await fs.stat(it).catch(() => null);
      const images = [];
      let basedir = "";
      if (fileType == null ? void 0 : fileType.isFile()) {
        if (!imageReg.test(it))
          continue;
        images.push(it);
        basedir = path.dirname(it);
      } else if (fileType == null ? void 0 : fileType.isDirectory()) {
        basedir = path.dirname(it);
        images.push(...await find(it, imageReg, excludeDirReg));
      }
      for (const img of images) {
        const name = img.replace(basedir, "").replace(path.sep, "");
        const nameExist = config.images.some((it2) => it2.name === name);
        if (nameExist) {
          utools.showNotification(`此文件名已被占用：“${name}” 跳过处理`);
          continue;
        }
        config.images.push({
          name,
          path: img,
          size: (await fs.stat(img)).size,
          compress: { path: path.join(config.tempdir, name), progress: 0 }
        });
      }
    }
    if (config.images.length === 0)
      return;
    window.dispatchEvent(new CustomEvent("tinyping-compression", { detail: config }));
  } catch (error) {
    utools.showNotification(String(error));
  }
}
utools.onPluginEnter(handlePluginEnter);
utools.onPluginOut(async (exit) => {
  if (!exit)
    return;
  const dir = await fs.readdir(tempPath);
  for (const name of dir) {
    const file = path.join(tempPath, name);
    const stat = await fs.stat(file);
    stat.isFile() ? await fs.unlink(file) : await fs.rmdir(file, { recursive: true });
  }
});
function readFile(p) {
  return fs.readFile(p);
}
async function writeFile(p, data) {
  const dir = path.dirname(p);
  const stat = await fs.stat(dir).catch(() => null);
  if (!(stat == null ? void 0 : stat.isDirectory()))
    await fs.mkdir(dir, { recursive: true });
  return fs.writeFile(p, Buffer.from(data), "binary");
}
async function readDir(p) {
  const files = await fs.readdir(p);
  return files.map((it) => path.join(p, it));
}
async function replaceFiles(files) {
  for (const [from, to] of files) {
    await new Promise((res, rej) => fs$1.createReadStream(from).pipe(fs$1.createWriteStream(to)).on("close", res).on("error", rej));
  }
}
Object.assign(window.preload, { handlePluginEnter, readFile, writeFile, readDir, replaceFiles });
