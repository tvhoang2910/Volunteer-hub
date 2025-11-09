// Mock manager service (frontend-only, returns Promises to simulate API)
const MOCK_PROFILE = {
  id: "mgr-001",
  name: "Nguyễn Văn A",
  role: "Manager",
  avatarUrl:
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=400&q=80",
  email: "manager@example.org",
  phone: "+84 912 345 678",
  organization: "Volunteer Hub VN",
  location: "Hà Nội, Việt Nam",
  bio: "Tôi là trưởng nhóm tình nguyện, phụ trách điều phối các dự án cộng đồng.",
  stats: { managedProjects: 3, volunteers: 128 },
  preferences: { emailNotifications: true, smsNotifications: false, inApp: true },
}

export function getProfile() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...MOCK_PROFILE }), 250)
  })
}

export function updateProfile(updated) {
  return new Promise((resolve) => {
    // merge into mock and return
    Object.assign(MOCK_PROFILE, updated)
    setTimeout(() => resolve({ ...MOCK_PROFILE }), 300)
  })
}

export function uploadAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file'))
    // create a local object URL to simulate uploaded avatar
    const url = URL.createObjectURL(file)
    setTimeout(() => resolve({ url }), 400)
  })
}

export function updatePreferences(prefs) {
  return new Promise((resolve) => {
    Object.assign(MOCK_PROFILE.preferences, prefs)
    setTimeout(() => resolve({ ...MOCK_PROFILE.preferences }), 200)
  })
}

export function changePassword(payload) {
  return new Promise((resolve, reject) => {
    // very simple mock: require current === 'password'
    if (payload.current !== 'password') {
      setTimeout(() => reject(new Error('Current password incorrect')), 200)
    } else {
      setTimeout(() => resolve(true), 300)
    }
  })
}

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  updatePreferences,
  changePassword,
}
