export const capitalizeFirstLetter = (string: string) => {
    return string?.charAt(0).toUpperCase() + string?.slice(1)
}

export const normalizeString = (string: string) => {
    return string
        ?.trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ç/g, "c")
        .replace(/Ç/g, "C")
        .replace(/[^a-zA-Z0-9 ]/g, "")
}

export const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    return passwordRegex.test(password);
}