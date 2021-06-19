const oldConsole = console

global.console = {
  debug(data, ...args) {
    oldConsole.log('log:', data, ...args)

    oldConsole.debug(data, ...args)
  },
  error(data, ...args) {
    oldConsole.log('error:', data, ...args)

    oldConsole.error(data, ...args)
  },
  log(data, ...args) {
    oldConsole.log('log:', data, ...args)

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
