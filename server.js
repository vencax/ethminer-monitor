require('dotenv').config()
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const net = require('net')

const port = process.env.PORT || 30000
const host = process.env.HOST || '127.0.0.1'

const transporter = nodemailer.createTransport(smtpTransport(process.env.SMTP_CONN))

// verify connection configuration
console.log(`verifying STMP (${process.env.SMTP_CONN}) ...`)
transporter.verify()
.then(() => {
  const Handler = require('./index')(transporter)
  const server = net.createServer(Handler)
  return server.listen(port, host)
})
.then(() => {
  console.log(`Thorin listens for his army on: ${host}:${port}`)
})
.catch((err) => {
  console.log(err)
})
