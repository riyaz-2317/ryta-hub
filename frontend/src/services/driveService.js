const FOLDER_NAME = 'RYTA HUB Chats';
let folderId = null;
let accessToken = null;

export const initDrive = (token) => {
  accessToken = token;
};

export const getDriveState = () => ({ folderId, accessToken });

export const createRytaHubFolder = async () => {
  if (!accessToken) return null;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();
  if (searchData.files?.length > 0) {
    folderId = searchData.files[0].id;
    return folderId;
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const folder = await createRes.json();
  folderId = folder.id;
  return folderId;
};

export const saveChatToDrive = async (sessionId, chatData, existingFileId = null) => {
  if (!accessToken) return null;
  const content = JSON.stringify({ appName: 'RYTA HUB', sessionId, ...chatData }, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const metadata = {
    name: `RYTA_HUB_${sessionId}.json`,
    mimeType: 'application/json',
    parents: existingFileId ? undefined : [folderId],
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);
  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const method = existingFileId ? 'PATCH' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  return res.json();
};

export const loadChatsFromDrive = async () => {
  if (!accessToken || !folderId) return [];
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.files || [];
};

export const deleteChatFromDrive = async (fileId) => {
  if (!accessToken) return;
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};
