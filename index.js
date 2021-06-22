const express = require("express");
const request = require("request-promise")

const app = express()
const port = 3000
const rss_prefix = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <atom:link href="https://mangadex.jmir.xyz/rss" rel="self" type="application/rss+xml" />
    <title>Newest Mangadex releases</title>
    <link>https://mangadex.org/</link>
    <description>The latest updates on Mangadex.org</description>
    <copyright>Copyright bofa</copyright>
    <language>en-US</language>
    <ttl>60</ttl>
    <lastBuildDate>` + Date().toString("en-US") + `</lastBuildDate>
    `
const rss_suffix = `</channel>
</rss>`
app.get("/", (req, res) => {
    res.send("joe who?")
})
app.get("/rss", (req, res) => {
    rss(res)
})
async function latestapi() {
    const options = {
        uri: "https://api.mangadex.org/manga",
        qs: {
            "order[updatedAt]": "desc", // -> uri + '?order[updatedAt]=desc'
            "limit": 20
        },
        //headers: {
        //    'User-Agent': 'Request-Promise'
        //},
        json: true // Automatically parses the JSON string in the response
    };
    
    const resp = await request(options)
    var item = ""
    for (manga in resp.results) {
        item += `<item>
        <title>`
        item += resp.results[manga].data.attributes.title.en + `</title>
        <description>`
        let desc = resp.results[manga].data.attributes.description
        let lang = desc.en != undefined ? desc.en : desc[Object.keys(desc)[0]]
        item += lang.substr(0, lang.indexOf("[hr]")>0?lang.indexOf("[hr]"):lang.length) + `</description>
        <link>`
        item += "https://mangadex.org/title/" + resp.results[manga].data.id + `</link>
        <pubDate>`
        item += resp.results[manga].data.attributes.updatedAt + `</pubDate>
      </item>
        `
    }
    return item
}
async function rss(res) {
    const latest = await latestapi()
    res.contentType("application/rss+xml").send(rss_prefix + latest + rss_suffix)
      
}
app.listen(port)
console.log("listening on port", port)