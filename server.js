require('dotenv').config()
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const express = require('express')
const App = require('./index')

const port = process.env.PORT || 30000
const host = process.env.HOST || '0.0.0.0'

const transporter = nodemailer.createTransport(smtpTransport(process.env.SMTP_CONN))

function sendError (status) {
  transporter.sendMail({
    from: process.env.MONITOR_NAME || 'etherminermonitor@localhost',
    to: process.env.ADMIN_EMAIL,
    subject: 'MINER ERROR!!!',
    text: 'MINER ERROR! \n' + status
  })
}

// verify connection configuration
console.log(`verifying STMP (${process.env.SMTP_CONN}) ...`)
transporter.verify()
.then(() => {
  const api = express()
  api.get('/', App.statusHandler)
  return api.listen(port, host)
})
.then(() => {
  console.log(`Thorin listens for his army on: ${host}:${port}`)
  App.run(sendError)
})
.catch((err) => {
  console.log(err)
})
