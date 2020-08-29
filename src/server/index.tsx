import Specter from '@specter/specter'
import bodyParser from 'body-parser'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import path from 'path'
import App from '../client/App'
import { UserService } from '../domains/user'

const app = express()

Specter.registerService(new UserService({}))

app.use('/public', express.static(path.resolve('dist')))
app.use(bodyParser.json())
app.use('/xhr', Specter.createMiddleware({}))

app.get('/', (_, res) => {
  const result = renderToString(<App />)
  res.send(`
    <html>
      <head></head>
      <body>
        <div id="root">${result}</div>
        <script src="/public/main.js"></script>
      </body>
    </html>
  `)
})

app.listen(3000, () => console.log('🚀 http://localhost:3000'))
