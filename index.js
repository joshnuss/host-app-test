import express from 'express'
import { metrics, host } from './host.js'

const app = express()

host.express(app, () => {

  app.get('/', (req, res) => {
    metrics.increment('request.count')

    console.log('ohai')

    // throw new Error('whoops')
    res.end('hello world')
  })

})

app.listen(3001)
