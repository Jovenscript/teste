const container = document.getElementById('exercise-container');
const buttons = document.querySelectorAll('#muscle-filters button');

async function fetchExercises(muscle) {
    container.innerHTML = '<p class="loading">A procurar exercícios na internet...</p>';

    try {
        // Colocamos ?limit=100 para trazer mais exercícios de uma vez da API
        const response = await fetch('https://oss.exercisedb.dev/api/v1/exercises?limit=100');
        
        if (!response.ok) {
            throw new Error('Falha ao conectar com a API.');
        }

        // Pega a resposta completa (que inclui o success, meta e data)
        const result = await response.json();
        
        // O SEGREDO ESTÁ AQUI: A lista de exercícios está dentro de result.data
        const exercisesList = result.data;
        
        // Filtra para pegar apenas os exercícios do músculo que você clicou
        const filteredExercises = exercisesList.filter(ex => {
            return (ex.bodyParts && ex.bodyParts.some(part => part.toLowerCase().includes(muscle.toLowerCase()))) || 
                   (ex.targetMuscles && ex.targetMuscles.some(target => target.toLowerCase().includes(muscle.toLowerCase())));
        });

        // Limita a 12 exercícios na tela para ficar bonito
        const limitedExercises = filteredExercises.slice(0, 12);

        if (limitedExercises.length > 0) {
            renderExercises(limitedExercises); 
        } else {
            container.innerHTML = `<p class="welcome-text">Nenhum exercício encontrado para este músculo nestes 100 resultados.</p>`;
        }
        
    } catch (error) {
        console.error('Erro na requisição:', error);
        container.innerHTML = `
            <div class="error">
                <p>Erro ao ligar à API. Verifique a sua internet ou o console.</p>
            </div>`;
    }
}

function renderExercises(exercises) {
    container.innerHTML = ''; 

    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.classList.add('card');

        // Formata os textos
        const equipment = exercise.equipments && exercise.equipments.length > 0 
            ? exercise.equipments[0].replace('_', ' ') 
            : 'Bodyweight';
            
        const secondary = exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
            ? exercise.secondaryMuscles.join(', ')
            : 'Nenhum';

        card.innerHTML = `
            <img src="${exercise.gifUrl}" alt="${exercise.name}" loading="lazy" style="width: 100%; border-radius: 8px; background-color: #fff;">
            <h3>${exercise.name.toUpperCase()}</h3>
            <p><strong>Equipamento:</strong> ${equipment.toUpperCase()}</p>
            <p><strong>Músculo Alvo:</strong> ${exercise.targetMuscles[0].toUpperCase()}</p>
            <p><strong>Sinergistas:</strong> ${secondary}</p>
        `;
        
        container.appendChild(card);
    });
}

// Adiciona o evento de clique nos botões
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const muscle = e.target.getAttribute('data-muscle');
        fetchExercises(muscle);
    });
});