# Postman Testing Guide for Admin Authentication

## 🚨 **Important: Logout Testing in Postman**

When testing logout functionality in Postman, you may encounter the issue where accessing protected routes still works after logout. This happens because:

### **Why This Happens:**
1. **Postman Cookie Persistence**: Postman may cache cookies even after logout
2. **Manual Cookie Management**: Unlike browsers, Postman doesn't automatically clear cookies

### **Proper Testing Steps:**

#### **1. Test Logout Functionality:**
```bash
POST http://localhost:3001/api/v1/admin/logout
Authorization: Bearer YOUR_TOKEN
```

#### **2. Check Authentication Status:**
```bash
GET http://localhost:3001/api/v1/admin/auth-status
```
This will tell you if you're still authenticated and clear invalid cookies.

#### **3. Manual Cookie Clearing in Postman:**
- Go to **Cookies** tab (under the Send button)
- Find `adminToken` cookie for `localhost:3001`
- Delete it manually

#### **4. Test Protected Route After Logout:**
```bash
GET http://localhost:3001/api/v1/admin/profile
```
This should now return 401 Unauthorized.

### **Alternative Testing Method:**

Use **Incognito/Private Mode** or different HTTP client:
- Use browser's developer tools
- Use curl commands
- Use different Postman workspace

### **Automated Cookie Clearing:**

The logout endpoint now:
- Uses `res.clearCookie()` method
- Sets expired cookie as backup
- Provides helpful message

### **New Route Added:**
- `GET /api/v1/admin/auth-status` - Check if token is valid and clear invalid cookies

## ✅ **Expected Behavior After Fixes:**

1. **Login** → Sets secure cookie ✓
2. **Logout** → Clears cookie properly ✓  
3. **Protected Routes** → Return 401 after logout ✓
4. **Invalid Tokens** → Automatically clear cookies ✓

## 🔧 **Testing Commands:**

```bash
# 1. Login
curl -X POST http://localhost:3001/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@realestate.com", "password": "admin123456"}' \
  -c cookies.txt

# 2. Access Profile (should work)
curl -X GET http://localhost:3001/api/v1/admin/profile \
  -b cookies.txt

# 3. Logout
curl -X POST http://localhost:3001/api/v1/admin/logout \
  -b cookies.txt \
  -c cookies.txt

# 4. Access Profile Again (should fail)
curl -X GET http://localhost:3001/api/v1/admin/profile \
  -b cookies.txt
```