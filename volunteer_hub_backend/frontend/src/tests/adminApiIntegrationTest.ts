/**
 * @file adminApiIntegrationTest.ts
 * @description Integration tests for Admin API endpoints
 * 
 * This file tests the connection between Frontend services and Backend APIs
 * Run these tests after merging code to verify FE-BE compatibility
 * 
 * Usage:
 * 1. Start backend server (port 8080)
 * 2. Login as ADMIN to get token
 * 3. Call runAllTests(token) from browser console or a test page
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface TestResult {
    testName: string;
    endpoint: string;
    method: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    statusCode?: number;
    message: string;
    responseData?: any;
    error?: string;
    duration: number;
}

interface TestSummary {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    results: TestResult[];
    timestamp: string;
}

const getAuthHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
});

/**
 * Helper function to execute a test
 */
async function executeTest(
    testName: string,
    method: string,
    endpoint: string,
    token: string,
    options: {
        data?: any;
        params?: any;
        expectedStatus?: number;
        skipIfNoData?: boolean;
    } = {}
): Promise<TestResult> {
    const startTime = Date.now();
    const fullUrl = `${API_BASE_URL}${endpoint}`;

    try {
        const config: any = {
            method,
            url: fullUrl,
            headers: getAuthHeader(token),
        };

        if (options.data) config.data = options.data;
        if (options.params) config.params = options.params;

        const response = await axios(config);
        const duration = Date.now() - startTime;

        const expectedStatus = options.expectedStatus || 200;
        const passed = response.status === expectedStatus;

        return {
            testName,
            endpoint,
            method,
            status: passed ? 'PASS' : 'FAIL',
            statusCode: response.status,
            message: passed
                ? `✅ Response: ${response.data?.message || 'OK'}`
                : `❌ Expected ${expectedStatus}, got ${response.status}`,
            responseData: response.data,
            duration
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        const axiosError = error as AxiosError;

        // 401/403 means auth issue, not endpoint issue
        if (axiosError.response?.status === 401) {
            return {
                testName,
                endpoint,
                method,
                status: 'FAIL',
                statusCode: 401,
                message: '❌ Unauthorized - Token invalid or expired',
                error: 'AUTH_FAILED',
                duration
            };
        }

        if (axiosError.response?.status === 403) {
            return {
                testName,
                endpoint,
                method,
                status: 'FAIL',
                statusCode: 403,
                message: '❌ Forbidden - User does not have ADMIN role',
                error: 'FORBIDDEN',
                duration
            };
        }

        // 404 means endpoint doesn't exist - likely a merge conflict
        if (axiosError.response?.status === 404) {
            return {
                testName,
                endpoint,
                method,
                status: 'FAIL',
                statusCode: 404,
                message: '❌ Endpoint not found - Check if route exists in backend',
                error: 'NOT_FOUND',
                duration
            };
        }

        // 500 means server error - check backend logs
        if (axiosError.response?.status === 500) {
            return {
                testName,
                endpoint,
                method,
                status: 'FAIL',
                statusCode: 500,
                message: '❌ Server error - Check backend logs',
                error: (axiosError.response?.data as any)?.detail || axiosError.message,
                duration
            };
        }

        // Network error
        if (!axiosError.response) {
            return {
                testName,
                endpoint,
                method,
                status: 'FAIL',
                message: '❌ Network error - Backend not reachable',
                error: axiosError.message,
                duration
            };
        }

        return {
            testName,
            endpoint,
            method,
            status: 'FAIL',
            statusCode: axiosError.response?.status,
            message: `❌ Error: ${axiosError.message}`,
            error: (axiosError.response?.data as any)?.message || axiosError.message,
            duration
        };
    }
}

/**
 * Test 1: Admin Dashboard
 */
async function testAdminDashboard(token: string): Promise<TestResult> {
    return executeTest(
        'Admin Dashboard',
        'GET',
        '/api/admin/dashboard',
        token
    );
}

/**
 * Test 2: Get All Events (Admin)
 */
async function testGetAllEvents(token: string): Promise<TestResult> {
    return executeTest(
        'Get All Events (Admin)',
        'GET',
        '/api/admin/events',
        token
    );
}

/**
 * Test 3: Get All Users (Admin)
 */
async function testGetAllUsers(token: string): Promise<TestResult> {
    return executeTest(
        'Get All Users',
        'GET',
        '/api/admin/users',
        token,
        { params: { page: 1, limit: 10 } }
    );
}

/**
 * Test 4: Get Users by Role
 */
async function testGetUsersByRole(token: string): Promise<TestResult> {
    return executeTest(
        'Get Users by Role (VOLUNTEER)',
        'GET',
        '/api/admin/users',
        token,
        { params: { role: 'VOLUNTEER' } }
    );
}

/**
 * Test 5: Export Events (JSON)
 */
async function testExportEventsJson(token: string): Promise<TestResult> {
    return executeTest(
        'Export Events (JSON)',
        'GET',
        '/api/admin/events/export',
        token,
        { params: { format: 'json' } }
    );
}

/**
 * Test 6: Export Volunteers (JSON)
 */
async function testExportVolunteersJson(token: string): Promise<TestResult> {
    return executeTest(
        'Export Volunteers (JSON)',
        'GET',
        '/api/admin/volunteers/export',
        token,
        { params: { format: 'json' } }
    );
}

/**
 * Test 7: Get Cached Top Posts
 */
async function testGetCachedTopPosts(token: string): Promise<TestResult> {
    return executeTest(
        'Get Cached Top Posts',
        'GET',
        '/api/admin/cache/top-posts',
        token
    );
}

/**
 * Test 8: Refresh Top Posts Cache
 */
async function testRefreshTopPostsCache(token: string): Promise<TestResult> {
    return executeTest(
        'Refresh Top Posts Cache',
        'PUT',
        '/api/admin/cache/top-posts/refresh',
        token
    );
}

/**
 * Test 9: Invalidate Top Posts Cache
 */
async function testInvalidateTopPostsCache(token: string): Promise<TestResult> {
    return executeTest(
        'Invalidate Top Posts Cache',
        'PUT',
        '/api/admin/cache/top-posts/invalidate',
        token
    );
}

/**
 * Test 10: Rebuild Post Ranking
 */
async function testRebuildPostRanking(token: string): Promise<TestResult> {
    return executeTest(
        'Rebuild Post Ranking',
        'PUT',
        '/api/admin/cache/top-posts/rebuild-ranking',
        token
    );
}

/**
 * Test 11: Get Admin Role Requests
 */
async function testGetAdminRoleRequests(token: string): Promise<TestResult> {
    return executeTest(
        'Get Admin Role Requests (PENDING)',
        'GET',
        '/api/admin/admin-requests',
        token,
        { params: { status: 'PENDING' } }
    );
}

/**
 * Test 12: Get All Admin Role Requests (All statuses)
 */
async function testGetAllAdminRoleRequests(token: string): Promise<TestResult> {
    const results: TestResult[] = [];

    for (const status of ['PENDING', 'APPROVED', 'REJECTED']) {
        const result = await executeTest(
            `Get Admin Role Requests (${status})`,
            'GET',
            '/api/admin/admin-requests',
            token,
            { params: { status } }
        );
        results.push(result);
    }

    // Return summary
    const allPassed = results.every(r => r.status === 'PASS');
    return {
        testName: 'Get Admin Role Requests (All Statuses)',
        endpoint: '/api/admin/admin-requests',
        method: 'GET',
        status: allPassed ? 'PASS' : 'FAIL',
        message: allPassed
            ? '✅ All status filters work correctly'
            : '❌ Some status filters failed',
        duration: results.reduce((sum, r) => sum + r.duration, 0)
    };
}

/**
 * Test 13: Verify Response Structure - Dashboard
 */
async function testDashboardResponseStructure(token: string): Promise<TestResult> {
    const startTime = Date.now();
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
            headers: getAuthHeader(token)
        });

        const data = response.data?.data || response.data;
        const requiredFields = ['totalEvents', 'approvedEvents', 'pendingEvents', 'totalVolunteers', 'totalRegistrations'];
        const missingFields = requiredFields.filter(f => !(f in data));

        if (missingFields.length > 0) {
            return {
                testName: 'Dashboard Response Structure',
                endpoint: '/api/admin/dashboard',
                method: 'GET',
                status: 'FAIL',
                message: `❌ Missing fields: ${missingFields.join(', ')}`,
                responseData: data,
                duration: Date.now() - startTime
            };
        }

        return {
            testName: 'Dashboard Response Structure',
            endpoint: '/api/admin/dashboard',
            method: 'GET',
            status: 'PASS',
            message: '✅ All required fields present',
            responseData: data,
            duration: Date.now() - startTime
        };
    } catch (error) {
        return {
            testName: 'Dashboard Response Structure',
            endpoint: '/api/admin/dashboard',
            method: 'GET',
            status: 'FAIL',
            message: '❌ Failed to fetch dashboard',
            error: (error as Error).message,
            duration: Date.now() - startTime
        };
    }
}

/**
 * Test 14: Verify Response Structure - Events
 */
async function testEventsResponseStructure(token: string): Promise<TestResult> {
    const startTime = Date.now();
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/events`, {
            headers: getAuthHeader(token)
        });

        const events = response.data?.data || response.data || [];

        if (!Array.isArray(events)) {
            return {
                testName: 'Events Response Structure',
                endpoint: '/api/admin/events',
                method: 'GET',
                status: 'FAIL',
                message: '❌ Response data is not an array',
                duration: Date.now() - startTime
            };
        }

        if (events.length > 0) {
            const firstEvent = events[0];
            const requiredFields = ['id', 'title', 'adminApprovalStatus', 'createdBy'];
            const missingFields = requiredFields.filter(f => !(f in firstEvent));

            if (missingFields.length > 0) {
                return {
                    testName: 'Events Response Structure',
                    endpoint: '/api/admin/events',
                    method: 'GET',
                    status: 'FAIL',
                    message: `❌ Missing fields in event: ${missingFields.join(', ')}`,
                    responseData: firstEvent,
                    duration: Date.now() - startTime
                };
            }
        }

        return {
            testName: 'Events Response Structure',
            endpoint: '/api/admin/events',
            method: 'GET',
            status: 'PASS',
            message: `✅ Valid structure (${events.length} events)`,
            duration: Date.now() - startTime
        };
    } catch (error) {
        return {
            testName: 'Events Response Structure',
            endpoint: '/api/admin/events',
            method: 'GET',
            status: 'FAIL',
            message: '❌ Failed to fetch events',
            error: (error as Error).message,
            duration: Date.now() - startTime
        };
    }
}

/**
 * Test 15: Verify Response Structure - Users
 */
async function testUsersResponseStructure(token: string): Promise<TestResult> {
    const startTime = Date.now();
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            headers: getAuthHeader(token)
        });

        const users = response.data?.data || response.data || [];

        if (!Array.isArray(users)) {
            return {
                testName: 'Users Response Structure',
                endpoint: '/api/admin/users',
                method: 'GET',
                status: 'FAIL',
                message: '❌ Response data is not an array',
                duration: Date.now() - startTime
            };
        }

        if (users.length > 0) {
            const firstUser = users[0];
            const requiredFields = ['id', 'email', 'name', 'role', 'isActive'];
            const missingFields = requiredFields.filter(f => !(f in firstUser));

            if (missingFields.length > 0) {
                return {
                    testName: 'Users Response Structure',
                    endpoint: '/api/admin/users',
                    method: 'GET',
                    status: 'FAIL',
                    message: `❌ Missing fields in user: ${missingFields.join(', ')}`,
                    responseData: firstUser,
                    duration: Date.now() - startTime
                };
            }
        }

        return {
            testName: 'Users Response Structure',
            endpoint: '/api/admin/users',
            method: 'GET',
            status: 'PASS',
            message: `✅ Valid structure (${users.length} users)`,
            duration: Date.now() - startTime
        };
    } catch (error) {
        return {
            testName: 'Users Response Structure',
            endpoint: '/api/admin/users',
            method: 'GET',
            status: 'FAIL',
            message: '❌ Failed to fetch users',
            error: (error as Error).message,
            duration: Date.now() - startTime
        };
    }
}

/**
 * Test backend connection before running tests
 */
async function testBackendConnection(): Promise<TestResult> {
    const startTime = Date.now();
    try {
        await axios.get(`${API_BASE_URL}/api/auth/login`, { timeout: 5000 });
        return {
            testName: 'Backend Connection',
            endpoint: API_BASE_URL,
            method: 'GET',
            status: 'PASS',
            statusCode: 200,
            message: '✅ Backend is reachable',
            duration: Date.now() - startTime
        };
    } catch (error) {
        const axiosError = error as AxiosError;
        // 401/405 means backend is up
        if (axiosError.response?.status === 401 || axiosError.response?.status === 405) {
            return {
                testName: 'Backend Connection',
                endpoint: API_BASE_URL,
                method: 'GET',
                status: 'PASS',
                statusCode: axiosError.response.status,
                message: '✅ Backend is reachable',
                duration: Date.now() - startTime
            };
        }
        return {
            testName: 'Backend Connection',
            endpoint: API_BASE_URL,
            method: 'GET',
            status: 'FAIL',
            message: '❌ Cannot connect to backend',
            error: axiosError.message,
            duration: Date.now() - startTime
        };
    }
}

/**
 * Run all admin API tests
 */
export async function runAllAdminTests(token: string): Promise<TestSummary> {
    console.log('\n========================================');
    console.log('   ADMIN API INTEGRATION TEST SUITE');
    console.log('========================================\n');

    const results: TestResult[] = [];

    // Pre-check: Backend connection
    console.log('🔌 Checking backend connection...');
    const connectionTest = await testBackendConnection();
    results.push(connectionTest);

    if (connectionTest.status === 'FAIL') {
        console.error('❌ Backend not reachable. Aborting tests.');
        return {
            total: 1,
            passed: 0,
            failed: 1,
            skipped: 0,
            results,
            timestamp: new Date().toISOString()
        };
    }

    console.log('✅ Backend connected\n');

    // Run all tests
    const tests = [
        { name: 'Dashboard', fn: testAdminDashboard },
        { name: 'Dashboard Structure', fn: testDashboardResponseStructure },
        { name: 'Get All Events', fn: testGetAllEvents },
        { name: 'Events Structure', fn: testEventsResponseStructure },
        { name: 'Get All Users', fn: testGetAllUsers },
        { name: 'Users Structure', fn: testUsersResponseStructure },
        { name: 'Get Users by Role', fn: testGetUsersByRole },
        { name: 'Export Events (JSON)', fn: testExportEventsJson },
        { name: 'Export Volunteers (JSON)', fn: testExportVolunteersJson },
        { name: 'Get Cached Top Posts', fn: testGetCachedTopPosts },
        { name: 'Refresh Cache', fn: testRefreshTopPostsCache },
        { name: 'Invalidate Cache', fn: testInvalidateTopPostsCache },
        { name: 'Rebuild Ranking', fn: testRebuildPostRanking },
        { name: 'Admin Role Requests', fn: testGetAdminRoleRequests },
        { name: 'Admin Requests (All)', fn: testGetAllAdminRoleRequests },
    ];

    for (const test of tests) {
        console.log(`🧪 Testing: ${test.name}...`);
        const result = await test.fn(token);
        results.push(result);
        console.log(`   ${result.message} (${result.duration}ms)`);
    }

    // Summary
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;

    console.log('\n========================================');
    console.log('            TEST SUMMARY');
    console.log('========================================');
    console.log(`Total:   ${results.length}`);
    console.log(`Passed:  ${passed} ✅`);
    console.log(`Failed:  ${failed} ❌`);
    console.log(`Skipped: ${skipped} ⏭️`);
    console.log('========================================\n');

    // Print failed tests details
    if (failed > 0) {
        console.log('❌ FAILED TESTS DETAILS:');
        console.log('------------------------');
        results
            .filter(r => r.status === 'FAIL')
            .forEach(r => {
                console.log(`\n${r.testName}`);
                console.log(`  Endpoint: ${r.method} ${r.endpoint}`);
                console.log(`  Status: ${r.statusCode || 'N/A'}`);
                console.log(`  Error: ${r.error || r.message}`);
            });
    }

    return {
        total: results.length,
        passed,
        failed,
        skipped,
        results,
        timestamp: new Date().toISOString()
    };
}

/**
 * Quick test for specific endpoint
 */
export async function quickTest(token: string, endpoint: string, method: string = 'GET'): Promise<TestResult> {
    return executeTest(`Quick Test: ${endpoint}`, method, endpoint, token);
}

/**
 * Export for browser console usage
 */
if (typeof window !== 'undefined') {
    (window as any).adminTests = {
        runAll: runAllAdminTests,
        quick: quickTest,
        testDashboard: testAdminDashboard,
        testEvents: testGetAllEvents,
        testUsers: testGetAllUsers,
    };
    console.log('🧪 Admin API Tests loaded. Use window.adminTests.runAll(token) to run tests.');
}

export default {
    runAllAdminTests,
    quickTest,
    testBackendConnection,
    testAdminDashboard,
    testGetAllEvents,
    testGetAllUsers,
    testDashboardResponseStructure,
    testEventsResponseStructure,
    testUsersResponseStructure,
};
