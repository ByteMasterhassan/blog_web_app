//store.ts

import { createStore, applyMiddleware, Store } from 'redux';
import { HYDRATE, createWrapper, MakeStore } from 'next-redux-wrapper';
import thunkMiddleware from 'redux-thunk';
import axios from 'axios';

const FETCH_VIEWER_SUCCESS = 'FETCH_VIEWER_SUCCESS';
const FETCH_VIEWER_FAILURE = 'FETCH_VIEWER_FAILURE';
const SET_TOKEN = 'SET_TOKEN';

export const fetchViewerSuccess = (viewer: any) => ({
  type: FETCH_VIEWER_SUCCESS,
  payload: viewer,
});

export const fetchViewerFailure = (error: any) => ({
  type: FETCH_VIEWER_FAILURE,
  payload: error,
});

export const setToken = (token: string) => ({
  type: SET_TOKEN,
  payload: token,
});


// Define the shape of your state
export interface RootState {
  isAuthenticated: boolean;
  user: null | any;
  viewer: null | any;
  token: null | string;
  categories: any[];
  filteredBlogs: any[];
}

// Define action types
interface SetViewerFromTokenAction {
  type: 'SET_VIEWER_FROM_TOKEN';
  payload: any;
}

interface SetUserAction {
  type: 'SET_USER';
  payload: any;
}

interface SetViewerAction {
  type: 'SET_VIEWER';
  payload: any;
}

interface SetTokenAction {
  type: 'SET_TOKEN';
  payload: string;
}

interface SetCategoriesAction {
  type: 'SET_CATEGORIES';
  payload: any[];
}

interface SetFilteredBlogsAction {
  type: 'SET_FILTERED_BLOGS';
  payload: any[];
}

interface HydrateAction {
  type: typeof HYDRATE;
  payload: RootState;
}

// Create a union of action types
type RootAction = SetUserAction | SetViewerAction | SetViewerFromTokenAction | SetTokenAction | SetCategoriesAction | SetFilteredBlogsAction | HydrateAction;

// Initial state
const initialState: RootState = {
  isAuthenticated: false,
  user: null,
  viewer: null,
  token: null,
  categories: [],
  filteredBlogs: [],
};

// Reducer function
const rootReducer = (state = initialState, action: RootAction): RootState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_VIEWER':
    case 'SET_VIEWER_FROM_TOKEN':
      return { ...state, viewer: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_FILTERED_BLOGS':
      return { ...state, filteredBlogs: action.payload };
    case HYDRATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const fetchViewerMiddleware = (store: { dispatch: (arg0: { type: string; payload: any; }) => void; getState: () => RootState; }) => (next: (arg0: any) => any) => async (action: { type: string; payload: string; }) => {
  const { isAuthenticated } = store.getState();

  if (isAuthenticated && action.type === SET_TOKEN && action.payload && action.payload !== 'null') {
    try {
      // Fetch viewer info using token (Replace URL and headers as per your API)
      const response = await axios.get('/api/viewer', {
        headers: {
          Authorization: `Bearer ${action.payload}`,
        },
      });

      // Dispatch an action to update the viewer in state
      store.dispatch({
        type: FETCH_VIEWER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      // Handle error
      store.dispatch({
        type: FETCH_VIEWER_FAILURE,
        payload: error,
      });
    }
  }

  return next(action);
};


// Helper function to bind middleware
const bindMiddleware = (middleware: any[]) => {
  return applyMiddleware(...middleware, fetchViewerMiddleware);
};

const fetchViewerFromToken = async (token: string) => {
  console.log("Token: ", token); // Log token

  if (token && token !== 'null') {
    try {
      const { data } = await axios.get('https://nodejs.backend.techozon.com/api/viewer/details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Received data: ", data); // Log received data
      return data;
    } catch (error) {
      console.error('Failed to fetch viewer:', error);
      return null;
    }
  } else {
    console.error('No valid token provided.');
    return null;
  }
};



// Create store function
const makeStore: MakeStore<Store<RootState>> = (context) => {
  return createStore(rootReducer, initialState, bindMiddleware([thunkMiddleware]));
};

export const wrapper = createWrapper(makeStore);

// Action Creators
export const setCategories = (categories: any[]) => ({
  type: 'SET_CATEGORIES',
  payload: categories,
});
export const setFilteredBlogs = (blogs: any[]) => ({
  type: 'SET_FILTERED_BLOGS',
  payload: blogs,
});
