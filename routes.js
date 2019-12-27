const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if(url === '/') {
    res.write('<html>');
    res.write('<head><title>My Node Server</title></head>');
    res.write('<body><form method="POST" action="/message"><input type="text" name="message"><input type="submit" value="Submit"></form></body>');
    res.write('</html>');
    return res.end();    
  }
  if( url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
        console.log(chunk);
    })
    return req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        const message = parsedBody.split('=')[1]
        fs.writeFile('message.txt', message, err => {
            res.statusCode=302;
            res.setHeader('Location', '/');
            return res.end();

        });
    })
  }
  // process.exit()
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My Node Server</title></head>');
  res.write('<body><h1>MY Node.js Server</h1></body>');
  res.write('</html>');
  res.end();
}

// export method vairations
module.exports = requestHandler;

// module.exports = {
//   handler: requestHandler,
//   someText: "Some hard coded test"
// }

// exports.handler = requestHandler;
// exports.someText = "Some hard cdede text";