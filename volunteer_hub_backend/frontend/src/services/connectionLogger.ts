/**
 * Service Connection Logger
 * 
 * This file wraps axios to log all API calls for debugging FE-BE connection.
 * Import this in pages to see API request/response logs.
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with logging
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

// Request interceptor - logs outgoing requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`📤 [API Request] ${config.method?.toUpperCase()} ${config.url}`);
        console.log('   Headers:', JSON.stringify(config.headers, null, 2));
        if (config.data) {
            console.log('   Body:', JSON.stringify(config.data, null, 2));
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ [API Request Error]', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor - logs responses
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`📥 [API Response] ${response.status} ${response.config.url}`);
        console.log('   Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            console.error(`❌ [API Error] ${error.response.status} ${error.config?.url}`);
            console.error('   Response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error(`❌ [Network Error] No response from ${error.config?.url}`);
        } else {
            console.error('❌ [Error]', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;

/**
 * Test API Connection
 * Call this function to verify FE can reach BE
 */
export async function testConnection(): Promise<{
    success: boolean;
    message: string;
    latency?: number;
    error?: string;
}> {
    const start = Date.now();

    try {
        // Try a simple unauthenticated endpoint first
        const response = await axios.get(`${API_BASE_URL}/api/auth/login`, {
            method: 'OPTIONS',
            timeout: 5000,
        });

        return {
            success: true,
            message: 'Backend is reachable',
            latency: Date.now() - start,
        };
    } catch (error) {
        const axiosError = error as AxiosError;

        // 401/405 means backend is reachable but auth required
        if (axiosError.response?.status === 401 || axiosError.response?.status === 405) {
            return {
                success: true,
                message: 'Backend is reachable (auth required)',
                latency: Date.now() - start,
            };
        }

        return {
            success: false,
            message: 'Cannot reach backend',
            error: axiosError.message,
        };
    }
}

/**
 * Admin API Connection Test Suite
 */
export async function testAdminAPIs(token: string): Promise<{
    endpoint: string;
    method: string;
    status: number | string;
    success: boolean;
    message: string;
}[]> {
    const results: any[] = [];

    const tests = [
        { name: 'Dashboard', method: 'GET', url: '/api/admin/dashboard' },
        { name: 'Export Events', method: 'GET', url: '/api/admin/events/export?format=json' },
        { name: 'Export Volunteers', method: 'GET', url: '/api/admin/volunteers/export?format=json' },
        { name: 'Get Cached Posts', method: 'GET', url: '/api/admin/cache/top-posts' },
        { name: 'Refresh Cache', method: 'PUT', url: '/api/admin/cache/top-posts/refresh' },
    ];

    const headers = { Authorization: `Bearer ${token}` };

    for (const test of tests) {
        try {
            const response = await axios({
                method: test.method,
                url: `${API_BASE_URL}${test.url}`,
                headers,
            });

            results.push({
                endpoint: test.name,
                method: test.method,
                status: response.status,
                success: true,
                message: response.data.message || 'OK',
            });
        } catch (error) {
            const axiosError = error as AxiosError;
            results.push({
                endpoint: test.name,
                method: test.method,
                status: axiosError.response?.status || 'Network Error',
                success: false,
                message: (axiosError.response?.data as any)?.message || axiosError.message,
            });
        }
    }

    return results;
}

/**
 * Print connection test results to console
 */
export function printTestResults(results: any[]) {
    console.log('\n========================================');
    console.log('     FE-BE CONNECTION TEST RESULTS');
    console.log('========================================\n');

    results.forEach(r => {
        const icon = r.success ? '✅' : '❌';
        console.log(`${icon} ${r.method} ${r.endpoint}`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Message: ${r.message}\n`);
    });

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('========================================');
    console.log(`PASSED: ${passed} | FAILED: ${failed}`);
    console.log('========================================\n');
}
