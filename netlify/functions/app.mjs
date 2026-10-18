
import serverless from 'serverless-http';
import app from '../../backend/src/app.js';
import { connectDB } from '../../backend/src/config/db.js';

let dbConnection;

async function ensureDBConnection() {
  if (!dbConnection) {
    dbConnection = connectDB().catch((error) => {
      dbConnection = null;
      throw error;
    });
  }

  await dbConnection;
}

const expressHandler = serverless(app);

export const handler = async (event, context) => {
  try {
    await ensureDBConnection();
    return await expressHandler(event, context);
  } catch (error) {
    console.error('Netlify API error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
    };
  }
};
