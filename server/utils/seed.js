require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Handover = require('../models/Handover');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const StatusHistory = require('../models/StatusHistory');
const AuditLog = require('../models/AuditLog');

const { generateReportId, generateClaimId } = require('./generateReportId');
const { findPotentialMatches } = require('../services/imageMatchingService');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_lost_found';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    await Handover.deleteMany({});
    await Match.deleteMany({});
    await Notification.deleteMany({});
    await Feedback.deleteMany({});
    await StatusHistory.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing database records.');

    // Passwords
    const hashedPassword = await bcrypt.hash('User@123', 10);
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

    // Create Users
    const adminUser = await User.create({
      name: 'Campus Security Admin',
      email: 'admin@college.edu',
      collegeId: 'ADM-2026-001',
      phone: '9876543210',
      password: hashedAdminPassword,
      role: 'admin'
    });

    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@college.edu',
      collegeId: 'STU-2026-101',
      phone: '9812345678',
      password: hashedPassword,
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@college.edu',
      collegeId: 'STU-2026-102',
      phone: '9823456789',
      password: hashedPassword,
      role: 'user'
    });

    const user3 = await User.create({
      name: 'Amit Verma',
      email: 'amit@college.edu',
      collegeId: 'STU-2026-103',
      phone: '9834567890',
      password: hashedPassword,
      role: 'user'
    });

    console.log('Created Users & Admin.');

    // Sample Items with GSFC University Campus Coordinates
    const lostItem1 = await Item.create({
      reportId: await generateReportId('lost'),
      type: 'lost',
      itemName: 'Black Leather Wallet',
      category: 'Wallets',
      description: 'Black WildHorn leather wallet containing college ID card, driver license, and emergency cash.',
      location: 'Library',
      locationName: 'Library',
      specificLocation: '2nd floor reading section near window',
      latitude: 22.3708,
      longitude: 73.1582,
      locationSource: 'map_selection',
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      time: '14:30',
      identifyingFeatures: 'Small silver brand logo on bottom right corner, slight scratch near fold.',
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
      reporter: user1._id,
      status: 'Potential Match'
    });

    const foundItem1 = await Item.create({
      reportId: await generateReportId('found'),
      type: 'found',
      itemName: 'Black Leather Wallet',
      category: 'Wallets',
      description: 'Found a black leather wallet sitting on the study desk in the main library.',
      location: 'Library',
      locationName: 'Library',
      specificLocation: 'Library reading table #14',
      latitude: 22.3709,
      longitude: 73.1583,
      locationSource: 'current_location',
      date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      time: '16:00',
      identifyingFeatures: 'Contains student ID card and driver license.',
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
      reporter: user2._id,
      status: 'Potential Match'
    });

    const lostItem2 = await Item.create({
      reportId: await generateReportId('lost'),
      type: 'lost',
      itemName: 'Blue Titan Wristwatch',
      category: 'Watches',
      description: 'Silver chain watch with dark blue dial and date display window.',
      location: 'Sports Ground',
      locationName: 'Sports Ground',
      specificLocation: 'Near basketball court bench',
      latitude: 22.3715,
      longitude: 73.1610,
      locationSource: 'campus_selection',
      date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      time: '17:15',
      identifyingFeatures: 'Engraved with initials R.S. on back cover.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'],
      reporter: user1._id,
      status: 'Reported'
    });

    const foundItem2 = await Item.create({
      reportId: await generateReportId('found'),
      type: 'found',
      itemName: 'College ID Card',
      category: 'ID Cards',
      description: 'Found student ID card belonging to Computer Science department.',
      location: 'Canteen',
      locationName: 'Canteen',
      specificLocation: 'Juice counter table',
      latitude: 22.3701,
      longitude: 73.1590,
      locationSource: 'map_selection',
      date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      time: '12:45',
      identifyingFeatures: 'Laminated card with blue lanyard.',
      images: ['https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?auto=format&fit=crop&w=600&q=80'],
      reporter: user3._id,
      status: 'Reported'
    });

    const returnedLostItem = await Item.create({
      reportId: await generateReportId('lost'),
      type: 'lost',
      itemName: 'Dell XPS 13 Laptop',
      category: 'Laptops',
      description: 'Silver metallic ultrabook in grey neoprene laptop sleeve.',
      location: 'Laboratory',
      locationName: 'Laboratory',
      specificLocation: 'Advanced Computer Lab 302',
      latitude: 22.3710,
      longitude: 73.1584,
      locationSource: 'map_selection',
      date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      time: '11:00',
      identifyingFeatures: 'Octocat sticker on top lid, serial number ending 89X.',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
      reporter: user3._id,
      status: 'Returned'
    });

    console.log('Created Sample Lost & Found Items with Campus Map Coordinates.');

    // Run Hybrid Matching Service for lostItem1 & foundItem1
    await findPotentialMatches(lostItem1);

    // Create a Sample Claim for foundItem1
    const claim1 = await Claim.create({
      claimId: await generateClaimId(),
      item: foundItem1._id,
      claimant: user1._id,
      ownershipDescription: 'I lost my black leather wallet in the library reading room yesterday afternoon.',
      evidenceDetails: 'Driver License ID ending 4512 and college ID card inside.',
      evidenceImages: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
      status: 'Pending Verification',
      submittedAt: new Date()
    });

    // Create a Completed Handover for returnedLostItem
    const returnedFoundItem = await Item.create({
      reportId: await generateReportId('found'),
      type: 'found',
      itemName: 'Dell Laptop in Grey Sleeve',
      category: 'Laptops',
      description: 'Found silver Dell laptop left behind in CS Lab 302.',
      location: 'Laboratory',
      locationName: 'Laboratory',
      specificLocation: 'Desk #12, Lab 302',
      latitude: 22.3710,
      longitude: 73.1584,
      locationSource: 'campus_selection',
      date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      time: '11:30',
      identifyingFeatures: 'Has developer stickers.',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
      reporter: user2._id,
      status: 'Returned'
    });

    const claimReturned = await Claim.create({
      claimId: await generateClaimId(),
      item: returnedFoundItem._id,
      claimant: user3._id,
      ownershipDescription: 'Left laptop on Desk #12 during morning practical lab session.',
      evidenceDetails: 'Verified serial number ending 89X matches invoice copy.',
      status: 'Completed',
      adminNote: 'Verified serial number and photo ID card.',
      verifiedBy: adminUser._id,
      submittedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000)
    });

    await Handover.create({
      item: returnedFoundItem._id,
      claim: claimReturned._id,
      claimant: user3._id,
      handedOverBy: adminUser._id,
      handoverDate: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      handoverNote: 'Handed over at Main Security Gate Office after verifying student identity card.',
      status: 'Completed'
    });

    // Feedback for returned item
    await Feedback.create({
      user: user3._id,
      item: returnedFoundItem._id,
      rating: 5,
      comment: 'Extremely fast recovery! Found my laptop within 24 hours thanks to campus security and map system.'
    });

    // Audit Log entry
    await AuditLog.create({
      action: 'HANDOVER_COMPLETED',
      performedBy: adminUser._id,
      targetModel: 'Handover',
      targetId: claimReturned._id,
      details: `Completed physical return handover of item "${returnedFoundItem.itemName}" to student ${user3.name}.`,
      ipAddress: '127.0.0.1'
    });

    console.log('\n======================================================');
    console.log('SUCCESS: Database seeded successfully with Campus Map data!');
    console.log('------------------------------------------------------');
    console.log('ADMIN LOGIN CREDENTIALS:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: Admin@123');
    console.log('\nDEMO USER LOGIN CREDENTIALS:');
    console.log('  Email: rahul@college.edu');
    console.log('  Password: User@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
