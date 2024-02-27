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
});

function openModal() {
    let modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function editUser(id) {
    document.getElementById("formUserID").value = id;
    openModal();
}

function editFunction() {
    document.getElementById("adminStatus").value = document.getElementById("myCheckbox").checked;
    document.getElementById("editButton").click();
}

async function deleteUser(userId) {
    try {
        console.log("delete")
        const response = await fetch(`/deleteUser/${userId}`, {
            method: 'DELETE',
        });
        setInterval(location.reload(), 3000);
    } catch (error) {
        console.log(error);
    }
}