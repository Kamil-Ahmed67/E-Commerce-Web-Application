import { google } from 'googleapis';
import { Readable } from 'stream';

function getDriveClient() {
  const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      'Google Drive OAuth2 credentials (CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN) are missing in .env.local'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Uploads a file to Google Drive.
 * @param fileBuffer Buffer content of file
 * @param fileName file name
 * @param mimeType mime type
 * @returns webViewLink
 */
export async function uploadToDrive(fileBuffer, fileName, mimeType) {
  try {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const drive = getDriveClient();
    const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: FOLDER_ID ? [FOLDER_ID] : [],
      },
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    // Make file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const file = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink',
    });

    return file.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}
