# Receives data-URL screenshots POSTed by a test page and writes them as JPEGs.
import base64, http.server, sys, time
OUT = sys.argv[1]
class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(n).decode()
        name, _, data = body.partition('|')
        raw = base64.b64decode(data.split(',', 1)[1])
        path = f"{OUT}/{name or 'shot'}.jpg"
        open(path, 'wb').write(raw)
        self.send_response(200); self.send_header('Access-Control-Allow-Origin', '*'); self.end_headers(); self.wfile.write(path.encode())
    def do_OPTIONS(self):
        self.send_response(204); self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Access-Control-Allow-Headers', '*'); self.end_headers()
    def log_message(self, *a): pass
http.server.HTTPServer(('127.0.0.1', 8799), H).serve_forever()
