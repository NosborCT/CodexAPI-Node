export const reorderItems = (items: any[], id: string, newOrder: number) => {
    // Ordena os itens pelo campo `order` para garantir uma base correta
    const sortedItems = [...items].sort((a, b) => a.order - b.order);

    // Encontra o item que será reordenado e remove da lista
    const itemToReorder = sortedItems.find(item => item._id.toString() === id);
    if (!itemToReorder) return items; // Se o item não existir, retorna a lista original

    // Remove o item que será atualizado da lista
    const filteredItems = sortedItems.filter(item => item._id.toString() !== id);

    // Ajusta o newOrder para dentro dos limites válidos
    newOrder = Math.max(1, Math.min(newOrder, filteredItems.length + 1));

    // Lista reorganizada
    const reorderedItems = [];
    let index = 1;
    let inserted = false;

    for (const item of filteredItems) {
        if (index === newOrder) {
            reorderedItems.push({ _id: itemToReorder._id, order: newOrder });
            inserted = true;
        }
        reorderedItems.push({ _id: item._id, order: inserted ? index + 1 : index });
        index++;
    }

    // Se o item não foi inserido antes, adiciona no final
    if (!reorderedItems.find(item => item._id.toString() === id)) {
        reorderedItems.push({ _id: itemToReorder._id, order: newOrder });
    }

    return reorderedItems;
};
