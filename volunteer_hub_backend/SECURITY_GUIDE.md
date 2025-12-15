# 🔒 Security Implementation Guide

Tài liệu này mô tả các biện pháp bảo mật đã được áp dụng cho Volunteer Hub Backend.

## ✅ Đã Áp Dụng

### 1. Xác Thực & Quản Lý Phiên (Authentication & Session Management)

#### JWT-based Authentication
- ✅ **JWT Secret từ Environment Variable**: Không hardcode secret trong code
  - Config: `jwt.secret=${JWT_SECRET}` trong `application.properties`
  - Development: Set trong `application-dev.properties`
  - Production: **BẮT BUỘC** set biến môi trường `JWT_SECRET`

#### Secure Cookie
- ✅ **HttpOnly**: Cookie không thể truy cập từ JavaScript (chống XSS)
- ✅ **Secure**: Cookie chỉ được gửi qua HTTPS
- ✅ **SameSite=Lax**: Chống CSRF attacks
- Áp dụng tại:
  - `OAuth2AuthenticationSuccessHandler.java` (line 91-102)
  - `UIController.java` (line 73-85)

#### Mật Khẩu
- ✅ **BCrypt hashing**: Strength factor = 12 (`SecurityConfig.java`)
- ✅ **Password validation**: 
  - Tối thiểu 8 ký tự
  - Ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt
  - Validation trong `RegistrationRequest.java` và `ResetPasswordRequest.java`

---

### 2. Phân Quyền (Authorization)

#### Role-Based Access Control (RBAC)
- ✅ **@EnableMethodSecurity**: Bật trong `SecurityConfig.java`
- ✅ **@PreAuthorize**: Tất cả admin endpoints yêu cầu `hasRole('ADMIN')`
  - `AdminAPI.java`: Tất cả endpoints đã được bảo vệ
  - `/api/admin/**` route yêu cầu ADMIN role trong `SecurityConfig.java`

---

### 3. Rate Limiting & Chống Brute-Force

#### Login Rate Limiting
- ✅ **Rate limit cho login**: 5 lần thất bại / 15 phút
- ✅ **Account lockout**: 30 phút sau khi vượt quá giới hạn
- ✅ **Redis-based tracking**: Lưu counter theo IP:email
- Implementation:
  - `RateLimitService.java` - Interface
  - `RateLimitServiceImpl.java` - Implementation
  - `AuthAPI.login()` - Áp dụng rate limit

#### Forgot Password Rate Limiting
- ✅ **3 requests / giờ** per email
- ✅ **Generic response**: Không tiết lộ email có tồn tại hay không

---

### 4. Password Recovery

#### One-Time Tokens
- ✅ **Secure random token**: 32 bytes (256-bit entropy)
- ✅ **TTL**: 15 phút (configurable)
- ✅ **Single-use**: Token tự động xóa sau validation
- ✅ **Redis storage**: `RecoveryCodeServiceImpl.java`

---

### 5. Input Validation & Sanitization

#### Server-side Validation
- ✅ **@Valid + BindingResult**: Tất cả endpoints
- ✅ **Jakarta Validation annotations**:
  - `@NotBlank`, `@Email`, `@Size`, `@Pattern`
  - `@NotNull`, `@Positive`, `@Future`
- ✅ **DTOs có validation**:
  - `LoginRequest.java`
  - `RegistrationRequest.java`
  - `ResetPasswordRequest.java`
  - `CreateEventRequest.java`
  - `CreatePostRequest.java`
  - `CreateCommentRequest.java`

---

### 6. SQL Injection Prevention

#### JPA/Hibernate
- ✅ **Repository pattern**: Sử dụng Spring Data JPA
- ✅ **Parameterized queries**: Không nối chuỗi SQL thô
- ✅ **Named parameters**: `@Param` trong custom queries

---

### 7. Error Handling & Logging

#### Global Exception Handler
- ✅ **GlobalExceptionHandler.java**: Xử lý tất cả exceptions
  - Không leak stack trace ra client
  - Log đầy đủ cho debugging server-side
  - Response format thống nhất

#### Audit Logging
- ✅ **Audit logger**: Logger riêng cho security events
- ✅ **Log với IP address**: Track client IP (hỗ trợ proxy/load balancer)
- ✅ **Security events được log**:
  - Authentication failures (login failed)
  - Access denied (403)
  - Rate limit exceeded
  - Account lockout
- Log format: `🔒 EVENT_TYPE | IP: x.x.x.x | URI: /path | Time: timestamp`

---

### 8. Security Headers

#### HTTP Security Headers (trong `SecurityConfig.java`)
- ✅ **X-Frame-Options**: `SAMEORIGIN` - Chống clickjacking
- ✅ **X-Content-Type-Options**: `nosniff` - Chống MIME sniffing
- ✅ **X-XSS-Protection**: `1; mode=block` - Chống XSS (legacy browsers)
- ✅ **Referrer-Policy**: `strict-origin-when-cross-origin`
- ✅ **Content-Security-Policy (CSP)**:
  ```
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' ${FRONTEND_URL};
  ```

---

### 9. Secrets Management

#### Environment Variables
- ✅ **Tất cả secrets đã di chuyển ra khỏi source code**:
  - `JWT_SECRET` - **BẮT BUỘC** trong production
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `MAIL_USERNAME`, `MAIL_PASSWORD`
  - `DB_USERNAME`, `DB_PASSWORD`
  - Redis credentials (nếu có)

#### Files
- ✅ **`.env.example`**: Template cho production
- ✅ **`.gitignore`**: Đã thêm `.env`, `*.env`, secrets files

---

### 10. CORS Configuration

#### Cross-Origin Resource Sharing
- ✅ **Frontend whitelist**: Configurable via `app.frontend.url`
- ✅ **Credentials allowed**: `setAllowCredentials(true)`
- ✅ **Exposed headers**: `Authorization`

---

## 📋 Checklist Triển Khai Production

### Trước Khi Deploy

- [ ] **Set tất cả environment variables**:
  ```bash
  export JWT_SECRET=$(openssl rand -base64 32)
  export GOOGLE_CLIENT_ID=your-google-client-id
  export GOOGLE_CLIENT_SECRET=your-google-client-secret
  export MAIL_USERNAME=your-email@gmail.com
  export MAIL_PASSWORD=your-app-password
  export DB_USERNAME=your_db_user
  export DB_PASSWORD=your_db_password
  ```

- [ ] **Bật HTTPS**:
  - Cấu hình SSL/TLS certificate
  - Redirect HTTP → HTTPS
  - Set `server.ssl.*` properties

- [ ] **Redis Configuration**:
  - Set password cho Redis
  - Giới hạn network access (chỉ backend server)
  - Bật persistence (RDB/AOF)

- [ ] **Database Security**:
  - User riêng cho application (không dùng root/postgres)
  - Giới hạn privileges (chỉ SELECT/INSERT/UPDATE/DELETE)
  - SSL connection nếu database remote

- [ ] **Monitoring & Alerting**:
  - Log aggregation (ELK, Splunk, CloudWatch...)
  - Alert cho:
    - Rate limit exceeded
    - Multiple failed logins
    - Access denied events
    - Application errors

- [ ] **Security Scanning**:
  - Dependency check: `mvn dependency-check:check`
  - OWASP ZAP hoặc Burp Suite scan
  - SonarQube code analysis

---

## 🔍 Testing Security

### Manual Testing

#### 1. JWT Security
```bash
# Test với expired token
curl -H "Authorization: Bearer expired-token" http://localhost:8080/api/posts

# Test với invalid token
curl -H "Authorization: Bearer invalid" http://localhost:8080/api/posts
```

#### 2. Rate Limiting
```bash
# Test login brute-force (should lockout after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

#### 3. Authorization
```bash
# Test admin endpoint without ADMIN role (should return 403)
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer user-token"
```

#### 4. CSRF Protection
```bash
# Test POST without valid origin
curl -X POST http://localhost:8080/api/posts \
  -H "Origin: http://evil.com" \
  -H "Content-Type: application/json"
```

---

## 🚀 Cải Tiến Trong Tương Lai

### 1. HTTPS/TLS
- [ ] Bắt buộc HTTPS trong production
- [ ] HSTS (HTTP Strict Transport Security) header
- [ ] Certificate pinning (optional, cho mobile apps)

### 2. Advanced Rate Limiting
- [ ] Distributed rate limiting (nếu scale horizontal)
- [ ] Dynamic rate limits dựa trên user behavior
- [ ] CAPTCHA sau N lần thất bại

### 3. Token Blacklist
- [ ] JWT blacklist trong Redis khi logout
- [ ] Revoke tokens khi change password
- [ ] Short-lived access tokens + refresh tokens

### 4. 2FA / MFA
- [ ] Time-based OTP (TOTP)
- [ ] SMS verification
- [ ] Email verification code

### 5. Data Encryption
- [ ] Encrypt sensitive fields trong database
- [ ] Transparent Data Encryption (TDE) nếu DB hỗ trợ

### 6. API Gateway
- [ ] Centralized rate limiting
- [ ] API key management
- [ ] Request/response filtering

### 7. Penetration Testing
- [ ] Định kỳ 6 tháng/năm
- [ ] Bug bounty program

---

## 📚 Tham Khảo

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**Cập nhật lần cuối**: 2025-12-15  
**Phiên bản**: 1.0
