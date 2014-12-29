# nfs - Node.js File Server

List, download your files.

1. `npm install`
2. Modify `config.json`
3. `node index.js`

## nginx

You may use nginx for reverse proxy and better file serving.

Add below to your server block:

```
# Add your extensions
location ~* ^.+\.(jpg|jpeg|gif|png|ico|css|zip|tgz|gz|rar|bz2|pdf|txt|tar|wav|bmp|rtf|js|flv|swf|html|htm|mp3|m4a|mp4)$ {
    # Make sure to match with config.json's server.dir
    root /;
}

location ~* .*$ {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # Make sure to match with config.json's server.port
    proxy_pass http://127.0.0.1:50000;
}
```