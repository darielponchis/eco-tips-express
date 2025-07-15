document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar el input de texto y el botón por su ID en JavaScript
    const searchButton = document.getElementById('searchButton');
    const tipInput = document.getElementById('tipInput');
    const resultsDiv = document.getElementById('results'); // El div para mostrar los resultados

    // Tu clave API de Google AI Studio (¡recordatorio de seguridad para producción!)
    const API_KEY = 'AIzaSyB9a2Q_ZdkAukClLLz7HF80wPLzjE6-crY';
    // Nombre del modelo sugerido por Google AI Studio
    const MODEL_NAME = 'gemini-1.5-flash'; // O 'gemini-1.5-pro' si ese es tu modelo

    /**
     * Realiza una llamada a la API de Gemini con un prompt dado.
     * @param {string} prompt El texto de entrada para la API de Gemini.
     * @returns {Promise<string>} La respuesta generada por Gemini.
     */
    async function getGeminiResponse(prompt) {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de la API de Gemini:', errorData);
                throw new Error(`Error en la solicitud a Gemini: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Error desconocido'}`);
            }

            const data = await response.json();

            if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.warn('La respuesta de Gemini no contiene el formato esperado:', data);
                return 'No se pudo obtener una respuesta de Gemini con el formato esperado. Intenta con otra palabra clave.';
            }

        } catch (error) {
            console.error('Error al llamar a la API de Gemini:', error);
            return `Hubo un error al procesar tu solicitud: ${error.message}. Por favor, inténtalo de nuevo más tarde o verifica tu conexión.`;
        }
    }

    // 2. Añadir un 'click listener' al botón
    searchButton.addEventListener('click', async () => {
        // Obtener el texto del input
        const searchTerm = tipInput.value.trim(); // .trim() elimina espacios en blanco al inicio/final
        resultsDiv.innerHTML = ''; // Limpiar resultados anteriores

        if (searchTerm) {
            // 3. Mostrar un mensaje de 'Cargando...'
            resultsDiv.innerHTML = '<p>Cargando EcoTips, por favor espera...</p>';

            try {
                // 4. El prompt para Gemini debe ser: 'Dame 5 consejos breves y prácticos sobre [tema del usuario] para cuidar el medio ambiente.'
                const promptForGemini = `Dame 5 consejos breves y prácticos sobre "${searchTerm}" para cuidar el medio ambiente.`;
                
                // Llamar a la función que interactúa con la API de Gemini
                const geminiResponse = await getGeminiResponse(promptForGemini);
                
                // 5. Mostrar la respuesta en el div 'results'
                resultsDiv.innerHTML = `<h3>EcoTips sobre "${searchTerm}":</h3><p>${geminiResponse}</p>`;

            } catch (error) {
                // Mostrar un mensaje de error si la llamada a la API falla
                resultsDiv.innerHTML = `<p style="color: red;">Error al obtener los EcoTips: ${error.message}</p>`;
            }
        } else {
            // Mensaje si el input está vacío
            resultsDiv.innerHTML = '<p>Por favor, ingresa una palabra clave para encontrar EcoTips.</p>';
        }
    });
});