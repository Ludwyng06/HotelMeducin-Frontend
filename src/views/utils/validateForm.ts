export const validateEmail = (email: string): boolean => {
    return /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email);
  };
  
  export const validatePhone = (phone: string): boolean => {
    return /^\d{9,15}$/.test(phone);
  };