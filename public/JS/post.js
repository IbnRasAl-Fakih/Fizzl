document.addEventListener('DOMContentLoaded', function() {
    let closeModalBtn = document.getElementById('closeModalBtn');
    let modal = document.getElementById('myModal');

    closeModalBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    document.getElementById("closeUpdateModalBtn").addEventListener('click', () => {modal.style.display = 'none';});
    let modal2 = document.getElementById("myUpdateModal");
    window.addEventListener('click', function(event) {
        if (event.target === modal2) {
            modal2.style.display = 'none';
        }
    });
});

function openModal() {
    let modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function editPost(id) {
    document.getElementById('myUpdateModal').style.display = 'block';
    document.getElementById("updateForm").action = `/admin/post/${id}`;
}

async function deletePost(id) {
    try {
        console.log(id)
        const response = await fetch(`/admin/post/${id}`, {
            method: 'DELETE',
        });
        setInterval(location.reload(), 3000);
    } catch (error) {
        console.log(error);
    }
}