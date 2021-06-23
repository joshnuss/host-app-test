import express from 'express'
import { metrics, host } from './host.js'

const app = express()

host.express(app, () => {

  app.get('/', (req, res) => {
    metrics.increment('request.count')

    console.log('this is really cool')
    console.log('this is extremely cool')
    console.log('ohai', {a: 1, b: 2})

    //throw new Error('whoops')

    res.status(200).end('hello world')
  })

})

app.listen(3001)
