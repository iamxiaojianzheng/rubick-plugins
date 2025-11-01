const crypto = require("crypto");
const debounce = require("./lodash.debounce");
const { hideElement, showElement, isEmpty, isNotEmpty } = require("./utils");
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

  // console.log(sign_str);
  // query_data['sign'] = sign_str[:16]
  query_data["signature"] = sign_str;

  fetch(base_url + "?" + objectToQueryString(query_data))
    .then((b) => b.json())
    .then((res) => {
      // console.log(res);
      parseContent(res);
      showApp();
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
    word_name,
  } = res.message;
  resetAppDoc();

  if (isNotEmpty(word_name)) {
    unknow(word_name, baseInfo);
  }

  parseBaseInfo(baseInfo);
  parseSynonym(synonym);
  parseNewSentence(new_sentence);
  parseCetFour(cetFour);
  parseCetSix(cetSix);
}

function resetAppDoc() {
  document.getElementById("app").innerHTML = `
      <div class="baseInfo">
        <div class="word-name"></div>
        <div class="word-tags"></div>
        <div class="symbols">
          <div class="symbols-en">
            <span>英</span>
            <span class="symbols-ph"></span>
            <img id="symbols-audio-img" src="https://picx.zhimg.com/v2-092cd5aeb5ef3861a2c952a6b4a2406f.png"></img>
            <audio id="symbols-audio" />
          </div>
          <div class="symbols-am">
            <span>美</span>
            <span class="symbols-ph"></span>
            <img id="symbols-audio-img" src="https://picx.zhimg.com/v2-092cd5aeb5ef3861a2c952a6b4a2406f.png"></img>
            <audio id="symbols-audio" />
          </div>
          <div class="symbols-other">
            <span> </span>
            <span class="symbols-ph"></span>
            <img id="symbols-audio-img" src="https://picx.zhimg.com/v2-092cd5aeb5ef3861a2c952a6b4a2406f.png"></img>
            <audio id="symbols-audio" />
          </div>
        </div>
      </div>
      <div class="means">
        <div class="title divider">释义</div>
        <div class="content"></div>
      </div>
      <div class="exchange">
        <div class="title divider">词态变化</div>
        <div class="content"></div>
      </div>
      <div class="synonym">
        <div class="title divider">同义词</div>
        <div class="content"></div>
      </div>
      <div class="sentence-example"></div>
      <div class="ee-mean"></div>
      <div class="cet4"></div>
      <div class="cet6"></div>
`;
}

function unknow(word_name, baseInfo) {
  const wordNameEl = document.querySelector(".word-name");
  if (word_name.includes(" ")) {
    wordNameEl.style.fontSize = "14px";
  }
  wordNameEl.innerText = word_name;

  const { translate_result, translate_msg } = baseInfo;
  const meansEl = document.querySelector(".means .content");
  meansEl.innerHTML = `<div style="font-size: 16px;">${translate_result}</div>
  <div style="font-size: 12px; color: gray; margin-top: 10px">${translate_msg}</div>`;
  showElement(".means");
  return;
}

function parseBaseInfo(baseInfo) {
  const { word_name, symbols, word_tag, exchange, translate_type } = baseInfo;
  if (translate_type == 2) {
    hideElement(".symbols");
    return;
  }

  document.querySelector(".word-name").innerText = word_name;

  if (isNotEmpty(word_tag)) {
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
  }

  if (isNotEmpty(symbols)) {
    const symbolItem = symbols[0];
    const {
      ph_en,
      ph_am,
      ph_other,
      ph_en_mp3,
      ph_am_mp3,
      ph_other_pm3,
      parts,
    } = symbolItem;
    const symbolsEl = document.querySelector(".symbols");
    const symbolsEnEl = symbolsEl.querySelector(".symbols-en");
    if (ph_en) {
      symbolsEnEl.querySelector(".symbols-ph").innerText = ph_en;
      if (ph_en_mp3) {
        symbolsEnEl.querySelector("img").addEventListener("click", function () {
          const enAudioEl = symbolsEnEl.querySelector("audio");
          enAudioEl.src = ph_en_mp3;
          enAudioEl.oncanplaythrough = function () {
            enAudioEl.play();
          };
        });
      }
    } else {
      hideElement(symbolsEnEl);
    }
    const symbolsAmEl = symbolsEl.querySelector(".symbols-am");
    if (ph_am) {
      symbolsAmEl.querySelector(".symbols-ph").innerText = ph_am;
      if (ph_am_mp3) {
        symbolsAmEl.querySelector("img").addEventListener("click", function () {
          const amAudioEl = symbolsAmEl.querySelector("audio");
          amAudioEl.src = ph_am_mp3;
          amAudioEl.oncanplaythrough = function () {
            amAudioEl.play();
          };
        });
      }
    } else {
      hideElement(symbolsAmEl);
    }
    const symbolsOtherEl = symbolsEl.querySelector(".symbols-other");
    if (ph_other) {
      symbolsOtherEl.querySelector(".symbols-ph").innerText = ph_other;
      if (ph_other_pm3) {
        symbolsOtherEl
          .querySelector("img")
          .addEventListener("click", function () {
            const amAudioEl = symbolsOtherEl.querySelector("audio");
            amAudioEl.src = ph_other_mp3;
            amAudioEl.oncanplaythrough = function () {
              amAudioEl.play();
            };
          });
      }
    } else {
      hideElement(symbolsOtherEl);
    }

    parseMeans(parts);
  }

  parseExchange(exchange);
}

function parseMeans(parts) {
  if (isEmpty(parts)) {
    hideElement(".means");
  } else {
    showElement(".means");
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
  hideElement(".exchange");
  if (isNotEmpty(exchange)) {
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
    showElement(".exchange");
    if (isNotEmpty(itemIds)) {
      itemIds.forEach((itemId) => {
        document.getElementById(itemId).addEventListener("click", function (e) {
          rubick.setSubInputValue(e.target.innerText);
        });
      });
    }
  }
}

function parseSynonym(synonym) {
  document.querySelector(".synonym").style.display = "none";
  hideElement(".synonym");
  if (isNotEmpty(synonym)) {
    let rootDiv = "";
    const synonymEl = document.querySelector(".synonym .content");
    const ciIds = [];
    for (const item of synonym) {
      const { part_name, means } = item;
      for (const mean of means) {
        const { word_mean, cis } = mean;
        rootDiv += `<div class="word-mean">${part_name} ${word_mean}</div>`;
        if (isNotEmpty(cis)) {
          rootDiv += `<div class="ci">`;
          for (const w of cis) {
            const id = `ci-${w}`;
            ciIds.push(id);
            rootDiv += `<span id="${id}" class="ci-item">${w}</span>`;
          }
          rootDiv += "</div>";
        }
      }
    }

    synonymEl.innerHTML = rootDiv;
    if (isNotEmpty(ciIds)) {
      ciIds.forEach((itemId) => {
        document.getElementById(itemId).addEventListener("click", function (e) {
          rubick.setSubInputValue(e.target.innerText);
        });
      });
    }

    showElement(".synonym");
  }
}

function parseNewSentence(new_sentence) {
  hideElement(".sentence-example");
  if (isNotEmpty(new_sentence)) {
    showElement(".sentence-example");
  }
}

function parseCetFour(cetFour) {
  document.querySelector(".cet4").style.display = "none";
  if (isNotEmpty(cetFour)) {
    document.querySelector(".cet4").style.display = "block";
  }
}

function parseCetSix(cetSix) {
  document.querySelector(".cet6").style.display = "none";
  if (isNotEmpty(cetSix)) {
    document.querySelector(".cet6").style.display = "block";
  }
}
