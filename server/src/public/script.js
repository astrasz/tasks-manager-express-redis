// users roles buttons
const usersRoleButtons = document.querySelectorAll('.users-role-button');

if (usersRoleButtons) {
    usersRoleButtons.forEach((button) => {
        let clickNumber = 1;
        button.addEventListener('click', () => {
            if (clickNumber === 1) {
                alert("Be careful! You are trying to change the user's role.")
            }
        })
    }
    );
}

// users roles buttons

