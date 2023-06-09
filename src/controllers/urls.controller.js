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

export async function getUrlById (req, res) {
    
    const { id } = req.params;

    try{
        const urlById = await db.query(`SELECT id,"shortUrl",url FROM urls WHERE id=$1;`,[id]);

        if(urlById.rowCount === 0) return res.status(404).send("Não foi possível encontrar a url pelo id informado");

        res.status(200).send(urlById.rows[0]);

    }catch (error){
        res.status(500).send(error.message);
    }
}

export async function openShortUrl (req, res) {
    
    const {shortUrl} = req.params;

    try{
        const resultShortedUrl = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`,[shortUrl]);

        if(resultShortedUrl.rowCount === 0) return res.status(404).send("A url não foi encontrada");

        let {url, visitCount} = resultShortedUrl.rows[0];

        visitCount++;

        await db.query(`UPDATE urls SET "visitCount"=$1 WHERE "shortUrl"=$2;`,[visitCount,shortUrl]);

        res.redirect(url);

    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function deleteUrl(req, res){
    
    const {authorization} = req.headers;
    const {id} = req.params;
    const token = authorization?.replace("Bearer ","");

    if(!token) return res.status(401).send("token inválido");

    try{
        const session = await db.query(`SELECT * FROM sessions 
            WHERE token=$1;`,[token]);

        if(session.rowCount === 0) return res.status(401).send("token inválido");

        const {userId} = session.rows[0];

        const linkWithId = await db.query(`SELECT * FROM urls WHERE id=$1;`,[id]);

        if(linkWithId.rowCount === 0) return res.status(404).send("O link com o id informado não existe");

        const resultUrl = await db.query(`SELECT * FROM urls 
            WHERE "userId"=$1 AND id=$2;`,[userId,id]);

        if(resultUrl.rowCount === 0) return res.sendStatus(401);
        
        await db.query(`DELETE FROM urls WHERE id=$1;`,[id]);

        res.sendStatus(204);

    } catch (error){
        res.status(500).send(error.message);
    }

}