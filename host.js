// TODO: add dashboard with ws in dev mode: analytics, trace, errors, metrics, logs
// TODO: add context data
// TODO: add metadata: host name, request ip, git sha, timestamp
// TODO: add more stats types to measure
// TODO: call clickhouse
import { ClickHouse } from 'clickhouse'

const client = new ClickHouse({basicAuth: {username: 'default', password: 'karamba'}, config: {database: 'hosting'}})
const oldConsole = console

const db = {
  async insertLog(type, message, args) {
    const row = {type, message, json: JSON.stringify(args), timestamp: new Date()}

    await client
      .insert('INSERT INTO logs (type, timestamp, message, json)', row)
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
    app.use((req, res, next) => {
     console.log('request', req.url)
     next()
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
