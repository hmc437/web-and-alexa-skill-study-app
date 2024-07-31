//Código para mandar preguntas a chatgpt y obtener respuesta progresiva, que se irá mostrando al usuario
async function consultarChatGPTProgresivo(consulta, API_KEY_GPT) {
    const cajaTextoRespuesta = document.getElementById("cajaTextoRespuesta");
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY_GPT}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: consulta }],
            stream: true
          }),
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        cajaTextoRespuesta.value = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value);
            console.log("chunk");
            console.log(chunk);
            const lines = chunk.split("\n\n");

            console.log("lines");
            console.log(lines);

            const parsedLines = lines
                .map((line) => line.replace(/^data: /, "").trim()) //Elimina la cabecera de data
                .filter((line) => line !== "" && line !== "[DONE]") //Elimina las líneas vacías y la que contenga [DONE]
                .map((line) => JSON.parse(line));

            for (const parsedLine of parsedLines) {
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                //Se actualiza el contenido de la caja de texto con la respuesta progresiva obtenida
                if (content) {
                    cajaTextoRespuesta.value += content;
                }
            }
        }
      } catch (error) {
            console.error("Error:", error);
            cajaTextoRespuesta.value = "Error al generar la respuesta de ChatGPT.";
      }
}

//Código para el  botón de consulta de chatgpt
document.getElementById("btnConsultaGPT").addEventListener('click', async function() {
    const inputPregunta = document.getElementById("inputPregunta");
    const API_KEY_GPT = await getApiKeyChatGPT();
    consultarChatGPTProgresivo(inputPregunta.value, API_KEY_GPT);
});


//Función para obtener la API Key de ChatGPT
async function getApiKeyChatGPT() {
    const response = await fetch('/get_api_key_chatgpt');
    const data = await response.json();
    return data.api_key_chatgpt;
}


//Función para obtener la API Key de ChatPDF
async function getApiKeyChatPDF() {
    const response = await fetch('/get_api_key_chatpdf');
    const data = await response.json();
    return data.api_key_chatpdf;
}

// Funciones para el envio del pdf a la API de ChatPDF, y para generar, obtener y mostrar las preguntas en el frontend
let sourceId = null; // ID de origen de tu PDF
document.getElementById("subirPDF").addEventListener("click",  async () => {
    const API_KEY_PDF = await getApiKeyChatPDF();
    const pdfInput = document.getElementById("pdfInput");

    if (pdfInput.files.length === 0) {
        alert("Por favor, selecciona un archivo PDF.");
        return;
    }

    const pdfFile = pdfInput.files[0];
    subirPDF(pdfFile,API_KEY_PDF);
});


//Enviar pregunta a ChatPDF y obtener respuesta
document.getElementById("enviarPregunta").addEventListener("click", async () => {
    const API_KEY_PDF = await getApiKeyChatPDF();
    const preguntaInput = document.getElementById("preguntaInput").value;
    const url = "https://api.chatpdf.com/v1/chats/message";

    if (!sourceId || !preguntaInput) {
        alert("Primero debes ingresar una pregunta.");
        return;
    }

    const mensaje = {
        role: "user",
        content: preguntaInput
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY_PDF
            },
            body: JSON.stringify({ sourceId, messages: [mensaje] })
        });

        const respuesta = await response.json();
        const respuestaTexto = respuesta.content;
        document.getElementById("respuestaObtenida").innerHTML = respuestaTexto;
    } catch (error) {
        console.error("Error al enviar la pregunta: " + error);
    }
});


//Subir PDF a ChatPDF
async function subirPDF(pdfFile,API_KEY_PDF) {
    const url = "https://api.chatpdf.com/v1/sources/add-file";

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "x-api-key": API_KEY_PDF
            },
            body: formData
        });

        const responseData = await response.json();
        sourceId = responseData.sourceId;
        console.log("PDF subido con éxito. Source ID: " + sourceId);

        // Después de subir el PDF, generamos preguntas automáticamente
        generarPreguntas(API_KEY_PDF);
    } catch (error) {
        console.error("Error al subir el PDF: " + error);
    }
}


//Función para generar preguntas a partir del pdf con ChatPDF
async function generarPreguntas(API_KEY_PDF) {
    const url = "https://api.chatpdf.com/v1/chats/message";

    const mensajes = [
        {
            role: "user",
            content: "Genera preguntas automáticamente."
        }
    ];

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY_PDF
            },
            body: JSON.stringify({ sourceId, messages: mensajes })
        });

        const respuesta = await response.json();
        const preguntasGeneradas = respuesta.content;
        document.getElementById("respuesta").innerHTML = preguntasGeneradas;
    } catch (error) {
        console.error("Error al generar preguntas: " + error);
    }
}


// Código para el carrusel de imágenes
var prevButton = document.querySelector('.carousel-control-prev');
var nextButton = document.querySelector('.carousel-control-next');
var newImages = ['/static/slide1.jpg', '/static/slide2.jpg'];
var currentImageIndex = 0;


//Funcion que cambia la imagen del carrusel
function changeImage() {
    var activeCarouselItem = document.querySelector('.carousel-item.active');
    var activeImage = activeCarouselItem.querySelector('img');
    activeImage.src = newImages[currentImageIndex];
    currentImageIndex++;
    if (currentImageIndex >= newImages.length) {
        currentImageIndex = 0;
    }
}

prevButton.addEventListener('click', changeImage);
nextButton.addEventListener('click', changeImage);
setInterval(changeImage, 5000);


//Código para el temporizador pomodoro
$(document).ready(function(){
    var cuentaS = 25;
    var cuentaB = 5;
    var pos = "pomodoro";
    var contadorIntervalo;
    var cuenta;
    var alarma = new Audio('/static/alarma.mp3'); 

    $("#minutes").html(cuentaS);
    $("#seconds").html("00");

    $("#work-button").click(function(){
        pos = "pomodoro";
        cuenta = cuentaS;
        iniciarCuentaRegresiva();
    });

    $("#short-break-button").click(function(){
        pos = "Descanso corto";
        cuenta = cuentaB;
        iniciarCuentaRegresiva();
    });

    $("#long-break-button").click(function(){
        pos = "Descanso largo";
        cuenta = cuentaB * 3;
        iniciarCuentaRegresiva();
    });

    $("#stop-button").click(function(){
        clearInterval(contadorIntervalo);
        $("#minutes").html(cuenta);
        $("#seconds").html("00");
        alarma.pause();
    });

    function iniciarCuentaRegresiva() {
        clearInterval(contadorIntervalo);
        var totalSegundos = cuenta * 60;
        contadorIntervalo = setInterval(function() {
            totalSegundos--;
            var minutos = Math.floor(totalSegundos / 60);
            var segundos = totalSegundos % 60;
            $("#minutes").html(minutos);
            $("#seconds").html(segundos < 10 ? "0" + segundos : segundos);
            if (totalSegundos <= 0) {
                clearInterval(contadorIntervalo);
                alarma.play(); //reproduce la alarma cuando el temporizador llegue a 0
            }
        }, 1000);
    }
});