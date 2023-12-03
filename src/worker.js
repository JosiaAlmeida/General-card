const querystring = require('querystring') //Nativo do nodejs
const { join } = require('path')
const { v1 } = require("uuid")
const puppeteer = require('puppeteer')

const BASE_URL = "https://erickwendel.github.io/business-card-template/index.html"

//Converter um objeto em string
function createQueryStringObject(data) {
  const separator = null, keyDelimiter = null, options = {
    encodeURIComponent: querystring.unescape // Rmove todos os caracteres especiais
  }
  const qs = querystring.stringify(data, separator, keyDelimiter, options)
  return qs
}

async function render({ finalURI, name }) {
  const output = join(__dirname, `./../output/${name}${v1()}.pdf`)
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()
  await page.goto(finalURI, { waitUntil: 'networkidle2' })
  await page.pdf({
    path: output,
    format: 'A4',
    landscape: true,
    printBackground: true
  })
  await browser.close()
}

const main = async (message) => {
  const pid = process.pid //Retorna o valor do processo 
  // console.log(`${pid} got message! `, message.name);
  const qs = createQueryStringObject(message)
  const finalURI = `${BASE_URL}?${qs}`

  try {
    await render({ finalURI, name: message.name })
    process.send(`${pid} process finished`);
  } catch (error) {
    process.send(`${pid} Process brock`);
  }

}

process.once("message", main) //Executa uma única vez