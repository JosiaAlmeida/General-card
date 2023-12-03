const data = require('./../resources/data.json')
const querystring = require('querystring') //Nativo do nodejs
const { join } = require('path')
const { v1 } = require("uuid")
const { Cluster } = require('puppeteer-cluster')

const BASE_URL = "https://erickwendel.github.io/business-card-template/index.html"

//Converter um objeto em string
function createQueryStringObject(data) {
  const separator = null, keyDelimiter = null, options = {
    encodeURIComponent: querystring.unescape
  }
  const qs = querystring.stringify(data, separator, keyDelimiter, options)
  return qs
}

async function render({ page, data: { finalURI, name } }) {
  const output = join(__dirname, `./../output/${name}${v1()}.pdf`)
  await page.goto(finalURI, { waitUntil: 'networkidle2' })
  await page.pdf({
    path: output,
    format: 'A4',
    landscape: true,
    printBackground: true
  })
  console.log("ended", output);
}

const main = async () => {
  const pid = process.pid //Retorna o valor do processo 

  try {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 10
    })
    await cluster.task(render)

    for (const item of data) {
      const qs = createQueryStringObject(item)
      const finalURI = `${BASE_URL}?${qs}`
      await cluster.queue({ finalURI, name: item.name })
    }
    await cluster.idle()
    await cluster.close()
  } catch (error) {
    console.error(`${pid} Process brock`);
  }

}

main()