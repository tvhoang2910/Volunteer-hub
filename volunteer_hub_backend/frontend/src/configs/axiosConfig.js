import axios from 'axios';

// Configure default axios instance
const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Add start time to config
      config.metadata = { startTime: new Date() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      // Calculate duration
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;

      // Log success
      console.log(
        `%c[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`,
        'color: green; font-weight: bold;',
        `Duration: ${duration}ms`,
        response.status
      );

      return response;
    },
    (error) => {
      // Calculate duration if config exists
      if (error.config && error.config.metadata) {
        const endTime = new Date();
        const duration = endTime - error.config.metadata.startTime;

        // Log error
        console.log(
          `%c[API Error] ${error.config.method.toUpperCase()} ${error.config.url}`,
          'color: red; font-weight: bold;',
          `Duration: ${duration}ms`,
          error.response ? error.response.status : 'Network Error'
        );
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
