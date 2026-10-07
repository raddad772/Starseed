#!/usr/bin/env python3
"""Static dev server for Starseed Infinite with caching disabled (ES modules and
worker imports otherwise go stale between edits)."""
import http.server, sys, os

class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.mjs': 'text/javascript'}
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        # cross-origin isolation: SharedArrayBuffer (the worlds' refinements, shared by the
        # workers rather than copied to each)
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        # the JS self-profiler (new Profiler(...)): where a frame's time goes, sampled, in a test tab
        self.send_header('Document-Policy', 'js-profiling')
        super().end_headers()
    def log_message(self, *a):
        pass
    def translate_path(self, path):
        # /v<N>/... aliases the root: a cache-busting prefix for every module URL
        import re
        path = re.sub(r'^/v\d+(?=/)', '', path)
        return super().translate_path(path)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    root = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCache).serve_forever()
