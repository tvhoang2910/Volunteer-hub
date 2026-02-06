# 🔐 Security Migration Guide

## Tóm Tắt Các Thay Đổi

Dự án đã được cập nhật với các cải tiến bảo mật toàn diện. Dưới đây là hướng dẫn chi tiết về những gì đã thay đổi và cách cấu hình.

---

## 🆕 Files Mới

### 1. `GlobalExceptionHandler.java`
**Đường dẫn**: `src/main/java/.../config/GlobalExceptionHandler.java`

**Chức năng**: Xử lý tất cả exceptions toàn cục
- Không leak stack trace ra client
- Audit logging cho security events
- Response format thống nhất

### 2. `.env.example`
**Chức năng**: Template cho environment variables production
```bash
# Copy và cấu hình:
cp .env.example .env
# Sau đó điền các giá trị thực vào .env
```

### 3. `SECURITY_GUIDE.md`
**Chức năng**: Tài liệu đầy đủ về các biện pháp bảo mật đã áp dụng

---

## 📝 Files Đã Sửa Đổi

### 1. **application.properties** ⚠️ QUAN TRỌNG
**Thay đổi**: Di chuyển secrets sang environment variables

**Trước**:
```properties
jwt.secret=hardcoded-secret-key
spring.mail.password=plaintext-password
```

**Sau**:
```properties
jwt.secret=${JWT_SECRET}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
```

**Action Required**:
```bash
# Development - Set trong environment hoặc dùng default trong application-dev.properties
export JWT_SECRET=devSecretKey12345678901234567890123456789012

# Production - BẮT BUỘC set environment variables
export JWT_SECRET=$(openssl rand -base64 32)
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

---

### 2. **SecurityConfig.java**
**Thay đổi**:
1. ✅ Thêm security headers (CSP, X-Frame-Options, X-XSS-Protection...)
2. ✅ Yêu cầu ADMIN role cho `/api/admin/**`

**Không cần thay đổi code**, nhưng kiểm tra:
- Frontend URL trong CSP policy
- CORS allowed origins

---

### 3. **AdminAPI.java**
**Thay đổi**: Bật `@PreAuthorize("hasRole('ADMIN')")` cho tất cả endpoints

**Impact**: Tất cả admin endpoints giờ yêu cầu JWT token với role=ADMIN
- Test admin functions với token có ADMIN role
- Non-admin users sẽ nhận 403 Forbidden

---

### 4. **AuthAPI.java**
**Thay đổi**:
1. ✅ Thêm rate limiting cho `/login`
2. ✅ Audit logging với IP address
3. ✅ Reset rate limit sau login thành công

**Impact**: 
- Sau 5 lần login thất bại → lockout 30 phút
- Mọi login attempt được log với IP

---

### 5. **RateLimitService.java** & **RateLimitServiceImpl.java**
**Thay đổi**: Thêm methods cho login rate limiting
```java
boolean checkLoginRateLimit(String identifier);
void resetLoginRateLimit(String identifier);
```

**Config**:
```properties
rate-limit.login.max-attempts=5
rate-limit.login.window-minutes=15
rate-limit.login.lockout-minutes=30
```

---

### 6. **OAuth2AuthenticationSuccessHandler.java**
**Thay đổi**: Cookie bây giờ có `HttpOnly`, `Secure`, `SameSite=Lax`

**Impact**: 
- Cookie chỉ hoạt động qua HTTPS trong production
- Phải enable SSL/TLS cho production

---

### 7. **UIController.java**
**Thay đổi**: Tương tự OAuth2Handler - secure cookies

---

### 8. **.gitignore**
**Thay đổi**: Thêm ignore cho `.env` files
```
.env
.env.local
*.env
application-local.properties
```

---

## 🚀 Migration Steps

### Bước 1: Pull Code Mới
```bash
git pull origin main
```

### Bước 2: Cài Đặt Dependencies (nếu có thay đổi)
```bash
mvn clean install
```

### Bước 3: Setup Environment Variables

#### Development
Tạo file `.env` hoặc set trong IDE:
```bash
export JWT_SECRET=devSecretKey12345678901234567890123456789012
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

Hoặc sử dụng default trong `application-dev.properties`.

#### Production
**BẮT BUỘC** set tất cả variables:
```bash
# Tạo .env từ template
cp .env.example .env

# Sửa .env với giá trị thực
nano .env

# Source environment variables
source .env
```

### Bước 4: Update Database (nếu cần)
```bash
# Kiểm tra JPA có update schema tự động không
# Nếu không, chạy migration scripts nếu có
```

### Bước 5: Test Application
```bash
# Chạy tests
mvn test

# Khởi động application
mvn spring-boot:run
```

### Bước 6: Verify Security Features

#### Test Rate Limiting
```bash
# Thử login 6 lần với sai password
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' 
done
# Lần thứ 6 phải return 429 Too Many Requests
```

#### Test Admin Authorization
```bash
# Login với non-admin user
TOKEN="non-admin-jwt-token"

# Try access admin endpoint (should return 403)
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Security Headers
```bash
curl -I http://localhost:8080/api/auth/login
# Check response headers cho:
# - X-Frame-Options: SAMEORIGIN
# - X-Content-Type-Options: nosniff
# - Content-Security-Policy: ...
```

---

## ⚠️ Breaking Changes

### 1. Admin Endpoints Authorization
**Impact**: Admin endpoints giờ yêu cầu ADMIN role

**Fix**: Đảm bảo admin users có role='ADMIN' trong database
```sql
-- Check roles
SELECT u.email, r.role_name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id;

-- Add ADMIN role nếu cần
INSERT INTO user_roles (user_id, role_id) 
VALUES (
  (SELECT id FROM users WHERE email = 'admin@example.com'),
  (SELECT id FROM roles WHERE role_name = 'ADMIN')
);
```

### 2. Secure Cookies Require HTTPS
**Impact**: Cookies với `Secure` flag chỉ hoạt động qua HTTPS

**Fix Development**:
- Disable `Secure` flag cho local dev (comment out `.setSecure(true)`)
- Hoặc dùng self-signed certificate

**Fix Production**:
- Setup SSL/TLS certificate (Let's Encrypt, CloudFlare, etc.)
- Cấu hình Spring Boot SSL:
```properties
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=your-password
server.ssl.key-store-type=PKCS12
server.port=8443
```

### 3. JWT Secret Required
**Impact**: Application không start nếu thiếu `JWT_SECRET`

**Fix**:
```bash
# Development
export JWT_SECRET=devSecretKey12345678901234567890123456789012

# Production (generate secure random)
export JWT_SECRET=$(openssl rand -base64 32)
```

---

## 🔍 Troubleshooting

### Issue: Application không start - "JWT_SECRET not found"
**Solution**:
```bash
# Check environment
echo $JWT_SECRET

# Set nếu chưa có
export JWT_SECRET=$(openssl rand -base64 32)
```

### Issue: Admin endpoints return 403
**Solution**:
1. Check JWT token có role ADMIN không:
```bash
# Decode JWT tại jwt.io hoặc:
echo "your-token" | cut -d'.' -f2 | base64 -d
```

2. Update user role trong DB nếu cần.

### Issue: Rate limit quá nghiêm ngặt khi test
**Solution**: Giảm tạm thời trong development
```properties
rate-limit.login.max-attempts=100
rate-limit.login.window-minutes=1
```

### Issue: Redis connection error
**Solution**:
```bash
# Check Redis running
redis-cli ping
# Should return: PONG

# Start Redis nếu chưa chạy
redis-server
```

---

## 📊 Monitoring Recommendations

### 1. Log Monitoring
Theo dõi audit logs cho:
```
🔒 AUTH_FAILURE
🔒 BAD_CREDENTIALS
🚫 ACCESS_DENIED
🔒 LOGIN_BLOCKED
🔒 LOGIN_LOCKOUT
```

### 2. Metrics
- Login success/failure rate
- Rate limit hits
- 403/401 response rate

### 3. Alerts
Setup alerts cho:
- Spike in failed logins từ cùng IP
- Multiple lockouts
- Unusual admin access patterns

---

## 📞 Support

Nếu gặp vấn đề:
1. Check `SECURITY_GUIDE.md` cho chi tiết
2. Review logs trong `logs/` folder
3. Check audit logs với keyword "AUDIT"

---

**Migration Date**: 2025-12-15  
**Version**: 1.0  
**Author**: Security Enhancement Team
