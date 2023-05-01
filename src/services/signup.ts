import { client } from "../config/mongodb";
import generateJWT from '../services/generateJWT';
import User from "../classes/user";
import HTTPResponse from "../interfaces/httpResponse";


/**
 * Register a new user with their details.
 * @param {string} fname
 * @param {string} lname
 * @param {string} email
 * @param {string} passhash
 * @returns {Promise<HTTPResponse>}
 */
async function signup(fname: string, lname: string, email: string, passhash: string): Promise<HTTPResponse> {
    const usersCollection = client.db("Global").collection("users");

    // Create new user object
    let user = new User;
    user.fname = fname;
    user.lname = lname;
    user.email = email;
    user.passhash = passhash;

    // Insert user to users collection
    const insertResult = await usersCollection.insertOne({
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        passhash: user.passhash
    });

    // Grab uid from new user document
    user._id = String(insertResult.insertedId);

    // Create JWT from user details
    const token = await generateJWT(user);
    
    return {
        responseCode: 200,
        data: token
    }
}

export default signup;