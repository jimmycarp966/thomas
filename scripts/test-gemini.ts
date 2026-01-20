import { GoogleGenAI } from '@google/genai';

async function testGemini() {
    console.log('Testing Gemini Connection...');
    console.log('Project:', process.env.GOOGLE_CLOUD_PROJECT_ID);
    console.log('Location:', process.env.GOOGLE_CLOUD_LOCATION || 'us-central1');

    try {
        const ai = new GoogleGenAI({
            vertexai: true,
            project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
            location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        });

        const model = 'gemini-2.0-flash-exp';
        console.log('Running generateContent with model:', model);

        const response = await ai.models.generateContent({
            model: model,
            contents: 'Hola Thomas, ¿puedes leerme?',
        });

        console.log('Response Success!');
        console.log('Response:', response.text);

        console.log('\nTesting Embedding...');
        const embedResponse = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: 'Test embedding content',
        });

        console.log('Embedding Success!');
        console.log('Values count:', embedResponse.embeddings[0].values.length);

    } catch (error: any) {
        console.error('FAILED TO CONNECT TO GEMINI:');
        console.error(error.message);
        if (error.stack) console.error(error.stack);
    }
}

testGemini();
