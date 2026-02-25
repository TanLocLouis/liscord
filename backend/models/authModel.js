import client from '../db/db.js';

const db = client.db('quikbin');
const usersCollection = db.collection('users');

const authModel = {
    async createUser(userData) {
        const user = {
            username: userData.username,
            email: userData.email,
            passwordHash: userData.passwordHash,
            createdAt: new Date(Date.now()),
            isActive: false
        }

        const result = await usersCollection.insertOne(user);
        return result;
    },
    async isUserExisted(username) {
        const user = await usersCollection.findOne({ username: username });
        return user !== null;
    },
    async setActive(username) {
        const result = await usersCollection.updateOne(
            { username: username },
            { $set: { isActive: true } }
        );
        return result;
    },
    async getUserByUsername(username) {
        const user = await usersCollection.findOne({ username: username });
        return user;
    },
    async getUserByEmail(email) {
        const user = await usersCollection.findOne({ email: email });
        return user;
    },
    async updatePassword(username, newPasswordHash) {
        const result = await usersCollection.updateOne(
            { username: username },
            { $set: { passwordHash: newPasswordHash } }
        );
        return result;
    }
}

export default authModel;