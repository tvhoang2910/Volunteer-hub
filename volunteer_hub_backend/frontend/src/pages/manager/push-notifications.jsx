"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Send,
    Bell,
    Users,
    ShieldAlert,
    BarChart3,
    CheckCircle2,
    XCircle,
    Info,
    RefreshCw,
    Trash2,
    X,
    Search,
    User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pushService, DeliveryStats } from "@/services/pushService";
import { searchService } from "@/services/searchService";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function PushNotificationDashboard() {
    // State for Broadcast Form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [targetType, setTargetType] = useState("all");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]); // Array of {userId, name}
    const [sending, setSending] = useState(false);

    // State for User Search Autocomplete
    const [userSearchKeyword, setUserSearchKeyword] = useState("");
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    // State for Stats
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    const { toast } = useToast();

    // Roles options (chỉ 3 role trong DB: VOLUNTEER, MANAGER, ADMIN)
    const roles = [
        { id: "VOLUNTEER", label: "Volunteer" },
        { id: "MANAGER", label: "Manager" },
        { id: "ADMIN", label: "Admin" }
    ];

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced user search
    const searchUsers = useCallback(async (keyword) => {
        if (!keyword.trim() || keyword.length < 2) {
            setUserSearchResults([]);
            setShowDropdown(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchService.autocompleteUsers(keyword, 10);
            setUserSearchResults(results);
            setShowDropdown(true);
        } catch (error) {
            console.error("Error searching users:", error);
            setUserSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle search input change with debounce
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setUserSearchKeyword(value);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            searchUsers(value);
        }, 300);
    };

    // Add user to selected list
    const addUser = (user) => {
        if (!selectedUsers.find(u => u.userId === user.userId)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setUserSearchKeyword("");
        setUserSearchResults([]);
        setShowDropdown(false);
    };

    // Remove user from selected list
    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u.userId !== userId));
    };

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const data = await pushService.getDeliveryStats();
            setStats(data);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải thống kê delivery",
                variant: "destructive"
            });
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSend = async () => {
        if (!title.trim() || !content.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề và nội dung",
                variant: "destructive"
            });
            return;
        }

        if (targetType === "role" && selectedRoles.length === 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ít nhất một role",
                variant: "destructive"
            });
            return;
        }

        if (targetType === "specific" && selectedUsers.length === 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ít nhất một người nhận",
                variant: "destructive"
            });
            return;
        }

        setSending(true);
        try {
            const payload = {
                title,
                content,
                sendToAll: targetType === "all"
            };

            if (targetType === "role") {
                payload.targetRoles = selectedRoles;
            } else if (targetType === "specific") {
                payload.targetUserIds = selectedUsers.map(u => u.userId);
            }

            const response = await pushService.broadcastNotification(payload);
            toast({
                title: "Thành công",
                description: response.message || "Đã gửi thông báo thành công",
                variant: "success"
            });
            
            // Reset form
            setTitle("");
            setContent("");
            setSelectedUsers([]);
            fetchStats();
            
        } catch (error) {
            toast({
                title: "Lỗi",
                description: error.message || "Gửi thông báo thất bại",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    const handleRetry = async () => {
        try {
            const result = await pushService.retryFailedDeliveries();
            toast({
                title: "Thành công",
                description: result,
                variant: "success"
            });
            fetchStats();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Retry thất bại",
                variant: "destructive"
            });
        }
    };

    const handleCleanup = async () => {
        try {
            const result = await pushService.cleanupInvalidSubscriptions();
            toast({
                title: "Thành công",
                description: result,
                variant: "success"
            });
            fetchStats();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Cleanup thất bại",
                variant: "destructive"
            });
        }
    };

    const toggleRole = (roleId) => {
        setSelectedRoles(prev => 
            prev.includes(roleId) 
                ? prev.filter(r => r !== roleId) 
                : [...prev, roleId]
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Send className="h-8 w-8 text-indigo-600" />
                            Push Notifications
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Gửi thông báo Web Push đến người dùng và theo dõi thống kê.
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchStats} disabled={loadingStats}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Compose Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-indigo-100 shadow-md">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white pb-6">
                                <CardTitle className="text-indigo-900 flex items-center gap-2">
                                    <Bell className="h-5 w-5" /> Soạn thông báo
                                </CardTitle>
                                <CardDescription>Gửi thông báo ngay lập tức đến thiết bị người dùng</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Tiêu đề</Label>
                                    <Input 
                                        id="title" 
                                        placeholder="Nhập tiêu đề thông báo..." 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="border-slate-200 focus-visible:ring-indigo-500"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="content">Nội dung</Label>
                                    <Textarea 
                                        id="content" 
                                        placeholder="Nhập nội dung thông báo..." 
                                        rows={4}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="resize-none border-slate-200 focus-visible:ring-indigo-500"
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <Label>Đối tượng nhận</Label>
                                    <RadioGroup 
                                        defaultValue="all" 
                                        value={targetType} 
                                        onValueChange={(v) => setTargetType(v)}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    >
                                        <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${targetType === 'all' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="all" id="all" />
                                            <Label htmlFor="all" className="cursor-pointer font-medium">Tất cả người dùng</Label>
                                        </div>
                                        <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${targetType === 'role' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="role" id="role" />
                                            <Label htmlFor="role" className="cursor-pointer font-medium">Theo vai trò</Label>
                                        </div>
                                        <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${targetType === 'specific' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                            <RadioGroupItem value="specific" id="specific" />
                                            <Label htmlFor="specific" className="cursor-pointer font-medium">Người dùng cụ thể</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {targetType === 'role' && (
                                    <div className="p-4 bg-slate-50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <Label>Chọn vai trò</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {roles.map(role => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`role-${role.id}`} 
                                                        checked={selectedRoles.includes(role.id)}
                                                        onCheckedChange={() => toggleRole(role.id)}
                                                    />
                                                    <Label htmlFor={`role-${role.id}`} className="font-normal cursor-pointer">
                                                        {role.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {targetType === 'specific' && (
                                    <div className="p-4 bg-slate-50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <Label>Chọn người dùng</Label>
                                        
                                        {/* Selected Users */}
                                        {selectedUsers.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {selectedUsers.map(user => (
                                                    <Badge 
                                                        key={user.userId} 
                                                        variant="secondary" 
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                                    >
                                                        <User className="h-3 w-3" />
                                                        <span>{user.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeUser(user.userId)}
                                                            className="ml-1 hover:bg-indigo-300 rounded-full p-0.5"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* User Search Input */}
                                        <div className="relative" ref={dropdownRef}>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input 
                                                    placeholder="Tìm kiếm người dùng theo tên..." 
                                                    value={userSearchKeyword}
                                                    onChange={handleSearchInputChange}
                                                    onFocus={() => userSearchResults.length > 0 && setShowDropdown(true)}
                                                    className="pl-10 border-slate-200 focus-visible:ring-indigo-500"
                                                />
                                                {isSearching && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Dropdown Results */}
                                            {showDropdown && userSearchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                                    {userSearchResults.map(user => (
                                                        <button
                                                            key={user.userId}
                                                            type="button"
                                                            onClick={() => addUser(user)}
                                                            disabled={selectedUsers.find(u => u.userId === user.userId)}
                                                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
                                                                selectedUsers.find(u => u.userId === user.userId) ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''
                                                            }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{user.name}</p>
                                                                <p className="text-xs text-slate-500">ID: {user.userId}</p>
                                                            </div>
                                                            {selectedUsers.find(u => u.userId === user.userId) && (
                                                                <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* No results message */}
                                            {showDropdown && userSearchKeyword.length >= 2 && userSearchResults.length === 0 && !isSearching && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-slate-500">
                                                    Không tìm thấy người dùng nào
                                                </div>
                                            )}
                                        </div>
                                        
                                        <p className="text-xs text-slate-500">
                                            Nhập ít nhất 2 ký tự để tìm kiếm. Đã chọn: {selectedUsers.length} người dùng
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 flex justify-end p-6">
                                <Button 
                                    size="lg" 
                                    onClick={handleSend} 
                                    disabled={sending}
                                    className="bg-indigo-600 hover:bg-indigo-700 min-w-[150px]"
                                >
                                    {sending ? (
                                        <>sending...</>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" /> Gửi thông báo
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Right Column: Stats & Actions */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-600" /> Thống kê gửi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-emerald-700">{stats?.successCount || 0}</div>
                                        <div className="text-xs text-emerald-600 font-medium uppercase">Thành công</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-700">{stats?.failedCount || 0}</div>
                                        <div className="text-xs text-red-600 font-medium uppercase">Thất bại</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 pt-2 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Tổng số đã gửi:</span>
                                        <span className="font-semibold">{stats?.totalSent || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-amber-600">
                                        <span>Lỗi Subscription (410):</span>
                                        <span>{stats?.invalidSubscriptionCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-orange-600">
                                        <span>Rate Limited (429):</span>
                                        <span>{stats?.rateLimitedCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Lỗi mạng:</span>
                                        <span>{stats?.networkErrorCount || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Maintenance Actions */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" /> Bảo trì hệ thống
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200"
                                    onClick={handleRetry}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Retry Failed (Gửi lại lỗi)
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200"
                                    onClick={handleCleanup}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Cleanup Invalid (Dọn dẹp)
                                </Button>
                            </CardContent>
                        </Card>

                         <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="p-4 flex gap-3 text-sm text-blue-800">
                                <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                <p>
                                    Hệ thống sử dụng VAPID key để xác thực. Đảm bảo application.properties đã cấu hình đúng public/private key.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
