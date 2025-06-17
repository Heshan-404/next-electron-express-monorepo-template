// backend/scripts/concat-schema.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prismaFolder = path.join(__dirname, '..', 'prisma'); // This points to backend/prisma

// The temporary combined schema file will be placed directly in the 'prisma' folder.
const outputSchemaPath = path.join(prismaFolder, '_schema.prisma');

async function concatPrismaSchemas() {
    let combinedSchema = '';

    // 1. CORRECTED: Read the main schema.prisma file
    // It should be 'schema.prisma', not 'models.prisma'
    const mainSchemaPath = path.join(prismaFolder, 'schema.prisma');
    console.log(`Reading main schema from: ${mainSchemaPath}`);
    combinedSchema += await fs.readFile(mainSchemaPath, 'utf8');
    combinedSchema += '\n\n'; // Add some space

    // 2. Read models from the 'models' subdirectory
    const modelsDir = path.join(prismaFolder, 'models');
    console.log(`Scanning models from: ${modelsDir}`);
    try {
        const modelFiles = await fs.readdir(modelsDir);
        for (const file of modelFiles) {
            if (file.endsWith('.prisma')) {
                const filePath = path.join(modelsDir, file);
                console.log(`  - Adding model: ${filePath}`);
                combinedSchema += await fs.readFile(filePath, 'utf8');
                combinedSchema += '\n\n'; // Add space between models
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`Warning: 'prisma/models' directory not found. Skipping model inclusion.`);
        } else {
            console.error(`Error reading models directory: ${error.message}`);
            throw error;
        }
    }

    // Write the combined schema to the temporary file
    await fs.writeFile(outputSchemaPath, combinedSchema, 'utf8');
    console.log(`Combined schema written to: ${outputSchemaPath}`);
}

// Execute the concatenation script
concatPrismaSchemas().catch(console.error);