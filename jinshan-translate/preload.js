const crypto = require("crypto");
const debounce = require("./lodash.debounce");
const utils = require("./utils");
const debounceTranslate = debounce(translate, 500);

rubick.onPluginReady(({ code, type, payload }) => {
  console.log("插件装配完成，已准备好");
  hideApp();
  if (payload && payload.length > 0) {
    window.location.reload();
    translate(payload);
  }
  rubick.setSubInputValue(payload);
});

rubick.setSubInput(({ text }) => {
  if (text && text.length > 0) {
    debounceTranslate(text);
  }
}, "请输入需要翻译的单词或短语");

function showApp() {
  document.getElementById("app").classList.remove("hiden");
  document.getElementById("app").classList.add("show");
  document.getElementById("app").style.visibility = "visible";
}

function hideApp() {
  document.getElementById("app").style.visibility = "hidden";
  document.getElementById("app").classList.remove("show");
  document.getElementById("app").classList.add("hide");
}

function translate(word) {
  base_url = "https://dict.iciba.com/dictionary/word/query/web";

  word = encodeURIComponent(word);

  query_data = {
    c: "trans",
    m: "fy",
    client: "6",
    auth_user: "key_web_fanyi",
    sign: "",
  };

  let ts = new Date().getTime();

  query_data = {
    client: "6",
    key: "1000006",
    timestamp: ts,
    word: word,
    signature: "",
  };

  const hashKey = "7ece94d9f9c202b0d2ec557dg4r9bc";
  const hashMessageBody = `61000006${ts}${word}`;
  const hashMessage = `/dictionary/word/query/web${hashMessageBody}${hashKey}`;

  sign_str = crypto.createHash("md5").update(hashMessage).digest("hex");

  console.log(sign_str);
  // query_data['sign'] = sign_str[:16]
  query_data["signature"] = sign_str;

  fetch(base_url + "?" + objectToQueryString(query_data))
    .then((b) => b.json())
    .then((res) => {
      console.log(res);
      parseContent(res);
      showApp();

      // let appEl = document.getElementById("app");
      // let html = ``;
      // if (baseInfo.symbols) {
      //   const { symbols, word_name } = baseInfo;
      //   html += `<h3>${word_name}</h3>`;
      //   let parts = symbols[0].parts;
      //
      //   for (var idx in parts) {
      //     const { part, means } = parts[idx];
      //     html += `<div>${part}<div>`;
      //     html += `<div>${means.join("; ")}<div>`;
      //   }
      // } else {
      //   const { translate_result, translate_msg } = baseInfo;
      //   html += `<h3>${message.word_name}</h3>`;
      //   html += `<div>${translate_result}<div>`;
      //   html += `<div class='gray'>${translate_msg}<div>`;
      // }
      //
      // appEl.innerHTML = html;
    })
    .catch((error) => console.error(error));
}

function objectToQueryString(obj) {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

function parseContent(res) {
  const {
    baesInfo: baseInfo,
    synonym,
    new_sentence,
    cetFour,
    cetSix,
  } = res.message;
  parseBaseInfo(baseInfo);
  parseSynonym(synonym);
  parseNewSentence(new_sentence);
  parseCetFour(cetFour);
  parseCetSix(cetSix);
}

function parseBaseInfo(baseInfo) {
  const { word_name, symbols, word_tag, exchange } = baseInfo;
  document.querySelector(".word-name").innerText = word_name;
  document.querySelector(".word-tags").innerText = word_tag
    .map((item) => {
      if (item == 0) return "考研";
      else if (item == 1) return "CET6";
      else if (item == 2) return "CET4";
      else if (item == 3) return "GRE";
      else if (item == 4) return "TOEFL";
      else if (item == 5) return "IELTS";
      else if (item == 6) return "高中";
      else return "";
    })
    .join("/");
  const symbolItem = symbols[0];
  const { ph_en, ph_am, ph_other, ph_en_mp3, ph_am_mp3, ph_other_pm3, parts } =
    symbolItem;
  const symbolsEl = document.querySelector(".symbols");
  const symbolsEnEl = symbolsEl.querySelector(".symbols-en");
  if (ph_en) {
    symbolsEnEl.querySelector(".symbols-ph").innerText = ph_en;
    symbolsEnEl.querySelector("img").addEventListener("click", function () {
      const enAudioEl = symbolsEnEl.querySelector("audio");
      enAudioEl.src = ph_en_mp3;
      enAudioEl.oncanplaythrough = function () {
        enAudioEl.play();
      };
    });
  } else {
    symbolsEnEl.style.display = "none";
  }
  const symbolsAmEl = symbolsEl.querySelector(".symbols-am");
  if (ph_am) {
    symbolsAmEl.querySelector(".symbols-ph").innerText = ph_am;
    symbolsAmEl.querySelector("img").addEventListener("click", function () {
      const amAudioEl = symbolsAmEl.querySelector("audio");
      amAudioEl.src = ph_am_mp3;
      amAudioEl.oncanplaythrough = function () {
        amAudioEl.play();
      };
    });
  } else {
    symbolsAmEl.style.display = "none";
  }

  parseMeans(parts);
  parseExchange(exchange);
}

function parseMeans(parts) {
  if (utils.isEmpty(parts)) {
    document.querySelector(".means").style.display = "none";
  } else {
    document.querySelector(".means").style.display = "block";
    let allPartsDiv = ``;
    const meansEl = document.querySelector(".means .content");
    for (const partItem of parts) {
      let partDiv = `<div class="part">`;
      const { part, means } = partItem;
      partDiv += `<i>${part}</i>`;
      partDiv += `<span>${means.join("; ")}</span>`;
      partDiv += `</div>`;
      allPartsDiv += partDiv;
    }
    meansEl.innerHTML = allPartsDiv;
  }
}

function parseExchange(exchange) {
  document.querySelector(".exchange").style.display = "none";
  if (utils.isNotEmpty(exchange)) {
    let allExchangeDiv = "";
    const exchangeEl = document.querySelector(".exchange .content");
    const itemIds = [];
    for (const item of Object.keys(exchange)) {
      let title = "";
      if (item === "word_pl") title = "复数";
      else if (item === "word_third") title = "第三人称单数";
      else if (item === "word_past") title = "过去式";
      else if (item === "word_done") title = "过去分词";
      else if (item === "word_ing") title = "现在分词";
      title += ": ";

      const words = exchange[item];
      let itemDiv = `<div class="item">`;
      itemDiv += `<span>${title}</span>`;
      const wordsLen = words.length;
      for (let index = 0; index < wordsLen; index++) {
        const word = words[index];
        const wordId = `exchange-${word}`;
        itemIds.push(wordId);
        itemDiv += `<span id=${wordId}>`;
        if (index === words.length - 1) {
          itemDiv += `${word}</span>;`;
        } else if (wordsLen === 1) {
          itemDiv += `${word}</span>`;
        } else {
          itemDiv += `${word}</span>、`;
        }
        // itemDiv += "</span>";
      }
      itemDiv += `</div>`;
      allExchangeDiv += itemDiv;
    }
    exchangeEl.innerHTML = allExchangeDiv;
    document.querySelector(".exchange").style.display = "block";
    if (utils.isNotEmpty(itemIds)) {
      itemIds.forEach((itemId) => {
        const itemEl = document.getElementById(itemId);
        itemEl.addEventListener("click", function () {
          rubick.setSubInputValue(itemEl.innerText);
        });
      });
    }
  }
}

function parseSynonym(synonym) {
  document.querySelector(".synonym").style.display = "none";
  if (utils.isNotEmpty(synonym)) {
    let rootDiv = "";
    const synonymEl = document.querySelector(".synonym .content");
    for (const item of synonym) {
      const { part_name, means } = item;
      for (const mean of means) {
        const { word_mean, cis } = mean;
        rootDiv += `<div class="word-mean">${part_name} ${word_mean}</div>`;
        if (utils.isNotEmpty(cis)) {
          rootDiv += `<div class="ci">`;
          for (const w of cis) {
            rootDiv += `<span class="ci-item">${w}</span>`;
          }
          rootDiv += "</div>";
        }
      }
    }
    synonymEl.innerHTML = rootDiv;
    document.querySelector(".synonym").style.display = "block";
  }
}

function parseNewSentence(new_sentence) {
  document.querySelector(".sentence-example").style.display = "none";
  if (utils.isNotEmpty(new_sentence)) {
    document.querySelector(".sentence-example").style.display = "block";
  }
}

function parseCetFour(cetFour) {
  document.querySelector(".cet4").style.display = "none";
  if (utils.isNotEmpty(cetFour)) {
    document.querySelector(".cet4").style.display = "block";
  }
}

function parseCetSix(cetSix) {
  document.querySelector(".cet6").style.display = "none";
  if (utils.isNotEmpty(cetSix)) {
    document.querySelector(".cet6").style.display = "block";
  }
}
