import { ObjectId } from "mongodb";
import { client } from "../config/mongodb";
import HTTPResponse from "../interfaces/httpResponse";
import generateJWT from '../services/generateJWT';
import User from "../classes/user";


/**
 * Login a user by email and passhash.
 * @param {string} email
 * @param {string} passhash
 * @returns {Promise<HTTPResponse>}
 */
async function login(email: string, passhash: string): Promise<HTTPResponse> {
    let user = new User;

    // Get list of all teams
    const databases = await client.db().admin().listDatabases();
    const globalDatabases = ["global", "admin", "local"];
    const teamDatabases = databases.databases.filter((database: any) => !globalDatabases.includes(database.name.toLowerCase())).map((database: any) => database.name);

    // Find user details by email
    const usersCollection = await client.db("Global").collection("users");
    const foundUser = await usersCollection.findOne({ email: email });
    if (foundUser) {
        user = foundUser;
    }

    // Check user was found
    if (!user._id) {
        return {
            responseCode: 404,
            data: false
        }
    }

    // Check password is correct
    if (user.passhash != passhash) {
        return {
            responseCode: 401,
            data: false
        }
    }

    // Iterate through teams to find which team user belongs to
    for (const teamDatabase of teamDatabases) {
        const usersCollection = await client.db(teamDatabase).collection("users");
        const foundUser = await usersCollection.findOne({ _id: new ObjectId(String(user._id)) });
        if (foundUser) {
            user.teamName = teamDatabase;
            break;
        }
    }

    // Create JWT from user details
    const token = await generateJWT(user);
    
    return {
        responseCode: 200,
        data: token
    }
}

export default login;