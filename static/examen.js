// Realiza una solicitud AJAX a la ruta /calificaciones
$.get('/calificaciones', function(data) {
    // Si la solicitud fue exitosa, muestra las calificaciones en la tabla
    const calificaciones = $('#calificaciones');
    data.forEach((item, index) => {
        const row = $('<tr></tr>');
        
        const numCell = $('<td></td>').text(index + 1);
        row.append(numCell);
        
        const examenCell = $('<td></td>').text(item.examName);
        row.append(examenCell);
        
        const puntuacion = Number(item.puntuacion);
        const calificacionCell = $('<td></td>').text(puntuacion.toFixed(2));
        row.append(calificacionCell);
        
        const fechaCell = $('<td></td>').text(item.fecha);
        row.append(fechaCell);
        
        calificaciones.append(row);
    });
});


//Código para subir test a través de un work o excel a la base  de datos
document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('document', document.getElementById('file-input').files[0]);

    // Get the selected document type
    const documentTypeSelect = document.getElementById('document-type');
    const selectedDocumentType = documentTypeSelect.options[documentTypeSelect.selectedIndex].value;
    formData.append('document-type', selectedDocumentType);

    //Añadir testName
    const testNameInput = document.getElementById('test_name');
    formData.append('test_name', testNameInput.value);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        document.getElementById('upload-message').style.display = data.message;
        document.getElementById('upload-message').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
});

// Código para agregar preguntas a la base de datos manualmente
document.getElementById('add-question-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('question_text', document.getElementById('question_text').value);
    formData.append('answers', document.getElementById('answers').value);
    formData.append('correct_answer', document.getElementById('correct_answer').value);
    formData.append('exam_name', document.getElementById('exam_name').value);

    try {
        const response = await fetch('/add-question', {
            method: 'POST',
            body: formData
        });
        if (response.status === 200) {
            // La pregunta se subió correctamente
            document.getElementById('add-question-message').textContent = 'La pregunta se subió correctamente.';

        } else {
            document.getElementById('add-question-message').textContent = 'Error al subir la pregunta.';
            document.getElementById('add-question-message').classList.remove('alert-success');
            document.getElementById('add-question-message').classList.add('alert-danger');
        }
        document.getElementById('add-question-message').style.display = 'block';
        const data = await response.json();

        // Limpiar los campos del formulario después de agregar la pregunta
        document.getElementById('question_text').value = '';
        document.getElementById('answers').value = '';
        document.getElementById('correct_answer').value = '';
        document.getElementById('exam_name').value = '';
    } catch (error) {
        console.error('Error:', error);
    }
});



//Código para pedir test a ChatGPT y obtener respuesta progresiva, que se irá mostrando al usuario
async function consultarChatGPTProgresivo(consulta,numQuestions,API_KEY_GPT) {
    const cajaTestRespuesta = document.getElementById("cajaTestRespuesta");
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY_GPT}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Eres un asistente útil que genera preguntas de opción múltiple para una prueba siguiendo el formato indicado en la consulta." },
                { role: "user", content: `Genera una test sobre ${consulta} con ${numQuestions} preguntas, cada pregunta teniendo question_text, answers y correct_answer. El test de seguir un formato para documento .docx, este formato es las preguntas en una enumeración de números y en negrita. Tras cada pregunta una enumeración con puntos negros con las respuestas. La respuesta correcta se pone en cursiva.` } // Añade numQuestions en la consulta
            ],
            stream: true
          }),
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        cajaTestRespuesta.value = "";

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
                .map((line) => line.replace(/^data: /, "").trim()) 
                .filter((line) => line !== "" && line !== "[DONE]") 
                .map((line) => JSON.parse(line)); 

            for (const parsedLine of parsedLines) {
                const { choices } = parsedLine;
                const { delta } = choices[0];
                const { content } = delta;
                if (content) {
                    cajaTestRespuesta.value += content;
                }
            }
        }
        } catch (error) {
            console.error("Error:", error);
            cajaTextoRespuesta.value = "Error occurred while generating.";
    }
}


//Código para el  botón de pedir test a ChatGPT
document.getElementById("btnTestGPT").addEventListener('click', async function() {
    const inputTest = document.getElementById("inputTest");
    const numQuestions = document.getElementById("numQuestions").value;
    const API_KEY_GPT = await getApiKeyChatGPT();
    consultarChatGPTProgresivo(inputTest.value, numQuestions, API_KEY_GPT);
});


//Función para pedir clave API de ChatGPT
async function getApiKeyChatGPT() {
    const response = await fetch('/get_api_key_chatgpt');
    const data = await response.json();
    return data.api_key_chatgpt;
}
