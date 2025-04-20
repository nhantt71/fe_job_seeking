export const encodeEmail = (email) => {
    return email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
}; 