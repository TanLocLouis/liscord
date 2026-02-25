import client from '../db/db.js';

const db = client.db('quikbin');
const usersCollection = db.collection('users');

const usersModel = {
    async getUserProfile(userId) {
        const user = await usersCollection.findOne({ username: userId }, {
            projection: { passwordHash: 0 }
        });

        return user;
    },
    async getUserPassword(userId) {
        const user = await usersCollection.findOne({ username: userId }, {
            projection: { passwordHash: 1 }
        });
        return user.passwordHash;
    },
    async updateUserPassword(userId, newPasswordHash) {
        // console.log('[DEBUG] usersModel.updateUserPassword called with: ', userId, newPasswordHash);
        const result = await usersCollection.updateOne(
            { username: userId },
            { $set: { passwordHash: newPasswordHash } }
        );
        return result.modifiedCount > 0;
    }
}

export default usersModel;