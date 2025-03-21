import { google, meet_v2 } from "googleapis";
import { GraphQLError } from "graphql";
import { getGoogleAuthClient } from "../googleAuthClient";
import { uploadFile } from "../../files/filesActions";
import { Users } from "../../../models/User";
import fs from "fs";
import path from "path";

export const checkToken = async () => {
  const credentials = require("./meetCredentials.json");
  const token = require("./token.json");

  try {
    if (!token.expiry_date || token.expiry_date < Date.now()) {
      const response = await fetch("https://www.googleapis.com/oauth2/v4/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: credentials.web.client_id,
          client_secret: credentials.web.client_secret,
          refresh_token: token.refresh_token,
          grant_type: "refresh_token",
        }).toString(),
      });

      const newToken = await response.json();

      if (!response.ok) {
        throw new Error(`Erro na atualização do token: ${newToken.error}`);
      }

      token.access_token = newToken.access_token;
      token.expiry_date = Date.now() + newToken.expires_in * 1000;

      fs.writeFileSync(
        path.resolve(__dirname, "./token.json"),
        JSON.stringify(token, null, 2)
      );

      console.log("Token atualizado com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao atualizar o token:", error);
  }
};

export const createGoogleMeet = async (userId: any) => {
  await checkToken();

  const authClient = await getGoogleAuthClient(
    "./meetService/meetCredentials.json",
    "./meetService/token.json"
  );

  const user = await Users.findById(userId);

  const meet = google.meet({
    version: "v2",
    auth: authClient,
  });

  const response = await meet.spaces.create();

  if (!response?.data?.name) {
    throw new GraphQLError("Erro ao criar a sala no Google Meet.");
  }

  try {
    await createMember(response.data.name, user);
  } catch (error) {
    console.error("Error:", error);
  }

  return response.data;
};

export const createMember = async (spaceName: any, user: any) => {
  await checkToken();

  const token = require("./token.json");

  const response = await fetch(
    `https://meet.googleapis.com/v2beta/${spaceName}/members`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify({
        name: user?.name,
        email: user?.email,
        role: "COHOST",
      }),
    }
  );

  return response;
};

export const fetchConferenceRecords = async (meet: any, spaceName: any) => {
  await checkToken();

  return await meet.conferenceRecords
    .list({
      filter: `space.name = ${spaceName}`,
    })
    .then((res: any) => res.data);
};

// export const processConferenceRecord = async (record: any, meet: any, drive: any) => {
//   try {
//     const recordings = await fetchRecordings(meet, record.name);

//     if (recordings?.length) {
//       for (const item of recordings.filter(
//         (item: any) => (item.state = "FILE_GENERATED")
//       )) {
//         const record = await handleRecordingItem(item, drive);
//       }
//     }
//   } catch (error) {
//     console.log("Sem gravação", error);
//   }
// };

export const fetchRecordings = async (meet: any, parentName: any) => {
  await checkToken();

  return await meet.conferenceRecords.recordings
    .list({
      parent: parentName,
    })
    .then((res: any) => res.data?.recordings || []);
};

export const handleRecordingItem = async (item: any, drive: any, name: any) => {
  await checkToken();

  if (!item.driveDestination?.file) {
    console.log("Sem arquivo de destino.");
    return;
  }

  const fileId = item.driveDestination.file;
  const fileMetadata = await drive.files.get({ fileId });

  if (fileMetadata.data.mimeType === "video/mp4") {
    await drive.files.update({
      fileId,
      requestBody: {
        name: name,
      },
    });
  }

  const fileBlob = await fetchFileBlob(drive, fileId);
  const newFile = await createFileFromBlob(fileBlob, name);

  const file = await uploadFile(newFile);
  return file;
};

export const defineWhichFileToUpload = async (
  drive: any,
  meet: any,
  files: any,
  name: any
) => {
  await checkToken();

  let fileToUpload: any = { file: null, size: 0 };

  for (const file of files) {
    const fileInfo = await fetchRecordings(meet, file.name);
    for (const item of fileInfo) {
      if (item && item.state === "FILE_GENERATED") {
        const driveFileInfo = await fetchFileBlob(
          drive,
          item.driveDestination.file
        );

        if (
          fileToUpload?.file === null ||
          driveFileInfo.size > fileToUpload?.size
        ) {
          fileToUpload.file = item;
        }
      }
    }
  }

  if (fileToUpload.file) {
    const file = await handleRecordingItem(fileToUpload.file, drive, name);
    if (file) return file;
  }
};

export const fetchFileBlob = async (drive: any, fileId: any) => {
  return await drive.files
    .get({
      fileId,
      alt: "media",
    })
    .then((response: any) => response.data);
};

export const createFileFromBlob = async (blobData: any, fileName: any) => {
  const blob = new Blob([Buffer.from(await blobData.arrayBuffer())], {
    type: "video/mp4",
  });

  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
};
