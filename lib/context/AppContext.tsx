'use client';

import React, { createContext, useReducer, useContext, ReactNode, useMemo } from 'react';
import { Session } from 'next-auth';

// 定义状态类型
interface AppState {
  // 主题相关
  theme: 'light' | 'dark' | 'system';
  // 用户界面
  ui: {
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
  };
  // 通知
  notifications: {
    unreadCount: number;
    hasNewMessages: boolean;
  };
  // 会话相关信息，可以与AuthContext配合使用
  session: Session | null;
  // 全局加载状态
  isLoading: boolean;
}

// 定义Action类型
type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'SET_MOBILE_MENU'; payload: boolean }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_NOTIFICATION_COUNT'; payload: number }
  | { type: 'SET_NEW_MESSAGES'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_NOTIFICATIONS' };

// 初始状态
const initialState: AppState = {
  theme: 'system',
  ui: {
    sidebarOpen: true,
    mobileMenuOpen: false,
  },
  notifications: {
    unreadCount: 0,
    hasNewMessages: false,
  },
  session: null,
  isLoading: false,
};

// 创建上下文
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 便捷方法
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (isLoading: boolean) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 创建reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };
    case 'SET_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: action.payload } };
    case 'TOGGLE_MOBILE_MENU':
      return { ...state, ui: { ...state.ui, mobileMenuOpen: !state.ui.mobileMenuOpen } };
    case 'SET_MOBILE_MENU':
      return { ...state, ui: { ...state.ui, mobileMenuOpen: action.payload } };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_NOTIFICATION_COUNT':
      return { 
        ...state, 
        notifications: { 
          ...state.notifications, 
          unreadCount: action.payload 
        } 
      };
    case 'SET_NEW_MESSAGES':
      return { 
        ...state, 
        notifications: { 
          ...state.notifications, 
          hasNewMessages: action.payload 
        } 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: { 
          unreadCount: 0, 
          hasNewMessages: false 
        } 
      };
    default:
      return state;
  }
}

// 创建Provider组件
interface AppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export function AppProvider({ children, initialState: customInitialState }: AppProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    { ...initialState, ...customInitialState }
  );

  // 创建便捷方法
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setTheme: (theme: 'light' | 'dark' | 'system') => dispatch({ type: 'SET_THEME', payload: theme }),
    setLoading: (isLoading: boolean) => dispatch({ type: 'SET_LOADING', payload: isLoading }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
  }), [state]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义钩子
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext必须在AppProvider内部使用');
  }
  return context;
}

// 为主题提供专门的钩子
export function useTheme() {
  const { state, setTheme } = useAppContext();
  return { theme: state.theme, setTheme };
}

// 为UI状态提供专门的钩子
export function useUI() {
  const { state, dispatch, toggleSidebar } = useAppContext();
  
  return {
    sidebarOpen: state.ui.sidebarOpen,
    mobileMenuOpen: state.ui.mobileMenuOpen,
    toggleSidebar,
    setSidebar: (isOpen: boolean) => dispatch({ type: 'SET_SIDEBAR', payload: isOpen }),
    toggleMobileMenu: () => dispatch({ type: 'TOGGLE_MOBILE_MENU' }),
    setMobileMenu: (isOpen: boolean) => dispatch({ type: 'SET_MOBILE_MENU', payload: isOpen }),
  };
}

// 为通知提供专门的钩子
export function useNotifications() {
  const { state, dispatch } = useAppContext();
  
  return {
    unreadCount: state.notifications.unreadCount,
    hasNewMessages: state.notifications.hasNewMessages,
    setNotificationCount: (count: number) => 
      dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: count }),
    setNewMessages: (hasNew: boolean) => 
      dispatch({ type: 'SET_NEW_MESSAGES', payload: hasNew }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
  };
}

// 为加载状态提供专门的钩子
export function useLoading() {
  const { state, setLoading } = useAppContext();
  return { isLoading: state.isLoading, setLoading };
}

// 为会话提供专门的钩子
export function useSessionContext() {
  const { state, dispatch } = useAppContext();
  
  return {
    session: state.session,
    setSession: (session: Session | null) => 
      dispatch({ type: 'SET_SESSION', payload: session }),
  };
} 