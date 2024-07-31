document.addEventListener("DOMContentLoaded", function() {
    fetchNotifications();
});

function fetchNotifications() {
    fetch("/obtener_eventos_calendar")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const notificationsList = document.getElementById("notifications-list");
            notificationsList.innerHTML = "";
            console.log("llegue aqui!");
            data.forEach(notification => {
                const notificationItem = document.createElement("li");
                notificationItem.innerHTML = `
                    <button class="accordion">${notification.title}</button>
                    <div class="panel">
                        <p><strong>Title:</strong> <span class="notification-property">${notification.title}</span></p>
                        <p><strong>Start:</strong> <span class="notification-property">${notification.start}</span></p>
                        <p><strong>Description:</strong> <span class="notification-property">${notification.description}</span></p>
                        <p><strong>Creation Date:</strong> <span class="notification-property">${notification.creationDate}</span></p>
                    </div>
                `;
                notificationsList.appendChild(notificationItem);
            });
            const accordionButtons = document.getElementsByClassName("accordion");
            for (let i = 0; i < accordionButtons.length; i++) {
                accordionButtons[i].addEventListener("click", function() {
                    this.classList.toggle("active");
                    const panel = this.nextElementSibling;
                    if (panel.style.display === "block") {
                        panel.style.display = "none";
                    } else {
                        panel.style.display = "block";
                    }
                });
            }
        })
        .catch(error => console.error("Error fetching notifications: " + error));
}


accordionButtons[i].addEventListener("click", function() {
    this.classList.toggle("active");
    const panel = this.nextElementSibling;
    if (panel.style.display === "block") {
        panel.style.display = "none";
    } else {
        panel.style.display = "block";
    }
});