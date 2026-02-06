/**
 * Admin API Test Page
 * 
 * Navigate to /admin/api-test to run integration tests
 * Requires ADMIN login
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Inline test runner (avoiding import issues)
async function runTests(token) {
    const results = [];

    const getAuthHeader = () => ({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    });

    const tests = [
        {
            name: 'Backend Connection',
            method: 'GET',
            endpoint: '/api/auth/login',
            expectError: true, // 401 is OK
        },
        {
            name: 'Admin Dashboard',
            method: 'GET',
            endpoint: '/api/admin/dashboard',
            requiresAuth: true,
            validateResponse: (data) => {
                const d = data?.data || data;
                const required = ['totalEvents', 'approvedEvents', 'pendingEvents', 'totalVolunteers'];
                const missing = required.filter(f => !(f in d));
                return missing.length === 0 ? null : `Missing: ${missing.join(', ')}`;
            }
        },
        {
            name: 'Get All Events (Admin)',
            method: 'GET',
            endpoint: '/api/admin/events',
            requiresAuth: true,
            validateResponse: (data) => {
                const events = data?.data || data || [];
                if (!Array.isArray(events)) return 'Response is not an array';
                if (events.length > 0) {
                    const e = events[0];
                    if (!e.id || !e.title) return 'Event missing id/title';
                }
                return null;
            }
        },
        {
            name: 'Get All Users (Admin)',
            method: 'GET',
            endpoint: '/api/admin/users?page=1&limit=10',
            requiresAuth: true,
            validateResponse: (data) => {
                const users = data?.data || data || [];
                if (!Array.isArray(users)) return 'Response is not an array';
                if (users.length > 0) {
                    const u = users[0];
                    if (!u.id || !u.email) return 'User missing id/email';
                }
                return null;
            }
        },
        {
            name: 'Get Users by Role (MANAGER)',
            method: 'GET',
            endpoint: '/api/admin/users?role=MANAGER',
            requiresAuth: true,
        },
        {
            name: 'Export Events (JSON)',
            method: 'GET',
            endpoint: '/api/admin/events/export?format=json',
            requiresAuth: true,
        },
        {
            name: 'Export Volunteers (JSON)',
            method: 'GET',
            endpoint: '/api/admin/volunteers/export?format=json',
            requiresAuth: true,
        },
        {
            name: 'Get Cached Top Posts',
            method: 'GET',
            endpoint: '/api/admin/cache/top-posts',
            requiresAuth: true,
        },
        {
            name: 'Refresh Top Posts Cache',
            method: 'PUT',
            endpoint: '/api/admin/cache/top-posts/refresh',
            requiresAuth: true,
        },
        {
            name: 'Invalidate Top Posts Cache',
            method: 'PUT',
            endpoint: '/api/admin/cache/top-posts/invalidate',
            requiresAuth: true,
        },
        {
            name: 'Rebuild Post Ranking',
            method: 'PUT',
            endpoint: '/api/admin/cache/top-posts/rebuild-ranking',
            requiresAuth: true,
        },
        {
            name: 'Get Admin Role Requests (PENDING)',
            method: 'GET',
            endpoint: '/api/admin/admin-requests?status=PENDING',
            requiresAuth: true,
        },
        {
            name: 'Get Admin Role Requests (APPROVED)',
            method: 'GET',
            endpoint: '/api/admin/admin-requests?status=APPROVED',
            requiresAuth: true,
        },
    ];

    for (const test of tests) {
        const startTime = Date.now();
        try {
            const config = {
                method: test.method,
                headers: test.requiresAuth ? getAuthHeader() : {},
            };

            const response = await fetch(`${API_BASE_URL}${test.endpoint}`, config);
            const duration = Date.now() - startTime;

            let data = null;
            try {
                data = await response.json();
            } catch { }

            if (test.expectError && (response.status === 401 || response.status === 405)) {
                results.push({
                    ...test,
                    status: 'PASS',
                    statusCode: response.status,
                    message: '✅ Backend reachable',
                    duration
                });
                continue;
            }

            if (!response.ok) {
                results.push({
                    ...test,
                    status: 'FAIL',
                    statusCode: response.status,
                    message: `❌ HTTP ${response.status}: ${data?.message || response.statusText}`,
                    error: data?.detail || data?.message,
                    duration
                });
                continue;
            }

            // Validate response if validator provided
            if (test.validateResponse) {
                const validationError = test.validateResponse(data);
                if (validationError) {
                    results.push({
                        ...test,
                        status: 'FAIL',
                        statusCode: response.status,
                        message: `❌ Validation failed: ${validationError}`,
                        responseData: data,
                        duration
                    });
                    continue;
                }
            }

            results.push({
                ...test,
                status: 'PASS',
                statusCode: response.status,
                message: `✅ ${data?.message || 'OK'}`,
                responseData: data,
                duration
            });

        } catch (error) {
            const duration = Date.now() - startTime;
            results.push({
                ...test,
                status: 'FAIL',
                message: `❌ Network error: ${error.message}`,
                error: error.message,
                duration
            });
        }
    }

    return results;
}

export default function AdminApiTestPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const handleRunTests = async () => {
        if (!token) {
            alert('No token found. Please login as ADMIN first.');
            return;
        }

        setLoading(true);
        setResults([]);

        try {
            const testResults = await runTests(token);
            setResults(testResults);
        } catch (error) {
            console.error('Test error:', error);
            setResults([{ name: 'Error', status: 'FAIL', message: error.message }]);
        } finally {
            setLoading(false);
        }
    };

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        🧪 Admin API Integration Tests
                    </h1>

                    <p className="text-gray-600 mb-4">
                        Test the connection between Frontend and Backend for Admin APIs.
                        Make sure you are logged in as ADMIN before running tests.
                    </p>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>API Base URL:</strong> {API_BASE_URL}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Token:</strong> {token ? `${token.substring(0, 30)}...` : 'Not found'}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>User:</strong> {user?.email || 'Not logged in'}
                        </p>
                    </div>

                    <button
                        onClick={handleRunTests}
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? '🔄 Running Tests...' : '▶️ Run All Tests'}
                    </button>

                    {results.length > 0 && (
                        <>
                            {/* Summary */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h2 className="text-lg font-semibold mb-2">Summary</h2>
                                <div className="flex gap-4">
                                    <span className="text-green-600">✅ Passed: {passed}</span>
                                    <span className="text-red-600">❌ Failed: {failed}</span>
                                    <span className="text-gray-600">Total: {results.length}</span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all"
                                        style={{ width: `${(passed / results.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold mb-2">Test Results</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="p-2 text-left">Status</th>
                                                <th className="p-2 text-left">Test Name</th>
                                                <th className="p-2 text-left">Endpoint</th>
                                                <th className="p-2 text-left">HTTP</th>
                                                <th className="p-2 text-left">Time</th>
                                                <th className="p-2 text-left">Message</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={`border-b ${result.status === 'FAIL'
                                                            ? 'bg-red-50'
                                                            : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="p-2">
                                                        {result.status === 'PASS' ? '✅' : '❌'}
                                                    </td>
                                                    <td className="p-2 font-medium">{result.name}</td>
                                                    <td className="p-2 text-gray-600 font-mono text-xs">
                                                        {result.method} {result.endpoint}
                                                    </td>
                                                    <td className="p-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${result.statusCode === 200
                                                                ? 'bg-green-100 text-green-800'
                                                                : result.statusCode >= 400
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100'
                                                            }`}>
                                                            {result.statusCode || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-gray-500">
                                                        {result.duration}ms
                                                    </td>
                                                    <td className="p-2 text-gray-600">
                                                        {result.message?.substring(0, 50)}
                                                        {result.message?.length > 50 ? '...' : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Failed Tests Details */}
                            {failed > 0 && (
                                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                                        ❌ Failed Tests Details
                                    </h2>
                                    {results
                                        .filter(r => r.status === 'FAIL')
                                        .map((result, idx) => (
                                            <div key={idx} className="mb-4 p-3 bg-white rounded border border-red-200">
                                                <p className="font-semibold text-red-700">{result.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Endpoint:</strong> {result.method} {result.endpoint}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Status:</strong> {result.statusCode || 'N/A'}
                                                </p>
                                                <p className="text-sm text-red-600">
                                                    <strong>Error:</strong> {result.error || result.message}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Quick Links */}
                    <div className="mt-6 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                            Quick Links:
                            <button
                                onClick={() => router.push('/admin')}
                                className="ml-2 text-blue-600 hover:underline"
                            >
                                Admin Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="ml-2 text-blue-600 hover:underline"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
