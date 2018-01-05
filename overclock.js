const { exec } = require('child_process')
const settingsApp = 'DISPLAY=:0 XAUTHORITY=/var/run/lightdm/root/:0 nvidia-settings'
const numGPUS = Number(process.env.GPUCOUNT) || 1

function runSettingsApp (cmd, done) {
  const _cmd = settingsApp + ' -a ' + cmd
  console.log(cmd)
  exec(_cmd, (error, stdout, stderr) => {
    if (error) {
      return console.log(error)
    }
  })
}

exports.overclock = (opts) => {
  let cmd = `nvidia-smi -pm 0`
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return console.log(error)
    }
    cmd = `nvidia-smi -pl ${opts.powerlimit}`
    opts.powerlimit && exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return console.log(error)
      }
    })
    if (opts.core) {
      for (let i = 0; i < numGPUS; i++) {
        runSettingsApp(`[gpu:${i}]/GPUGraphicsClockOffset[3]=${opts.core}`)
      }
    }
    if (opts.mem) {
      for (let i = 0; i < numGPUS; i++) {
        runSettingsApp(`[gpu:${i}]/GPUMemoryTransferRateOffset[3]=${opts.mem}`)
      }
    }
    if (opts.fan) {
      for (let i = 0; i < numGPUS; i++) {
        runSettingsApp(`[gpu:${i}]/GPUFanControlState=1`)
        runSettingsApp(`[fan:${i}]/GPUTargetFanSpeed=${opts.fan}`)
      }
    }
  })
}
