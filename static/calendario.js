document.addEventListener("DOMContentLoaded", function () {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth", //Para cambiar la vista inicial
        events: function(fetchInfo, successCallback, failureCallback) {
            $.ajax({
                url: '/obtener_eventos_calendar', // URL de la ruta Flask
                method: 'GET',
                success: function(data) {
                    var events = [];
                    for (var i = 0; i < data.length; i++) {
                        events.push({
                            title: data[i].title,
                            start: new Date(data[i].start),
                            description: data[i].description,
                            creationDate: new Date(data[i].creationDate)
                        });
                    }
                    successCallback(events);
                },
                error: function() {
                    failureCallback();
                }
            });
        },
        eventClick: function (info) {
            // Muestra información adicional del evento en un modal de Bootstrap
            $("#eventModalTitle").text(info.event.title);
            $("#eventModalStart").text(info.event.start.toLocaleDateString('es-ES'));  
            $("#eventModalDescription").text(info.event.extendedProps.description);
            $("#eventModalCreationDate").text(info.event.extendedProps.creationDate.toLocaleDateString('es-ES')); 
            $("#eventModal").modal("show");
            },
    });
    calendar.render();
});