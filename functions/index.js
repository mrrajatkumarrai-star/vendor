/**
 * Cloud Function: setUserRole
 *
 * Deploys as a Firebase Callable Function.
 * Only callable by users with the 'admin' custom claim.
 *
 * Usage:
 *   firebase deploy --only functions
 *
 * Install dependencies:
 *   cd functions && npm install
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Set a user's role via custom claims.
 * Callable by admin users only.
 *
 * @param {string} data.uid - Target user's UID
 * @param {string} data.role - Role to assign: 'admin' | 'manager' | 'viewer'
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Verify caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to set user roles.'
    );
  }

  // Verify caller is an admin
  if (context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set user roles.'
    );
  }

  const { uid, role } = data;

  // Validate inputs
  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'A valid user UID is required.'
    );
  }

  const validRoles = ['admin', 'manager', 'viewer'];
  if (!role || !validRoles.includes(role)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Role must be one of: ${validRoles.join(', ')}`
    );
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role });

    // Also update Firestore user document
    await admin.firestore().collection('users').doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: `Role '${role}' assigned to user ${uid}` };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set user role.'
    );
  }
});

/**
 * On user creation, set default role to 'viewer' and create Firestore document.
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Set default role
    await admin.auth().setCustomUserClaims(user.uid, { role: 'viewer' });

    // Create Firestore user document
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || '',
      role: 'viewer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error in onUserCreate:', error);
  }
});
