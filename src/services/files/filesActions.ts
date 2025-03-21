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
