# 📬 **Complete Real Estate API Postman Guide**

## 🚀 **Quick Start**

### **1. Import Collection & Environment**
1. Open Postman
2. Click **Import** → Import these files:
   - `Real_Estate_Site_Settings_API.postman_collection.json`
   - `Real_Estate_Environment.postman_environment.json`
3. Select **\"Real Estate API Environment\"** in top-right corner

### **2. Start Server**
```bash
cd /Users/pranjalshukla/Desktop/RealEstate-Project
npm run dev
```

## 🔐 **Authentication Workflow**

### **Step 1: First-Time Setup**
```
🎯 Run: \"Admin Setup (First Time Only)\"
✅ Creates initial admin account
```

### **Step 2: Login & Get Token**
```
🎯 Run: \"Admin Login\"
✅ Auto-saves JWT token to collection variables
✅ All subsequent requests use this token automatically
```

### **Step 3: Verify Authentication**
```
🎯 Run: \"Check Auth Status\"
✅ Confirms you're authenticated
```

## 📱 **API Categories**

### **🔐 Authentication**
- **Admin Setup** - One-time admin creation
- **Admin Register** - Register new admin with key
- **Admin Login** - Get JWT token (auto-saved)
- **Check Auth Status** - Verify authentication
- **Get Admin Profile** - Current admin info
- **Update Admin Password** - Change password
- **Admin Logout** - Logout & clear token

### **⚙️ Site Settings - General**
- **Get All Site Settings** - Fetch all settings (public)
- **Update Hero Section** - Hero title + video upload
- **Update About Us Section** - About content + images

### **🏢 Projects Management**
- **Get All Projects Summary** - Overview of all sections
- **Get [Type] Projects** - Get projects by type:
  - Residential
  - Commercial
  - Lands
  - OD Projects
  - OSUS Eyes

### **➕ Projects - Add New**
- **Add Residential Project** - With hero image
- **Add Commercial Project** - Complete project details
- **Add Lands Project** - Land-specific project

### **✏️ Projects - Update**
- **Update Project Details** - Modify existing project
- **Update Section Title** - Change section headers

### **🗑️ Projects - Delete**
- **Delete Project** - Remove project + Cloudinary assets

### **🖼️ Gallery Management**
- **Add Image to Gallery** - Upload with caption
- **Remove Image from Gallery** - Delete from gallery + Cloudinary

## 🔧 **File Upload Guide**

### **Supported File Types:**
- **Images**: JPG, JPEG, PNG, WebP (max 10MB)
- **Videos**: MP4, MOV, AVI (max 100MB)

### **File Upload Fields:**
- `heroVideo` - Hero section background video
- `aboutImage` - About us main image
- `visionImage` - Vision section image
- `heroImage` - Project hero image
- `image` - Gallery images

### **Upload Process:**
1. Select **form-data** in body
2. Choose **File** type for image fields
3. Click **Select Files** to upload
4. Add other text fields as needed

## 📝 **Variable Management**

### **Auto-Managed Variables:**
- `adminToken` - JWT token (auto-saved on login)
- `baseUrl` - API base URL

### **Manual Variables (Set from responses):**
- `projectId` - Copy from project creation response
- `imageId` - Copy from gallery image response

## 🎯 **Testing Workflow**

### **1. Complete Authentication Flow**
```
1. Admin Setup (first time)
2. Admin Login
3. Check Auth Status
4. Get Admin Profile
```

### **2. Site Settings Management**
```
1. Get All Site Settings
2. Update Hero Section (with video)
3. Update About Us Section (with images)
```

### **3. Projects Management**
```
1. Get All Projects Summary
2. Add Residential Project (with hero image)
3. Get Residential Projects
4. Add Images to Gallery
5. Update Project Details
6. Remove Gallery Image
```

## 🔍 **Response Inspection**

### **Successful Responses:**
- Status: `200` (OK) or `201` (Created)
- JSON with `success: true`
- Data in response body

### **Error Responses:**
- Status: `400` (Bad Request), `401` (Unauthorized), etc.
- JSON with `success: false`
- Error message in `message` field

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **401 Unauthorized**
   - Solution: Run \"Admin Login\" to get fresh token

2. **File Upload Fails**
   - Check file size limits (10MB images, 100MB videos)
   - Ensure Cloudinary credentials in `.env`

3. **Project ID Not Found**
   - Copy actual project ID from creation response
   - Update `{{projectId}}` variable

4. **Server Connection Error**
   - Ensure server is running: `npm run dev`
   - Check baseUrl in environment

## 🎨 **Collection Features**

### **Automatic Features:**
- **Token Management** - Auto-saves and uses JWT tokens
- **Error Logging** - Logs errors to console
- **Response Validation** - Tests response times
- **Success Notifications** - Console logs for successful operations

### **Environment Variables:**
- Easily switch between dev/staging/production
- Centralized configuration management
- Auto-populated authentication tokens

## 📊 **Console Output Examples**

```
🔑 Token saved: eyJhbGciOiJIUzI1NiIsInR5...
✅ Residential project added successfully
🖼️ Image added to gallery successfully
Image URL: https://res.cloudinary.com/...
🗑️ Image removed from gallery and Cloudinary
🚪 Logged out successfully, token cleared
```

This complete collection covers all authentication and site settings APIs with proper file upload support!"