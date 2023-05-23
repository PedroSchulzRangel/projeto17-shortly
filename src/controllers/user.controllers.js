import {db} from "../database/database.connection.js";

export async function getUsers (req, res) {
    
    const {authorization} = req.headers;

    const token = authorization?.replace("Bearer ","");

    if(!token) return res.status(401).send("token inválido");

    try{
        const session = await db.query(`SELECT * FROM sessions 
            WHERE token=$1;`,[token]);

        if(session.rowCount === 0) return res.status(401).send("token inválido");

        const {userId} = session.rows[0];

        const user_visitCount = await db.query(`SELECT u.id, u.name, 
            SUM(urls."visitCount") AS "visitCount" 
            FROM users u JOIN urls ON u.id=urls."userId"
            WHERE u.id=$1 GROUP BY u.id;`,[userId]);
        
        const urls = await db.query(`SELECT id, "shortUrl", url, "visitCount"
        FROM urls WHERE "userId"=$1;`,[userId]);

        const body = {
            ...user_visitCount.rows[0],
            shortenedUrls: urls.rows
        };

        res.status(200).send(body);

    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function getRanking (req, res) {
    
    try{
        const {rows: resultRanking} = await db.query(`SELECT u.id, u.name,
            COUNT(urls.url) As "linksCount", 
            SUM(urls."visitCount") AS "visitCount"
            FROM users u LEFT JOIN urls ON u.id=urls."userId"
            GROUP BY u.id
            ORDER BY "visitCount" DESC
            LIMIT 10;`);

        res.status(200).send(resultRanking);

    } catch (error){
        res.status(500).send(error.message);
    }
}