# 📂 Gerenciamento de Arquivos - Upload e Exclusão

Este módulo fornece funções para **upload** e **exclusão** de arquivos no servidor da Magistrar Educacional.

## 🚀 Tecnologias Utilizadas
- **Fetch API** - Para interação com o servidor de arquivos.
- **FormData** - Para manipulação e envio de arquivos.

---

## 📂 Funções Implementadas

### 📤 Upload de Arquivos

#### `uploadFile(file: any): Promise<any>`

Envia um arquivo para o servidor da Magistrar Educacional.

```ts
export const uploadFile = async (file: any): Promise<any> => {
    if (!file) {
        console.log('Nenhum arquivo foi selecionado.');
        return Promise.reject('Nenhum arquivo foi selecionado.');
    }

    const formData = new FormData();
    formData.append('files', file);

    try {
        const response = await fetch('https://files.magistrareducacional.com.br/files', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Arquivo enviado com sucesso!');
            return responseData;
        } else {
            const errorMessage = 'Erro ao enviar o arquivo. Tente novamente.';
            console.log(errorMessage);
            const errorResponse = await response.json();
            throw errorResponse || errorMessage;
        }
    } catch (error) {
        console.log('Erro ao enviar o arquivo. Tente novamente.');
        throw error;
    }
};
```

**O que faz?**
- Verifica se um arquivo foi selecionado.
- Cria um objeto `FormData` e adiciona o arquivo.
- Envia o arquivo para `https://files.magistrareducacional.com.br/files` via **método POST**.
- Retorna os dados do arquivo enviado se a resposta for bem-sucedida.
- Em caso de erro, exibe uma mensagem no console e lança uma exceção.

---

### 🗑️ Exclusão de Arquivos

#### `deleteFile(fileId: string): Promise<any>`

Deleta um arquivo do servidor da Magistrar Educacional.

```ts
export const deleteFile = async (fileId: string): Promise<any> => {
    try {
        const response = await fetch(
            `https://files.magistrareducacional.com.br/files/delete?ids=${fileId}`,
            {
                method: 'DELETE',
            }
        );

        if (response.ok) {
            const responseData = await response.json();
            console.log('Arquivo deletado com sucesso.');
            return responseData;
        } else {
            const errorMessage = 'Erro ao deletar o arquivo. Tente novamente.';
            console.log(errorMessage);
            const errorResponse = await response.json();
            throw errorResponse || errorMessage;
        }
    } catch (error) {
        console.log('Erro ao deletar o arquivo. Tente novamente.');
        throw error;
    }
};
```

**O que faz?**
- Faz uma requisição **DELETE** para `https://files.magistrareducacional.com.br/files/delete?ids=${fileId}`.
- Se a resposta for bem-sucedida, retorna os dados da exclusão.
- Caso ocorra um erro, exibe uma mensagem e lança uma exceção.

---

## 📝 Resumo

- **Upload de Arquivos:**
  - Verifica se o arquivo foi selecionado.
  - Envia o arquivo via `fetch` com `FormData`.
  - Retorna os dados do arquivo enviado.

- **Exclusão de Arquivos:**
  - Envia uma requisição DELETE para remover o arquivo do servidor.
  - Retorna o status da exclusão.

Essas funções garantem um fluxo eficiente para manipulação de arquivos na Magistrar Educacional. 🚀

