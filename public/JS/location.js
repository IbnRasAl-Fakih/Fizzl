function home(userId) {
    location.href = `/home/${userId}`;
}

function chats(userId) {
    location.href = `/chat/${userId}`;
}

function users() {
    location.href = `/admin/users`;
}

function post() {
    location.href = `/admin/post`;
}

async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        location.href = '/';
    } catch (error) {
        console.log(error);
    }
}