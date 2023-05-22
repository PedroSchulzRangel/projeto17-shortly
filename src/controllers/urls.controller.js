import {db} from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function urlsShorten (req, res) {
    const {authorization} = req.headers;
    const {url} = req.body;
    const token = authorization?.replace("Bearer ","");

    if(!token) return res.status(401).send("token inválido");

    try{
        const session = await db.query(`SELECT * FROM sessions 
            WHERE token=$1;`,[token]);

        if(session.rowCount === 0) return res.status(401).send("token inválido");

        const shortUrl = nanoid();

        const userId = session.rows[0].userId;

        await db.query(`INSERT INTO urls
            (url,"shortUrl","userId") VALUES ($1,$2,$3);`,[url,shortUrl,userId]);

        const body = {
            "id": userId,
            "shortUrl": shortUrl
        };

        res.status(201).send(body);

    } catch (error){
        res.status(500).send(error.message);
    }
}