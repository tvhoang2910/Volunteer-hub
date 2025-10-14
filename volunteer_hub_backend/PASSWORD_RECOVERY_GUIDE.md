# Password Recovery Implementation - Security Guide

## 📋 Tổng quan

Đã implement password recovery flow an toàn sử dụng Redis với các tính năng:

- ✅ **Secure random token** (32 bytes, 256-bit entropy) thay vì mã số ngắn
- ✅ **Stateless approach** - không dùng HTTP session
- ✅ **Single-use tokens** - tự động xóa sau khi sử dụng
- ✅ **TTL (Time To Live)** - token tự động expire sau 15 phút
- ✅ **Rate limiting** - tối đa 3 requests/giờ per email
- ✅ **Async email sending** - không block request thread
- ✅ **No user enumeration** - không tiết lộ email có tồn tại hay không
- ✅ **No token logging** - không log sensitive data

## 🔄 Flow hoạt động

### 1. User request reset password
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }

→ Backend:
  - Check rate limit (3 requests/hour)
  - Generate secure random token (32 bytes)
  - Store token → email mapping in Redis (TTL 15 min)
  - Send email async với link: http://localhost:3000/reset-password?token={token}
  - Return generic success message

Response: 200 OK
{
  "message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu."
}
```

### 2. User click link trong email và submit form reset
```
POST /api/auth/reset-password
Body: {
  "token": "abc123...",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

→ Backend:
  - Validate token trong Redis
  - Nếu valid: lấy email, xóa token (single-use)
  - Validate password strength
  - Update password (BCrypt hash)
  - Return success

Response: 200 OK
{
  "message": "Mật khẩu đã được cập nhật thành công"
}
```

## 🛠️ Cấu hình

### Redis (Required)
```properties
# application.properties
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Token TTL (minutes)
recovery.token.ttl-minutes=15

# Rate limiting
rate-limit.forgot-password.max-attempts=3
rate-limit.forgot-password.window-minutes=60

# Frontend URL (cho email link)
app.frontend.url=http://localhost:3000
```

### Email Configuration
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## 🔐 Security Features

### 1. Tránh User Enumeration
- **KHÔNG** trả về lỗi "Email không tồn tại"
- Luôn trả về generic success message
- Response time tương tự cho cả email tồn tại và không tồn tại

### 2. Secure Token Generation
```java
// TokenUtil.java
public static String generatePasswordResetToken() {
    byte[] bytes = new byte[32];  // 256 bits
    secureRandom.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
}
// Output: ~43 ký tự URL-safe string
```

### 3. Redis Storage Structure
```
Key: "pwd-reset:token:{token}"
Value: email
TTL: 15 minutes

Key: "pwd-reset:email:{email}"
Value: token (để có thể invalidate old token)
TTL: 15 minutes
```

### 4. Rate Limiting
```
Key: "rate-limit:forgot-password:{email}"
Value: counter (1, 2, 3...)
TTL: 60 minutes

→ Max 3 requests per hour per email
```

### 5. Single-Use Tokens
Token tự động bị xóa sau khi validate thành công trong `isValidRecoveryCode()`:
```java
public String isValidRecoveryCode(String token) {
    String email = redisTemplate.opsForValue().get(tokenKey(token));
    if (email != null) {
        // Xóa ngay (single-use)
        redisTemplate.delete(tokenKey(token));
        redisTemplate.delete(emailKey(email));
        return email;
    }
    return null;
}
```

## 📧 Email Template

Email chứa link reset password:
```
Subject: Khôi phục mật khẩu - Volunteer Hub

Xin chào,

Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Volunteer Hub của mình.

Vui lòng click vào link bên dưới để đặt lại mật khẩu:
http://localhost:3000/reset-password?token={token}

Link này sẽ hết hạn sau 15 phút.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Volunteer Hub Team
```

## 🧪 Testing

### Test forgot-password endpoint
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Test reset-password endpoint
```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"abc123...",
    "password":"NewPassword123!",
    "confirmPassword":"NewPassword123!"
  }'
```

### Kiểm tra Redis
```bash
# Connect to Redis CLI
redis-cli

# Xem tất cả keys liên quan password reset
KEYS pwd-reset:*

# Xem value của token
GET pwd-reset:token:abc123...

# Xem TTL
TTL pwd-reset:token:abc123...

# Xem rate limit
GET rate-limit:forgot-password:user@example.com
TTL rate-limit:forgot-password:user@example.com
```

## 🎯 Frontend Integration (React)

### Forgot Password Page
```javascript
const handleForgotPassword = async (email) => {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Hiển thị message generic
    alert(data.message);
  } else if (response.status === 429) {
    alert("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.");
  }
};
```

### Reset Password Page
```javascript
const ResetPasswordPage = () => {
  // Lấy token từ URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  const handleResetPassword = async (password, confirmPassword) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, confirmPassword })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Mật khẩu đã được cập nhật thành công!');
      // Redirect to login
      window.location.href = '/login';
    } else {
      alert(data.message);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleResetPassword(password, confirmPassword);
    }}>
      <input type="password" placeholder="Mật khẩu mới" />
      <input type="password" placeholder="Xác nhận mật khẩu" />
      <button type="submit">Đặt lại mật khẩu</button>
    </form>
  );
};
```

## 🚀 Production Checklist

- [ ] Cấu hình Redis production (persistence, clustering)
- [ ] Set `app.frontend.url` thành production URL
- [ ] Sử dụng HTTPS cho tất cả requests
- [ ] Enable Redis AUTH password
- [ ] Configure proper CORS settings
- [ ] Monitor rate limit metrics
- [ ] Set up alerting cho failed password reset attempts
- [ ] Regular security audit
- [ ] Implement IP-based rate limiting (ngoài email-based)
- [ ] Consider using HTML email template thay vì plain text
- [ ] Add audit logging cho password changes

## 📚 Related Files

### Core Implementation
- `TokenUtil.java` - Secure token generation
- `RecoveryCodeService.java` - Redis storage & validation
- `RateLimitService.java` - Rate limiting logic
- `EmailService.java` - Async email sending
- `AuthAPI.java` - REST endpoints
- `AsyncConfig.java` - Enable @Async

### DTOs
- `ForgotPasswordRequest.java` - Email input
- `ResetPasswordRequest.java` - Token + password input

### Configuration
- `application.properties` - All configs

## ⚠️ Important Notes

1. **Không bao giờ log token values** - chỉ log events (created, consumed, expired)
2. **Rate limiting là bắt buộc** - để chống spam và abuse
3. **Generic error messages** - không tiết lộ thông tin user existence
4. **Single-use tokens** - token phải bị xóa sau khi dùng
5. **Short TTL** - 15 phút là hợp lý, không nên quá dài
6. **Async email** - để response nhanh, không block request thread
7. **Redis là ephemeral storage** - chỉ lưu temporary data, không lưu critical data

## 🔗 OWASP References

Implementation này follow OWASP best practices:
- [OWASP Password Reset Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
