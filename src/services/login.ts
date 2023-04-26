import { client } from "../config/mongodb";
import HTTPResponse from "../interfaces/httpResponse";
import generateJWT from '../services/generateJWT';

async function login(email: string, passhash: string): Promise<HTTPResponse> {

    let user: { _id: {}; fname: string, lname: string, role: string, permissions: { read: boolean; write: boolean; }; email: string; passhash: string } | undefined;
    let teamName = "";

    // Get list of all teams
    const databases = await client.db().admin().listDatabases();
    const globalDatabases = ["admin", "local"];
    const teamDatabases = databases.databases.filter((database: any) => !globalDatabases.includes(database.name.toLowerCase())).map((database: any) => database.name);

    // Iterate through teams to find the user to authenticate.
    for (const teamDatabase of teamDatabases) {
        const usersCollection = await client.db(teamDatabase).collection("users");
        const foundUser = await usersCollection.findOne({ email: email });
        if (foundUser) {
            teamName = teamDatabase;
            user = foundUser;
            break;
        }
    }

    // Check user was found
    if (!user) {
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

    // Create JWT from user details
    const payload = {
        fname: user.fname,
        lname: user.lname,
        teamName: teamName,
        uid: String(user._id),
        email: email
    };
    const token = await generateJWT(payload);
    
    return {
        responseCode: 200,
        data: token
    }
}

export default login;