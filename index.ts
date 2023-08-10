import { createServer } from 'http'
import axios from 'axios'
import 'dotenv/config'
import { Stream } from 'stream'
import { createReadStream } from 'fs'

const request = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
})

createServer(async (req, res) => {
  const url = new URL(req.url!, 'file:///')
  
  switch (url.pathname) {
    case '/':
      createReadStream('./index.html').pipe(res)
      break
    case '/chat':
      res.setHeader('Content-Type', 'text/event-stream')
      const { data } = await request.post<Stream>(
        '/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: '简单的介绍一下你自己' }],
          temperature: 0.7,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      )
      data.pipe(res)
      break
    default:
      res.end('')
  }
}).listen(7888)

console.log('listen: http://localhost:7888')
