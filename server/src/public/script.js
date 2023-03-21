// users roles buttons
const usersRoleButtons = document.querySelectorAll('.users-role-button');

if (usersRoleButtons) {
    usersRoleButtons.forEach((button) => {
        let clickNumber = 1;
        button.addEventListener('click', () => {
            if (clickNumber === 1) {
                alert("Do you really want change user's role?")
            }
        })
    }
    );
}

// users roles buttons

