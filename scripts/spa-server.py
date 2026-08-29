#!/usr/bin/env python3
"""Servidor estático local con fallback a index.html para rutas de la SPA.
Equivalente en dev a la reescritura de vercel.json en producción."""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8934


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            if '.' not in os.path.basename(self.path):
                self.path = '/index.html'
        return super().send_head()


if __name__ == '__main__':
    with http.server.ThreadingHTTPServer(('', PORT), SPARequestHandler) as httpd:
        print(f"Serving with SPA fallback on port {PORT}")
        httpd.serve_forever()
