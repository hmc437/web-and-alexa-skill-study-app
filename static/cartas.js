document.addEventListener('DOMContentLoaded', (event) => {
    var currentIndex = 0;
    var dataFromDatabase = [];

    function generateCard(index) {
        var currentCard = dataFromDatabase[index];
        document.getElementById("question").textContent = currentCard.question;
        document.getElementById("answer").textContent = currentCard.answer;
        document.getElementById('flashcard').classList.remove('flipped');
    }

    function nextCard() {
        if (currentIndex < dataFromDatabase.length - 1) {
            currentIndex++;
            generateCard(currentIndex);
        }
    }

    function previousCard() {
        if (currentIndex > 0) {
            currentIndex--;
            generateCard(currentIndex);
        }
    }

    function showAnswer() {
        document.getElementById('flashcard').classList.toggle('flipped');
    }


    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();

        const deckName = document.querySelector('#deck_name').value;

        fetch('/cartas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'deck_name': deckName
            })
        })
        .then(response => response.json())
        .then(flashcards => {
            dataFromDatabase = flashcards;
            currentIndex = 0;
            if (dataFromDatabase.length > 0) {
                generateCard(currentIndex);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('prev').addEventListener('click', previousCard);
    document.getElementById('next').addEventListener('click', nextCard);
    document.querySelector('.show-answer-btn').addEventListener('click', showAnswer);
});



document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('import_cards').addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData();
        formData.append('file', document.getElementById('file').files[0]);
        formData.append('nombre_mazo', document.getElementById('nombre_mazo').value);
        formData.append('filename', document.getElementById('file').files[0].name);

        try {
            const response = await fetch('/import_cards', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            const messageText = document.getElementById('message-text');
            const messageContainer = document.getElementById('message-container');
            messageContainer.style.display = 'block';       

            if (response.status === 200) {
                messageText.textContent = data.message;
                document.getElementById('message-container').classList.remove('alert-danger');
                document.getElementById('message-container').classList.add('alert-success');
            } else {
                messageText.textContent = data.error;
                document.getElementById('message-container').classList.remove('alert-success');
                document.getElementById('message-container').classList.add('alert-danger');
            }
            document.getElementById('file').value = '';
            document.getElementById('nombre_mazo').value = '';

        } catch (error) {
            console.error('Error:', error);
        }
        return false;
    });
});


document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('addcard').addEventListener('submit', async function(event) {
        event.preventDefault();
        const questioncard = document.getElementById('questioncard').value;
        const answercard = document.getElementById('answercard').value;
        const deckcards = document.getElementById('deckcards').value;
        const data = { questioncard, answercard, deckcards };
        try {
            const response = await fetch('/addcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.status === 200) {
                const data = await response.json();
                const addCardContainer = document.getElementById('addcard-container');
                addCardContainer.style.display = 'block';
                addCardContainer.textContent = data.message;
                addCardContainer.classList.remove('alert-danger');
                addCardContainer.classList.add('alert-success');
            } else {
                const data = await response.json();
                const addCardContainer = document.getElementById('addcard-container');
                addCardContainer.style.display = 'block';
                addCardContainer.textContent = data.message;
                addCardContainer.classList.remove('alert-success');
                addCardContainer.classList.add('alert-danger');
            }
            document.getElementById('questioncard').value = '';
            document.getElementById('answercard').value = '';
            document.getElementById('deckcards').value = '';
        } catch (error) {
            console.error('Error:', error);
        }
        return false;
    });
});