// TODO: add dashboard with ws in dev mode: analytics, trace, errors, metrics, logs
// TODO: add context data/breadcrumbs
// TODO: add more stats types to measure
// TODO: call clickhouse: +logs, -errors, -metrics, -requests
import os from 'os'
import RequestIp from '@supercharge/request-ip'
import { exec } from 'child_process'
import { ClickHouse } from 'clickhouse'
import requestId from 'express-request-id'
import 'zone.js'

const client = new ClickHouse({basicAuth: {username: 'default', password: 'karamba'}, config: {database: 'hosting'}})
const hostname = os.hostname()
const oldConsole = console

let commit = ''

exec('git rev-parse HEAD', (err, stdout) => {
  if (!err) commit = stdout
})

const db = {
  async insertLog(type, message, args) {
    const req = Zone.current.req
    const record = {
      type,
      message,
      host: hostname,
      commit,
      ip: req.ip,
      request_id: req.id,
      data: JSON.stringify(args),
      timestamp: new Date()
    }

    await client
      .insert('INSERT INTO logs (request_id, type, timestamp, host, ip, commit, message, data)', record)
      .toPromise()
  }
}

global.console = {
  debug(data, ...args) {
    db.insertLog('debug', data, args)

    oldConsole.debug(data, ...args)
  },
  error(data, ...args) {
    db.insertLog('error', data, args)

    oldConsole.error(data, ...args)
  },
  log(data, ...args) {
    db.insertLog('info', data, args)

    oldConsole.log(data, ...args)
  },
  clear() {
    oldConsole.clear()
  }
}

export const metrics = {
  increment(metric, by=1) {
    oldConsole.log(`dec:${metric}.${by}`)
  },

  decrement(metric, by=1) {
    oldConsole.log(`inc:${metric}.${by}`)
  }
}

export const host = {
  express(app, callback) {
    app.use(requestId())

    app.use((req, res, next) => {
      Zone.current.fork({name: req.id}).run(() => {
        Zone.current.req = {
          id: req.id,
          ip: RequestIp.getClientIp(req),
          url: req.url
        }

        next()
      })
    })

    app.get('/ping', (req, res) => {
      res.setHeader('content-type', 'text/plain')
      res.end('pong')
    })

    callback(app)

    app.use((error, req, res, next) => {
      console.error('caught!')
      next(error)
    })
  }
}
