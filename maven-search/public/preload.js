const { searchList, searchVersionList } = require("./api");

let versionHtml = null;
let searchResult = [];
let searchCallback;

const search = async (action, searchWord, callbackSetList) => {
  searchCallback = callbackSetList;
  searchResult = await searchList(searchWord);
  // console.log(list);
  versionHtml = null;
  callbackSetList(searchResult);
};

const select = async (action, itemData, callbackSetList, mode = "maven") => {
  if (!versionHtml) {
    // 未选择
    const pos = itemData.value.split(":");
    const list = await searchVersionList(pos[0], pos[1]);
    processStatus = 1;
    versionHtml = list.html;
    searchCallback(list.items);
  } else {
    const value = mode === "maven" ? mode : "gradle";
    let texts = versionHtml.querySelector(
      `div[data-tab="${itemData.title}-${value}"]>textarea`
    ).textContent;
    let text = texts.trim();
    if (mode === "maven") {
      // debugger;
      texts = texts
        .replace(/\n/g, "&&&")
        .trim()
        .replace(/\s+/g, "")
        .split("&&&");
      text = texts
        .map((item, index) => {
          if (index !== 0 && index !== texts.length - 1) {
            return "    " + item;
          }
          return item;
        })
        .join("\n");
    } else {
      const addr = text.split(" ")[1].replace(/\'/g, "");
      if (mode === "kotlin") {
        text = `implementation("${addr}")`;
      }
    }
    rubick.copyText(text);
    rubick.outPlugin();
    rubick.hideMainWindow();
  }
};

window.exports = {
  maven: {
    mode: "list",
    args: {
      // 搜索调用
      search: search,
      // 选择调用
      select: async (action, itemData) => {
        await select(action, itemData, searchResult, "maven");
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "在此输入搜索内容",
    },
  },
  gradle: {
    mode: "list",
    args: {
      // 搜索调用
      search: search,
      select: async (action, itemData) => {
        await select(action, itemData, searchResult, "gradle");
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "在此输入搜索内容",
    },
  },
  kotlin: {
    mode: "list",
    args: {
      // 搜索调用
      search: search,
      select: async (action, itemData) => {
        await select(action, itemData, searchResult, "kotlin");
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "在此输入搜索内容",
    },
  },
};
