var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).listen(3000);  // ポート競合の場合は値を変更

var io = socketio(server);

var chat = io.of('/chat').on('connection', function (socket) {
    var name;
    var room;

    socket.on('client_to_server_join', function (data) {
        room = data.value;
        socket.join(room);
    });

    socket.on('client_to_server', function (data) {
        chat.to(room).emit('server_to_client', { value: data.value });
    });

    socket.on('client_to_server_broadcast', function (data) {
        socket.broadcast.to(room).emit('server_to_client', { value: data.value });
    });

    socket.on('client_to_server_personal', function (data) {
        var id = socket.id;
        name = data.value;
        var personalMessage = "あなたは、" + name + "さんとして入室しました。"
        chat.to(id).emit('server_to_client', { value: personalMessage })
    });

    socket.on('disconnect', function () {
        if (name == undefined) {
            console.log("未入室のまま、どこかへ去っていきました。");
        } else {
            var endMessage = name + "さんが退出しました。"
            chat.to(room).emit('server_to_client', { value: endMessage });
        }
    });
});


var fortune = io.of('/fortune').on('connection', function (socket) {
    var id = socket.id;
    var fortunes = ["大吉", "吉", "中吉", "小吉", "末吉", "凶", "大凶"];
    var selectedFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    var todaysFortune = "今日のあなたの運勢は… " + selectedFortune + " です。"
    fortune.to(id).emit('server_to_client', { value: todaysFortune });
});