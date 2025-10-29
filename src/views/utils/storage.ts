export const saveToStorage = (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  };
  
  export const getFromStorage = (key: string): any | null => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };