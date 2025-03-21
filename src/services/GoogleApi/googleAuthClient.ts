
import fs from "fs";
import { google } from "googleapis";
import path from "path";


export const getGoogleAuthClient = async ( credentialsString: any = "./credentials.json", tokenString: any = "./token.json" ) => {
  const credentialsPath = path.join(
    __dirname,
    credentialsString
  );
  const tokenPath = path.join(
    __dirname,
    tokenString
  );
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  const { client_id, client_secret, redirect_uris } =
    credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
};