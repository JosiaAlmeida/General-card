const data = require('./../resources/data.json')
const cp = require('child_process')
const modulePath = `${__dirname}/worker.js`; // Informando onde se encontra os worker

(async function main() {
  for (const item of data) {
    const worker = cp.fork(modulePath, []) //Pegando o module

    worker.on("message", msg => console.log("Message caught on parent", msg))
    worker.on("error", msg => console.log('Error caught on parent', msg))
    worker.send(item) // Agendando processos diferentes para os itens
  }
})()