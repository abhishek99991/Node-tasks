const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {

    if (req.url === "/" && req.method === "GET") {

        res.setHeader("Content-Type", "text/html");

        res.end(`
            <html>
                <body>
                    <h2>Enter your name</h2>

                    <form action="/message" method="POST">
                        <label>Name:</label>
                        <input type="text" name="username">
                        <button type="submit">Add</button>
                    </form>
                </body>
            </html>
        `);
    }

    else if (req.url === "/message" && req.method === "POST") {

        const dataChunks = [];

        req.on("data", (chunks) => {
            console.log("Chunk:", chunks);

            dataChunks.push(chunks);
        });

        req.on("end", () => {

          
            const combinedBuffer = Buffer.concat(dataChunks);

            console.log("Combined Buffer:", combinedBuffer);

          
            const value = combinedBuffer.toString();

            console.log("Value:", value);

          
            fs.writeFile("message.txt", value, (err) => {

                if (err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.end("Error writing file");
                    return;
                }

               
                res.statusCode = 302;
                res.setHeader("Location", "/");

                res.end();
            });
        });
    }

   
    else {
        res.statusCode = 404;
        res.end("Page Not Found");
    }
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
