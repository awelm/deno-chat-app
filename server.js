import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const usernames = {};
const connectedClients = new Map();
let currClientId = 0;

const app = new Application();
const port = 8080;

const router = new Router();

function broadcast(message) {
    for (const client of connectedClients.values()) {
        client.send(message);
    }
}

function broadcast_usernames() {
    console.log("Sending updated username list to all clients: " + JSON.stringify(usernames));
    broadcast(JSON.stringify({
        'event': 'update-users',
        'usernames': usernames,
    }));
}

router.get('/ws_endpoint', async ctx => {
    const socket = await ctx.upgrade();

    socket.onopen = () => {
        currClientId++;
        socket.clientId = currClientId;
        connectedClients.set(currClientId, socket);
        console.log(`New client connected: ${socket.clientId}`);
    };

    socket.onclose = () => {
        console.log(`Client ID ${socket.clientId} disconnected (username: ${socket.username})`);
        connectedClients.delete(socket.clientId);
        delete usernames[socket.username];
        broadcast_usernames();
    };

    socket.onerror = (e) => {
        console.log(e instanceof ErrorEvent ? e.message : e.type);
    };

    socket.onmessage = (m) => {
        const data = JSON.parse(m.data);

        switch(data.event) {
            case 'add-user':
                const username = data.username
                socket.username = username; 
                usernames[username] = true;
                broadcast_usernames();
                break;
            
            case 'send-chat': 
                broadcast(JSON.stringify({
                    'event': 'update-chat',
                    'username': socket.username,
                    'message': data.message,
                })); 
        }
    };
});

app.use(router.routes());
app.use(router.allowedMethods());
// Send static content
app.use(async (context) => {
    await context.send({
        root: `${Deno.cwd()}/`,
        index: "public/index.html",
    });
});

console.log('Listening at http://localhost:' + port);
await app.listen({ port });