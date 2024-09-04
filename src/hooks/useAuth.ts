import { useAppSelector } from '../app/hooks';

export const useAuth = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  return { isAuthenticated, user };
};
