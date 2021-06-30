// TODO: add dashboard with ws in dev mode: analytics, errors, metrics, logs, uptime/ping
// TODO: add context data/breadcrumbs
// TODO: add more stats types to measure
// TODO: support more console features
// TODO: add an admin using tailwindui
// TODO: add a backend with clickhouse
// TODO: support backround jobs
// TODO: remote server
// TODO: build ruby version
// TODO: add landing page with video or animation
// TODO: add docs page
import os from 'os'
import RequestIp from '@supercharge/request-ip'
import { exec } from 'child_process'
import { ClickHouse } from 'clickhouse'
import requestId from 'express-request-id'
import path from 'path'
import 'zone.js'

const clickhouse = new ClickHouse({basicAuth: {username: 'default', password: 'karamba'}, config: {database: 'hosting'}})
const hostname = os.hostname()
const environment = process.env.NODE_ENV || 'dev'
const client = 'node-0.1'
const language = 'javascript'
const app = path.basename(path.dirname(import.meta.url))
const oldConsole = console

let commit = ''

exec('git rev-parse HEAD', (err, stdout) => {
  if (!err) commit = stdout
})

const db = {
  async insertLog(type, message, args) {
    const req = Zone.current.req || {}
    const record = {
      type,
      message,
      host: hostname,
      commit,
      environment,
      app,
      client,
      language,
      ip: req.ip,
      request_id: req.id,
      data: JSON.stringify(args),
      timestamp: new Date()
    }

    await clickhouse
      .insert('INSERT INTO logs (request_id, type, timestamp, host, app, environment, client, language, ip, commit, message, data)', record)
      .toPromise()
  },

  async insertError(error) {
    const req = Zone.current.req || {}
    const stacktrace = error.stack.split("\n").splice(1).map(line => line.replace(/^\s+at /, ''))
    const record = {
      type: error.name,
      message: error.message,
      host: hostname,
      environment,
      app,
      commit,
      client,
      language,
      ip: req.ip,
      request_id: req.id,
      stacktrace,
      timestamp: new Date()
    }

    await clickhouse
      .insert('INSERT INTO errors (request_id, type, timestamp, host, app, environment, client, language, ip, commit, message, stacktrace)', record)
      .toPromise()
  },

  async insertRequest(req, statusCode) {
    const record = {
      id: req.id,
      url: req.url,
      host: hostname,
      headers: JSON.stringify(req.headers),
      status_code: statusCode,
      environment,
      app,
      client,
      language,
      commit,
      ip: req.parsed_ip,
      timestamp: new Date()
    }

    await clickhouse
      .insert('INSERT INTO requests (id, url, timestamp, host, app, environment, client, language, ip, headers, status_code, commit)', record)
      .toPromise()
  },

  async insertMetric(metric) {
    const req = Zone.current.req || {}
    const record = {
      type: metric.type,
      name: metric.name,
      tags: metric.tags || [],
      value: metric.value,
      host: hostname,
      environment,
      app,
      client,
      language,
      request_id: req.id,
      timestamp: new Date()
    }

    await clickhouse
      .insert('INSERT INTO metrics (request_id, name, type, timestamp, host, app, environment, client, language, value, tags)', record)
      .toPromise()
  },
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
  increment(name, value=1, options = {}) {
    db.insertMetric({name, type: 'counter', value, tags: options.tags})
  },

  decrement(name, value=1, options = {}) {
    db.insertMetric({name, type: 'counter', value: -value, tags: options.tags})
  }
}

function wrapWithZone(req, callback) {
  Zone.current.fork({name: req.id}).run(() => {
    Zone.current.req = {
      id: req.id,
      ip: req.parsed_ip,
      url: req.url
    }
    callback()
  })
}

export const host = {
  express(app, callback) {
    app.use(requestId())

    app.use((req, res, next) => {
      req.parsed_ip = RequestIp.getClientIp(req)
      const end = res.end
      res.end = function(chunk, encoding) {
        db.insertRequest(req, res.statusCode)

        end.bind(res)(chunk, encoding)
      }

      wrapWithZone(req, next)
    })

    app.get('/ping', (req, res) => {
      res.setHeader('content-type', 'text/plain')
      res.end('pong')
    })

    callback(app)

    app.use((error, req, res, next) => {
      wrapWithZone(req, () => {
        db.insertError(error)
        next(error)
      })
    })
  }
}
