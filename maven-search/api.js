async function searchList(searchWord) {
  return await fetch(`https://mvn.coderead.cn/search?keyword=${searchWord}`)
    .then((res) => res.json())
    .then((res) => {
      // console.log(res);
      if (!res.success) {
        return [];
      }
      return res.results.map((item) => {
        debugger;
        /'text'>(.*?)<\/span>.*description'>(.*?)<\/span>.*description'>(.*?)<\/span>/gm.test(
          item.name.replace(/\s+/g, "")
        );
        let title = RegExp.$1;
        let time = RegExp.$2;
        let description = RegExp.$3;
        title = title.replace(/<.?em>/g, "").trim();
        time = time.replace(/<.?em>/g, "").trim();
        description = description.replace(/<.?em>/g, "").trim() + "——" + time;
        // console.log(RegExp.$1);
        return {
          title,
          description,
          value: item.value,
        };
      });
    });
}

async function searchVersionList(groupId, artifactId) {
  return await fetch(
    `https://mvn.coderead.cn/version?groupId=${groupId}&artifactId=${artifactId}`
  )
    .then((res) => res.text())
    .then((res) => {
      const domParser = new DOMParser();
      const html = domParser.parseFromString(res, "text/html");
      const vHtmls = html.querySelectorAll('tr[onclick="doFold($(this))"]');
      const items = [];
      vHtmls.forEach((vHtml) => {
        const version = vHtml.querySelector("td:nth-child(1)").textContent;
        const downloadCount =
          vHtml.querySelector("td:nth-child(3)").textContent;
        const time = vHtml.querySelector("td:nth-child(4)").textContent;
        items.push({
          title: version,
          description: `下载量:${downloadCount}——发布时间${time}`,
        });
      });
      return {
        items,
        html,
      };
    });
}

module.exports = { searchList, searchVersionList };
