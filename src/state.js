import { proxy } from 'valtio';

export const state = proxy({
          currentScene: null, // You can initialize this with a default scene if needed
          allowedCamera: false, // Indicates whether the camera is allowed to be accessed
});

// Optionally, you can add functions to update the state
export const setAllowedCamera = (isAllowed) => {
          state.allowedCamera = isAllowed;
};

export const setCurrentScene = (scene) => {
          state.currentScene = scene;
};
