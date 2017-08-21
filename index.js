const readline = require('readline')
const submissionInterval = parseInt(process.env.SUBMISSION_INTERVAL) || 60

const state = {}
let tOut = null
const buff = []

module.exports = (transporter) => (client) => {
  //
  function sendError () {
    transporter.sendMail({
      from: process.env.MONITOR_NAME || 'etherminermonitor@localhost',
      to: process.env.ADMIN_EMAIL,
      subject: 'MINER ERROR!!!',
      text: 'MINER ERROR! \n' + buff.join('\n')
    })
  }

  function add3buff (line) {
    buff.push(line)
    if (buff.length > 100) {
      buff.shift()
    }
  }

  var rl = readline.createInterface(client, client)

  rl.on('line', function (line) {
    add3buff(line)
    // process.env.NODE_ENV.indexOf('production') >= 0 && console.log(line)
    if (line.indexOf('Submitted and accepted')) {
      state.status = 'OK'
      if (tOut) {
        clearTimeout(tOut)
      }
      tOut = setTimeout(() => {
        state.status = 'FAILED'
        sendError()
        console.log('Switching to error mode')
      }, submissionInterval * 1000)
    }
  })
  //
}
