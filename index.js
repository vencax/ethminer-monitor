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
  const farmRecheck = process.env.FARMRECHECK || 2000
  const pars = [
    '-G',
    '-F', process.env.POOLADDRESS,
    '--farm-recheck', farmRecheck,
    '-v', '10'
  ]
  if (process.env.BACKUP_POOLADDRESS) {
    pars.push('-FS')
    pars.push(process.env.BACKUP_POOLADDRESS)
  }  
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
    let wasPositive = false

    rl.on('line', function (line) {
      const match = line.match(/([0-9]{1,}.[0-9]{1,})MH\/s/)
      if (match) {
        state.speed = parseFloat(match[1])
        console.log(JSON.stringify(state))
        if (state.speed > 0.1) {
          wasPositive = true
          state.status = 'OK'
        }
        if (state.speed < 0.1 && wasPositive) {
          state.status = 'FAILED'
          console.log('killing mining process...')
          miningProcess.kill()
          overclocking.overclock({  // reset freqs
            core: 0,
            mem: 0
          })
          setTimeout(() => _run(), 10000) // wait 10s
          sendError(JSON.stringify(state))
        }
      }
    })
  }

  overclocking.overclock({
    core: process.env.OVERCLOCK_CORE,
    mem: process.env.OVERCLOCK_MEM,
    powerlimit: process.env.OVERCLOCK_POWERLIMIT,
    fan: process.env.OVERCLOCK_FAN_PERCENT
  })
  _run()
}

exports.statusHandler = (req, res, next) => {
  res.json(state)
  next()
}
