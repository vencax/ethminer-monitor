const readline = require('readline')
const { spawn } = require('child_process')
const path = require('path')
const overclocking = require('./overclock')
const submissionInterval = parseInt(process.env.SUBMISSION_INTERVAL) || 60

const state = {}
let tOut = null
let miningProcess = null

exports.run = (sendError) => {
  //
  const pars = [
    '-G',
    '-F', process.env.POOLADDRESS,
    '--farm-recheck', '2000',
    '-v', '10'
  ]
  const cmd = `${pars.join(' ')}`
  function _run () {
    console.log('running: ' + cmd)
    miningProcess = spawn(path.join(__dirname, 'ethminer'), pars)
    miningProcess.on('error', (err) => {
      console.log(err)
    })
    miningProcess.stdout.pipe(process.stdout)
    miningProcess.stderr.pipe(process.stderr)
    const rl = readline.createInterface(miningProcess.stderr)

    rl.on('line', function (line) {
      const match = line.match(/([0-9]{1,}.[0-9]{1,})MH\/s/)
      if (match) {
        state.speed = match[1]
      }
      if (line.indexOf('Submitted and accepted')) {
        state.status = 'OK'
        if (tOut) {
          clearTimeout(tOut)
        }
        tOut = setTimeout(() => {
          state.status = 'FAILED'
          sendError(JSON.stringify(state))
          console.log('killing')
          miningProcess.kill()
          overclocking.overclock({  // reset freqs
            core: 0,
            mem: 0
          })
          _run()
        }, submissionInterval * 1000)
      }
    })
  }

  overclocking.overclock({
    core: process.env.OVERCLOCK_CORE,
    mem: process.env.OVERCLOCK_MEM,
    powerlimit: process.env.OVERCLOCK_POWERLIMIT
  })
  _run()
}

exports.statusHandler = (req, res, next) => {
  res.json(state)
  next()
}
