const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
    console.log('Testing Gemini Connection (JS version)...');
    console.log('Project:', process.env.GOOGLE_CLOUD_PROJECT_ID);
    console.log('Location:', process.env.GOOGLE_CLOUD_LOCATION || 'us-central1');

    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
        console.error('ERROR: GOOGLE_CLOUD_PROJECT_ID is not set!');
        return;
    }

    try {
        const ai = new GoogleGenAI({
            vertexai: true,
            project: process.env.GOOGLE_CLOUD_PROJECT_ID,
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        });

        const model = 'gemini-2.0-flash-exp';
        console.log('Running generateContent with model:', model);

        const result = await ai.models.generateContent({
            model: model,
            contents: 'Hola Thomas, ¿puedes leerme?',
        });

        console.log('Response Success!');
        console.log('Response:', result.text);

        console.log('\nTesting Embedding...');
        const embedResult = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: 'Test embedding content',
        });

        console.log('Embedding Success!');
        if (embedResult.embeddings && embedResult.embeddings.length > 0) {
            console.log('Values count:', embedResult.embeddings[0].values.length);
        } else if (embedResult.values) {
            console.log('Values count (direct):', embedResult.values.length);
        } else {
            console.log('Embedding result structure:', JSON.stringify(embedResult, null, 2));
        }

    } catch (error) {
        console.error('FAILED TO CONNECT TO GEMINI:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);
    }
}

testGemini();
