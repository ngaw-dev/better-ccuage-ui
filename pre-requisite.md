# Pre-requisite
- Better CC usage mcp server should be running
  - npx @better-ccusage/mcp@latest --type http --port 8080

# Example curl request
- curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"blocks","arguments":{}}}'

- curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"daily","arguments":{}}}'
