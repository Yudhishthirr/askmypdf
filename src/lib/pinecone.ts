import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
    apiKey:  process.env.PINCONE_API_KEY!,
});
