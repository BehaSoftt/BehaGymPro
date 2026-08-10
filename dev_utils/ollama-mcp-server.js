'use strict';
const http = require('http');
const readline = require('readline');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3-coder:30b';

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function ollamaChat(messages, callback) {
  const body = JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false });
  const url = new URL(OLLAMA_HOST + '/api/chat');
  const options = {
    hostname: url.hostname,
    port: parseInt(url.port) || 11434,
    path: url.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try { callback(null, JSON.parse(data)); } catch (e) { callback(e); }
    });
  });
  req.on('error', callback);
  req.write(body);
  req.end();
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', (line) => {
  line = line.trim();
  if (!line) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }

  const id = msg.id;
  const method = msg.method;

  if (method === 'initialize') {
    send({
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'qwen3-coder-mcp', version: '1.0.0' }
      }
    });
  } else if (method === 'tools/list') {
    send({
      jsonrpc: '2.0', id,
      result: {
        tools: [{
          name: 'ask_qwen',
          description: 'Qwen3-Coder:30b modeline soru sor (yerel Ollama)',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Göndermek istedigin mesaj' }
            },
            required: ['message']
          }
        }]
      }
    });
  } else if (method === 'tools/call') {
    const args = msg.params && msg.params.arguments;
    if (msg.params && msg.params.name === 'ask_qwen') {
      ollamaChat([{ role: 'user', content: args.message }], (err, result) => {
        if (err) {
          send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'Hata: ' + err.message }], isError: true } });
        } else {
          const text = (result.message && result.message.content) || JSON.stringify(result);
          send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } });
        }
      });
    } else {
      send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Tool not found' } });
    }
  } else if (id !== undefined) {
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
  }
});
