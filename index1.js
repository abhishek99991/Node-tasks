const http = require("http");
const fs = require("fs");
const querystring = require("querystring");

const PORT = 3000;
const FILE_NAME = "messages.txt";

const server = http.createServer((req, res) => {

    // =========================
    // GET /
    // =========================
    if (req.method === "GET" && req.url === "/") {

        // Check if file exists
        if (!fs.existsSync(FILE_NAME)) {
            fs.writeFileSync(FILE_NAME, "");
        }

        // Read all messages from file
        const fileData = fs.readFileSync(FILE_NAME, "utf-8");

        // Convert file data into messages
        const messages = fileData
            .split("\n")
            .filter(message => message.trim() !== "");

        // Show newest message first
        messages.reverse();

        let messageHTML = "";

        messages.forEach((message) => {
            messageHTML += `
                <div style="
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background: #f5f5f5;
                ">
                    ${message}
                </div>
            `;
        });

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Messages</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f2f2f2;
                        margin: 0;
                        padding: 40px;
                    }

                    .container {
                        max-width: 600px;
                        margin: auto;
                        background: white;
                        padding: 25px;
                        border-radius: 10px;
                    }

                    h1 {
                        text-align: center;
                    }

                    .messages {
                        margin-bottom: 25px;
                    }

                    .message {
                        padding: 12px;
                        margin-bottom: 10px;
                        background: #f5f5f5;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }

                    input {
                        width: 100%;
                        padding: 12px;
                        box-sizing: border-box;
                        margin-bottom: 10px;
                    }

                    button {
                        padding: 10px 20px;
                        cursor: pointer;
                    }
                </style>
            </head>

            <body>

                <div class="container">

                    <h1>Messages</h1>

                    <!-- All old messages -->
                    <div class="messages">
                        ${messageHTML}
                    </div>

                    <!-- Form -->
                    <form method="POST" action="/">

                        <input
                            type="text"
                            name="message"
                            placeholder="Enter your message"
                            required
                        />

                        <button type="submit">
                            Send Message
                        </button>

                    </form>

                </div>

            </body>
            </html>
        `);
    }


    // =========================
    // POST /
    // =========================
    else if (req.method === "POST" && req.url === "/") {

        let body = "";

        // Receive form data
        req.on("data", (chunk) => {
            body += chunk;
        });

        // When all data is received
        req.on("end", () => {

            // Convert form data
            const formData = querystring.parse(body);

            const message = formData.message;

            if (!message) {
                res.writeHead(400);
                res.end("Message is required");
                return;
            }

            /*
             * Add the new message at the TOP
             *
             * Instead of appendFile(), put the new
             * message before the existing messages.
             */
            fs.readFile(FILE_NAME, "utf-8", (err, existingData) => {

                if (err && err.code !== "ENOENT") {
                    res.writeHead(500);
                    res.end("Error reading file");
                    return;
                }

                const oldMessages = existingData || "";

                const newData = message + "\n" + oldMessages;

                fs.writeFile(FILE_NAME, newData, "utf-8", (writeErr) => {

                    if (writeErr) {
                        res.writeHead(500);
                        res.end("Error writing file");
                        return;
                    }

                    // =========================
                    // 302 REDIRECT
                    // =========================
                    res.writeHead(302, {
                        Location: "/"
                    });

                    res.end();
                });
            });
        });
    }


    // =========================
    // OTHER ROUTES
    // =========================
    else {
        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("404 Not Found");
    }

});


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
