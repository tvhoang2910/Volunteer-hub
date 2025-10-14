# 🚀 Quick Start Guide - Password Recovery

## Bắt đầu ngay trong 5 phút!

### 1️⃣ Start Redis (Required)

#### Option A: Docker (Recommended)
```bash
docker run -d -p 6379:6379 --name redis-volunteer redis:latest
```

#### Option B: Local Redis
```bash
# macOS
brew install redis
redis-server

# Ubuntu/Debian
sudo apt-get install redis-server
sudo service redis-server start

# Windows
# Download từ https://github.com/microsoftarchive/redis/releases
# Hoặc dùng WSL
```

Verify Redis running:
```bash
redis-cli ping
# Response: PONG
```

### 2️⃣ Configure Backend

File `application.properties` đã được config sẵn:
```properties
# Redis (default localhost:6379)
spring.data.redis.port=6379

# Token TTL (15 phút)
recovery.token.ttl-minutes=15

# Rate limiting (3 requests/hour)
rate-limit.forgot-password.max-attempts=3
rate-limit.forgot-password.window-minutes=60

# Frontend URL (update cho production)
app.frontend.url=http://localhost:3000
```

**Chỉ cần update email settings** trong `application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### 3️⃣ Run Backend

```bash
# Build và run
mvn clean install
mvn spring-boot:run

# Hoặc
./mvnw spring-boot:run
```

Backend sẽ start tại: `http://localhost:8080`

### 4️⃣ Test API

#### Test 1: Request password reset
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
```json
{
  "message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu."
}
```

#### Test 2: Check Redis
```bash
redis-cli

# Xem keys
KEYS pwd-reset:*

# Xem token value
GET pwd-reset:token:abc123...

# Xem TTL (seconds remaining)
TTL pwd-reset:token:abc123...
```

#### Test 3: Reset password
```bash
# Lấy token từ Redis hoặc email
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"your-token-here",
    "password":"NewPassword123!",
    "confirmPassword":"NewPassword123!"
  }'
```

Expected success:
```json
{
  "message": "Mật khẩu đã được cập nhật thành công"
}
```

#### Test 4: Rate limiting
```bash
# Gửi 4 requests liên tiếp với cùng email
for i in {1..4}; do
  curl -X POST http://localhost:8080/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo "\n---Request $i---\n"
done
```

Request thứ 4 sẽ trả về 429:
```json
{
  "message": "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau."
}
```

### 5️⃣ Run Tests

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=RecoveryCodeServiceTest

# With coverage
mvn clean verify
```

Expected output:
```
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## 🎯 Frontend Integration

### Update frontend .env
```env
REACT_APP_API_URL=http://localhost:8080
```

### Install dependencies (nếu cần)
```bash
npm install axios react-router-dom
```

### Test flow hoàn chỉnh

1. **Forgot Password Page** (`/forgot-password`)
   - Nhập email
   - Click "Gửi yêu cầu"
   - Thấy message: "Nếu email tồn tại..."
   - Check email inbox

2. **Email**
   - Click link: `http://localhost:3000/reset-password?token=...`

3. **Reset Password Page** (`/reset-password?token=...`)
   - Nhập password mới
   - Confirm password
   - Click "Đặt lại mật khẩu"
   - Redirect to login

4. **Login**
   - Login với password mới
   - Success! 🎉

## 🐛 Troubleshooting

### Redis connection failed
```
Error: Unable to connect to Redis at localhost:6379
```
**Fix**: Start Redis server
```bash
redis-server
# hoặc
docker start redis-volunteer
```

### Email not sending
```
Error: Could not connect to SMTP host
```
**Fix**: 
1. Check email credentials in `application.properties`
2. Enable "Less secure app access" for Gmail (or use App Password)
3. Check firewall/network

### Rate limit not working
**Fix**: 
1. Check Redis connection
2. Verify config: `rate-limit.forgot-password.max-attempts=3`
3. Clear Redis: `redis-cli FLUSHDB`

### Token expired immediately
**Fix**:
1. Check TTL config: `recovery.token.ttl-minutes=15`
2. Verify Redis time: `redis-cli TIME`
3. Check system time sync

### Tests failing
```bash
# Clean and rebuild
mvn clean install -DskipTests

# Then run tests
mvn test
```

## 📊 Monitor & Debug

### Check Redis keys in real-time
```bash
redis-cli MONITOR
```

### Check logs
```bash
# Backend logs
tail -f logs/spring-boot-app.log

# Hoặc trong console
# Look for:
# - "Created password reset token for email: ..."
# - "Consumed password reset token for email: ..."
# - "Rate limit exceeded for email: ..."
```

### Health check endpoints
```bash
# Application health
curl http://localhost:8080/actuator/health

# Redis health (nếu actuator enabled)
curl http://localhost:8080/actuator/health/redis
```

## 🎓 Common Use Cases

### Reset rate limit manually (for testing)
```bash
redis-cli DEL rate-limit:forgot-password:test@example.com
```

### Clear all password reset tokens
```bash
redis-cli KEYS "pwd-reset:*" | xargs redis-cli DEL
```

### Check token details
```bash
# Get email from token
redis-cli GET pwd-reset:token:YOUR_TOKEN

# Get token from email
redis-cli GET pwd-reset:email:test@example.com

# Check TTL
redis-cli TTL pwd-reset:token:YOUR_TOKEN
```

### Simulate token expiration
```bash
# Set TTL to 5 seconds for testing
redis-cli EXPIRE pwd-reset:token:YOUR_TOKEN 5
```

## ✅ Success Checklist

- [ ] Redis running và accessible
- [ ] Backend started successfully
- [ ] Email credentials configured
- [ ] Tests passing (mvn test)
- [ ] Can request password reset
- [ ] Email delivered với link
- [ ] Can reset password với token
- [ ] Rate limiting works (4th request returns 429)
- [ ] Token expires after TTL
- [ ] Token single-use (cannot reuse)

## 🚀 Next Steps

1. ✅ Basic flow working → See `FRONTEND_MIGRATION_GUIDE.md`
2. ✅ Frontend integrated → See `PASSWORD_RECOVERY_GUIDE.md`
3. ✅ Ready for production → See deployment checklist in `IMPLEMENTATION_SUMMARY.md`

## 📞 Need Help?

Check these docs:
- `PASSWORD_RECOVERY_GUIDE.md` - Detailed implementation guide
- `FRONTEND_MIGRATION_GUIDE.md` - Frontend integration
- `IMPLEMENTATION_SUMMARY.md` - Overview and architecture

---

**Happy coding! 🎉**
