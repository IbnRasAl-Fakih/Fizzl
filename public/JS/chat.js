const socket = io();
var currentUrl = window.location.href;
var userIdMatch = currentUrl.match(/\/chat\/([^\/]+)\/([^\/]+)/);

if (userIdMatch && userIdMatch.length === 3) {
    var userId = userIdMatch[1];
    var chatId = userIdMatch[2];
    socket.emit('join', chatId, userId);
} else {
    console.error("Не удалось извлечь userId и chatId из URL");
}

async function createChat(user, owner) {
    try {
        const response = await fetch('/chat/createChat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({senderId: owner, receiverId: user}),
        });

        const data = await response.json();
        await getChat(data, owner);
    } catch (error) {
        console.log(error);
    }
}

async function getChat(chatId, userId) {
    try {
        const response = await fetch(`/chat/${userId}/${chatId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            window.location.href = `/chat/${userId}/${chatId}`;
        }
    } catch (error) {
        console.log(error);
    }
}

function sendMessage() {
    const message = document.getElementById("messageInput");
    if (message.value.startsWith("getImage=")) {
        getImage(message.value.substring(("getImage=").length));
        message.value = '';
        return;
    }
    if (message.value.startsWith("getJoke=")) {
        getJoke(message.value.substring(("getJoke=").length));
        message.value = '';
        return;
    }
    if (message.value.startsWith("getQuestion=")) {
        getQuestion(message.value.substring(("getQuestion=").length));
        message.value = '';
        return;
    }
    socket.emit('chat message', message.value, userId, chatId);
    message.value = '';
}

async function getImage(title) {
    try {
        console.log(title)

        const response = await fetch('/chat/getImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({title: title}),
        });
        const responseData = await response.json();
        let message = `<img src="${responseData}" alt="img" class="messageImg">`;
        socket.emit('chat message', message, userId, chatId);
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function getJoke(title) {
    try {
        console.log(title)

        const response = await fetch('/chat/getJoke', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({title: title}),
        });
        const responseData = await response.json();
        socket.emit('chat message', responseData, userId, chatId);
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function getQuestion(title) {
    try {
        console.log(title)

        const response = await fetch('/chat/getQuestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({title: title}),
        });
        const responseData = await response.json();
        console.log(responseData)
        socket.emit('chat message', responseData, userId, chatId);
    } catch (error) {
        console.error('Error: ', error);
    }
}

socket.on('load old messages', function(messages) {
    let result = ``;

    messages.forEach(msg => {
        if (msg.senderId == userId) {
            result += `
            <div class="d-flex justify-content-end">
                <p class="bg-info message"> ${msg.text} </p>
            </div>`;
        } else {
            result += `
            <div class="d-flex justify-content-start">
                <p class="bg-secondary message"> ${msg.text} </p>
            </div>`;
        }
    });
    document.getElementById("chatBody").innerHTML = result;
    document.getElementById('chatBody').scrollTop = document.getElementById('chatBody').scrollHeight;
});

socket.on('send message', function(msg) {
    console.log("сообщение получено")
    let result = ``;
    if (msg.senderId == userId) {
        result += `
        <div class="d-flex justify-content-end">
            <p class="bg-info message"> ${msg.text} </p>
        </div>`
    } else {
        result += `
        <div class="d-flex justify-content-start">
            <p class="bg-secondary message"> ${msg.text} </p>
        </div>`
    }
    document.getElementById("chatBody").innerHTML += result;
    document.getElementById('chatBody').scrollTop = document.getElementById('chatBody').scrollHeight;
});