import usersService from '../services/usersService.js';

async function getUserProfile(req, res) {
    const userId = req.params.id;
    try {
        const userProfile = await usersService.getUserProfile(userId);
        res.status(200).json({
            user: userProfile
        });
    } catch (err) {
        console.error('[ERROR] Failed to get user profile', err);
        res.status(500).json({ 
            error: 'GET_USER_PROFILE_FAILED',
            message: 'Failed to get user profile' 
        });
    }
}

async function updateUserPassword(req, res) {
    // console.log('[DEBUG] updateUserPassword called with body: ', req.user);
    if (!req.body) {
        return res.status(400).json({ 
            error: 'NO_DATA_PROVIDED',
            message: 'No data provided'
        });
    }

    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const userId = req.user.username;
    try {
        await usersService.updateUserPassword(userId, currentPassword, newPassword);
        res.status(200).json({ 
            message: 'Password updated successfully' 
        });
    } catch (err) {
        console.error('[ERROR] Failed to update user password', err);
        res.status(500).json({ 
            error: 'UPDATE_PASSWORD_FAILED',
            message: 'Failed to update user password' 
        });
    }
}

export default {
    getUserProfile,
    updateUserPassword,
}