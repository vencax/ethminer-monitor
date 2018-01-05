# ethminer-monitor

Sits and waints for ethminer output.
Parses and waits for succesfull block submission messages.
If it does not come in time, mail is sent to admin with last 100 lines of log.

## Configuration

Config is performed through few environment variables with obvious meaning:

- SMTP_CONN: connection for email sending (e.g. smtps://gandalf%40gmail.com:secretpwd@smtp.gmail.com)
- ADMIN_EMAIL: email where to send error notifications
- OVERCLOCK_CORE: aditional megahertz (e.g. 500 = 500 more Mhz to the core freq)
- OVERCLOCK_MEM: similar to OVERCLOCK_CORE
- OVERCLOCK_POWERLIMIT: in watts
- OVERCLOCK_FAN_PERCENT: percent of fan rpms
