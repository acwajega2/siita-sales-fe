export const login = async (username: string, password: string): Promise<string> => {
    // Mock login function
    if (username === 'user' && password === 'password') {
      return Promise.resolve('userToken');
    } else {
      return Promise.reject('Invalid credentials');
    }
  };
  
  export const logout = () => {
    // Mock logout function
    return Promise.resolve();
  };
  