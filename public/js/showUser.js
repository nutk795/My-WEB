// <!-- Show User -->
getUser();
//---------------GET User-----------------
async function getUser() {
    try {
        const response = await fetch('/user');
        if (response.ok) {
            const data = await response.json();
            document.querySelector('#userInfo').innerText = "WELCOME " + data.username;
        } else {
            throw Error('Connection ERROR')
        }
    } catch (error) {
        alert(error.message);
    }
}
