const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");
const path = require("path");

// Caminhos dos arquivos de credenciais e token
const credentialsPath = path.join(__dirname, "./meetService/meetCredentials.json");
const tokenPath = path.join(__dirname, "./meetService/token.json");

// Escopos para as permissões solicitadas
const SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/drive"
];

// Função para solicitar o token ao usuário e salvar
const getAccessToken = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Autorize este aplicativo visitando o URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nInsira o código da página de autorização: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Erro ao tentar recuperar o token:", err.message);
        return;
      }
      oAuth2Client.setCredentials(token);

      // Salvar o token para reutilização futura
      fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err) {
          console.error("Erro ao salvar o token:", err.message);
        } else {
          console.log("Token armazenado com sucesso em:", tokenPath);
        }
      });
    });
  });
};

// Carregar o token ou solicitar autenticação
const authorize = (credentials) => {
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Tentar carregar o token salvo
  if (fs.existsSync(tokenPath)) {
    const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    oAuth2Client.setCredentials(token);
    console.log("Autenticado com sucesso usando o token salvo.");
    return oAuth2Client;
  } else {
    // Se o token não existir, solicitar ao usuário
    getAccessToken(oAuth2Client);
  }
};

// Carregar credenciais e iniciar o processo de autenticação
fs.readFile(credentialsPath, (err, content) => {
  if (err) {
    console.error("Erro ao carregar o arquivo credentials.json:", err.message);
    return;
  }

  const credentials = JSON.parse(content);
  authorize(credentials);
});
