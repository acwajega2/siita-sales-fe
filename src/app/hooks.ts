import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Custom hook to use the dispatch function with the correct type
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook to use the selector function with the correct type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Adding an empty export to make this file a module
export {};
