import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs/mod.ts";

const app = new Application();
const port = 8080;

const router = new Router();

router.get("/", async (ctx) => {
    ctx.response.body = await renderFileToString("./index.ejs"); // TODO: remove unnecessary ejs
});

app.use(router.routes());
app.use(router.allowedMethods());
// Send static content
app.use(async (context) => {
    await context.send({
        root: `${Deno.cwd()}/`,
    });
});

io.sockets.on('connection', (socket) => {
    socket.on('sendchat', (data) => {
        io.sockets.emit('updatechat', socket.username, data);
    });

    socket.on('adduser', (username) => {
        socket.username = username;

        usernames[username] = username;

        socket.emit(
            'servernotification', {
            connected: true,
            toSelf: true,
            username: username
        });

        socket.broadcast.emit('servernotification', { connected: true, username: username });

        io.sockets.emit('updateusers', usernames);
    });

    socket.on('disconnect', () => {
        delete usernames[socket.username];

        io.sockets.emit('updateusers', usernames);

        socket.broadcast.emit('servernotification', { username: socket.username });
    });
});

console.log('Listening at http://localhost:' + port);
await app.listen({ port });