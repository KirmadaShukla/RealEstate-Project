const Leadership = require('../models/leadership');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all leadership members (both active and inactive)
exports.getAllLeaders = catchAsyncErrors(async (req, res, next) => {
  const language = req.query.lang || 'en';
  
  const leaders = await Leadership.find({}).sort({ order: 1 });
  
  // Translate leaders to requested language
  const translatedLeaders = leaders.map(leader => ({
    _id: leader._id,
    name: leader.name[language] || leader.name.en,
    designation: leader.designation[language] || leader.designation.en,
    image: leader.image,
    socialMedia: leader.socialMedia,
    order: leader.order
  }));
  
  res.status(200).json({
    success: true,
    leaders: translatedLeaders
  });
});

// Get leadership member by ID
exports.getLeaderById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const language = req.query.lang || 'en';
  
  const leader = await Leadership.findById(id);
  
  if (!leader) {
    return next(new ErrorHandler('Leader not found', 404));
  }
  
  const translatedLeader = {
    _id: leader._id,
    name: leader.name[language] || leader.name.en,
    designation: leader.designation[language] || leader.designation.en,
    image: leader.image,
    socialMedia: leader.socialMedia,
    order: leader.order
  };
  
  res.status(200).json({
    success: true,
    leader: translatedLeader
  });
});

// Create new leadership member (Admin only)
exports.createLeader = catchAsyncErrors(async (req, res, next) => {
  // Extract fields with bracket notation for multilingual support
  let { 
    'name[en]': nameEn,
    'name[ar]': nameAr,
    'designation[en]': designationEn,
    'designation[ar]': designationAr,
    linkedin,
    instagram,
    email,
    order
  } = req.body;
  
  // Handle image upload
  let imageResult = null;
  if (req.files && req.files.image) {
    try {
      imageResult = await uploadToCloudinary(req.files.image, 'realestate/leaders');
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
  
  const leaderData = {
    name: {
      en: nameEn,
      ar: nameAr
    },
    designation: {
      en: designationEn,
      ar: designationAr
    },
    socialMedia: {
      linkedin: linkedin || '',
      instagram: instagram || '',
      email: email || ''
    },
    order: parseInt(order) || 0
  };
  
  if (imageResult) {
    leaderData.image = {
      url: imageResult.url,
      fileId: imageResult.fileId
    };
  }
  
  const leader = await Leadership.create(leaderData);
  
  res.status(201).json({
    success: true,
    message: 'Leader created successfully',
    leader
  });
});

// Update leadership member (Admin only)
exports.updateLeader = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  // Extract fields with bracket notation for multilingual support
  let { 
    'name[en]': nameEn,
    'name[ar]': nameAr,
    'designation[en]': designationEn,
    'designation[ar]': designationAr,
    linkedin,
    instagram,
    email,
    order
  } = req.body;
  
  let leader = await Leadership.findById(id);
  
  if (!leader) {
    return next(new ErrorHandler('Leader not found', 404));
  }
  
  // Handle image upload if provided
  if (req.files && req.files.image) {
    try {
      // Delete old image if exists
      if (leader.image && leader.image.fileId) {
        await deleteFromCloudinary(leader.image.fileId);
      }
      
      // Upload new image
      const imageResult = await uploadToCloudinary(req.files.image, 'realestate/leaders');
      
      leader.image = {
        url: imageResult.url,
        fileId: imageResult.fileId
      };
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
  
  // Update fields if provided
  if (nameEn !== undefined) leader.name.en = nameEn;
  if (nameAr !== undefined) leader.name.ar = nameAr;
  if (designationEn !== undefined) leader.designation.en = designationEn;
  if (designationAr !== undefined) leader.designation.ar = designationAr;
  if (linkedin !== undefined) leader.socialMedia.linkedin = linkedin;
  if (instagram !== undefined) leader.socialMedia.instagram = instagram;
  if (email !== undefined) leader.socialMedia.email = email;
  if (order !== undefined) leader.order = parseInt(order) || 0;
  
  await leader.save();
  
  res.status(200).json({
    success: true,
    message: 'Leader updated successfully',
    leader
  });
});

// Delete leadership member (Admin only)
exports.deleteLeader = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const leader = await Leadership.findById(id);
  
  if (!leader) {
    return next(new ErrorHandler('Leader not found', 404));
  }
  
  // Delete image from cloudinary if exists
  if (leader.image && leader.image.fileId) {
    await deleteFromCloudinary(leader.image.fileId);
  }
  
  await leader.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Leader deleted successfully'
  });
});
