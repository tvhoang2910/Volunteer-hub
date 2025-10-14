# Frontend Migration Guide - Password Recovery

## 🔄 Thay đổi so với implementation cũ

### Old Flow (Session-based với mã 6 số)
```
1. POST /forgot-password → nhận mã 6 số qua email
2. POST /verify-recovery-code → verify mã, lưu vào session
3. POST /reset-password → dùng session để biết email
```

### New Flow (Token-based, stateless)
```
1. POST /forgot-password → nhận email với link chứa token
2. User click link → frontend mở page /reset-password?token=xxx
3. POST /reset-password (với token) → reset password
```

## 📝 API Changes

### 1. `/api/auth/forgot-password` - KHÔNG THAY ĐỔI REQUEST
```javascript
// Request - GIỐNG CŨ
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

// Response - THAY ĐỔI
// Cũ:
{
  "message": "Email hợp lệ. Đang chuyển hướng...",
  "data": "/verify-recovery-code"  // ❌ Không còn redirect
}

// Mới:
{
  "message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu."
  // ✅ Generic message - không tiết lộ email có tồn tại hay không
}
```

### 2. `/api/auth/verify-recovery-code` - XÓA ENDPOINT
```javascript
// ❌ Endpoint này KHÔNG CÒN TỒN TẠI
// User không cần nhập mã nữa - chỉ cần click link trong email
```

### 3. `/api/auth/reset-password` - THAY ĐỔI HOÀN TOÀN
```javascript
// Request - THAY ĐỔI
// Cũ (dùng session):
POST /api/auth/reset-password
{
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
// Backend lấy email từ session

// Mới (stateless với token):
POST /api/auth/reset-password
{
  "token": "abc123...",  // ✅ THÊM MỚI - từ URL
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### 4. Rate Limiting Response
```javascript
// Mới: 429 Too Many Requests
{
  "message": "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau."
}
```

## 🎨 Frontend Implementation

### Page 1: Forgot Password (Minimal changes)
```jsx
// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      // ✅ Hiển thị message generic
      setMessage(response.data.message);
      
      // ❌ KHÔNG REDIRECT đến verify-code page nữa
      // User chỉ cần check email
      
    } catch (error) {
      if (error.response?.status === 429) {
        setMessage('Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.');
      } else {
        setMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
        </button>
      </form>
      
      {message && (
        <div className="message-box">
          <p>{message}</p>
          <p className="instruction">
            Vui lòng kiểm tra email của bạn và click vào link để đặt lại mật khẩu.
          </p>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
```

### Page 2: Verify Recovery Code - ❌ XÓA PAGE NÀY
```jsx
// ❌ src/pages/VerifyRecoveryCodePage.jsx - XÓA FILE NÀY
// User không cần nhập mã nữa
```

### Page 3: Reset Password (Major changes)
```jsx
// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ LẤY TOKEN TỪ URL
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ KIỂM TRA TOKEN CÓ TỒN TẠI KHÔNG
    if (!token) {
      setError('Link không hợp lệ. Vui lòng yêu cầu khôi phục mật khẩu lại.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      // ✅ GỬI TOKEN CÙNG VỚI PASSWORD
      const response = await axios.post('/api/auth/reset-password', {
        token,  // ✅ THÊM TOKEN
        password,
        confirmPassword
      });

      setMessage(response.data.message);
      
      // Redirect to login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ❌ KHÔNG CẦN CHECK SESSION NỮA
  
  if (!token) {
    return (
      <div className="error-page">
        <p>{error}</p>
        <button onClick={() => navigate('/forgot-password')}>
          Yêu cầu khôi phục mật khẩu
        </button>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <h2>Đặt lại mật khẩu</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <small>
          Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt
        </small>
        
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
```

### Router Configuration
```jsx
// src/App.jsx hoặc routes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
// ❌ import VerifyRecoveryCodePage - XÓA IMPORT NÀY

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* ✅ Route mới nhận token từ query param */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* ❌ XÓA route verify-recovery-code */}
        {/* <Route path="/verify-recovery-code" element={<VerifyRecoveryCodePage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
```

## 📧 Email Example

User sẽ nhận email như sau:
```
Subject: Khôi phục mật khẩu - Volunteer Hub

Xin chào,

Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Volunteer Hub của mình.

Vui lòng click vào link bên dưới để đặt lại mật khẩu:
http://localhost:3000/reset-password?token=abc123xyz...

Link này sẽ hết hạn sau 15 phút.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Volunteer Hub Team
```

## 🔧 Environment Configuration

```env
# .env
REACT_APP_API_URL=http://localhost:8080
```

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ❌ KHÔNG CẦN withCredentials=true NỮA vì không dùng session
// api.defaults.withCredentials = true;

export default api;
```

## ✅ Checklist Migration

- [ ] Xóa `VerifyRecoveryCodePage.jsx`
- [ ] Xóa route `/verify-recovery-code`
- [ ] Cập nhật `ForgotPasswordPage.jsx`:
  - [ ] Hiển thị message generic
  - [ ] Bỏ redirect đến verify page
  - [ ] Thêm instruction check email
- [ ] Cập nhật `ResetPasswordPage.jsx`:
  - [ ] Lấy token từ URL query param
  - [ ] Gửi token trong request body
  - [ ] Bỏ logic check session
- [ ] Cập nhật router configuration
- [ ] Test toàn bộ flow:
  - [ ] Request forgot password
  - [ ] Check email nhận được
  - [ ] Click link và reset password
  - [ ] Verify có login được với password mới
- [ ] Test edge cases:
  - [ ] Token expired
  - [ ] Token invalid
  - [ ] Password không match
  - [ ] Rate limiting (>3 requests)

## 🎯 UX Improvements

### Password Strength Indicator
```jsx
const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const colors = ['#d73027', '#fc8d59', '#fee08b', '#91cf60', '#1a9850'];

  return (
    <div className="password-strength">
      <div className="strength-bar" style={{
        width: `${strength * 25}%`,
        backgroundColor: colors[strength]
      }} />
      <span>{labels[strength]}</span>
    </div>
  );
};
```

### Loading States
```jsx
// Trong form
{loading && (
  <div className="loading-overlay">
    <div className="spinner" />
    <p>Đang xử lý...</p>
  </div>
)}
```

## 🐛 Error Handling

```jsx
const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        return error.response.data.message || 'Dữ liệu không hợp lệ';
      case 429:
        return 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.';
      case 500:
        return 'Lỗi server. Vui lòng thử lại sau.';
      default:
        return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
  } else {
    // Something else happened
    return 'Đã xảy ra lỗi không mong muốn.';
  }
};
```

## 🚀 Testing

```javascript
// Test forgot password
describe('ForgotPasswordPage', () => {
  it('should show generic success message', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordPage />);
    
    fireEvent.change(getByPlaceholderText('Email của bạn'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(getByText('Gửi yêu cầu'));
    
    await waitFor(() => {
      expect(getByText(/Vui lòng kiểm tra email/i)).toBeInTheDocument();
    });
  });
});

// Test reset password
describe('ResetPasswordPage', () => {
  it('should reset password with valid token', async () => {
    // Mock URL with token
    window.history.pushState({}, '', '/reset-password?token=valid-token');
    
    const { getByPlaceholderText, getByText } = render(<ResetPasswordPage />);
    
    fireEvent.change(getByPlaceholderText('Mật khẩu mới'), {
      target: { value: 'NewPassword123!' }
    });
    
    fireEvent.change(getByPlaceholderText('Xác nhận mật khẩu'), {
      target: { value: 'NewPassword123!' }
    });
    
    fireEvent.click(getByText('Đặt lại mật khẩu'));
    
    await waitFor(() => {
      expect(getByText(/thành công/i)).toBeInTheDocument();
    });
  });
});
```
