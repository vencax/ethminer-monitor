const readline = require('readline')
const { spawn } = require('child_process')
const path = require('path')
const overclocking = require('./overclock')
const submissionInterval = parseInt(process.env.SUBMISSION_INTERVAL) || 60

const state = {}
let tOut = null
let miningProcess = null

function _overClock () {
  overclocking.overclock({
    core: process.env.OVERCLOCK_CORE,
    mem: process.env.OVERCLOCK_MEM,
    powerlimit: process.env.OVERCLOCK_POWERLIMIT,
    fan: process.env.OVERCLOCK_FAN_PERCENT
  })
}

exports.run = (sendError) => {
  //
  const farmRecheck = process.env.FARMRECHECK || 2000
  let pars = [
    '-G',
    '-F', process.env.POOLADDRESS,
    '--farm-recheck', farmRecheck,
    '-v', '10'
  ]
  if (process.env.BACKUP_POOLADDRESS) {
    pars.push('-FS')
    pars.push(process.env.BACKUP_POOLADDRESS)
  }
  if (process.env.CREDENTIALS) {
    pars.push('-O')
    pars.push(process.env.CREDENTIALS)
  }
  pars = process.env.MINER_PARS ? process.env.MINER_PARS.split(' ') : pars
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
    let n = 0

    rl.on('line', function (line) {
      const match = line.match(/([0-9]{1,}.[0-9]{1,})MH\/s/)
      if (match) {
        state.speed = parseFloat(match[1])
        console.log(JSON.stringify(state))
        if (state.speed > 0.1) {
          n = 0
          state.status = 'OK'
        } else {
          n += 1
        }
        if (state.speed < 0.1 && n > 30) {
          state.status = 'FAILED'
          console.log('killing mining process...')
          miningProcess.kill()
          setTimeout(() => _run(), 10000) // wait 10s
          sendError(JSON.stringify(state))
        }
      }
    })
  }

  setTimeout(() => _overClock(), 5000)
  _run()
}

exports.statusHandler = (req, res, next) => {
  res.json(state)
  next()
}
