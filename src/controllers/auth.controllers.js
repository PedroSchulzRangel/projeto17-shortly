import {db} from "../database/database.connection.js";
import bcrypt from "bcrypt";
import{v4 as uuid} from "uuid";

export async function signUp(req, res) {
    const {name, email, password} = req.body;

    try{
        const emailAlreadyInUse = await db.query(`SELECT * FROM users WHERE email=$1`,[email]);

        if (emailAlreadyInUse.rowCount !== 0) return res.status(409).send("Este email de usuário já está cadastrado");

        const encryptedPassword = bcrypt.hashSync(password, 10);

        await db.query(`INSERT INTO users 
            (name,email,password)
            VALUES ($1,$2,$3)`, [name,email,encryptedPassword]);

        res.sendStatus(201);

    } catch (error){
        res.status(500).send(error.message);
    }
}

export async function signIn (req, res){
    const {email, password} = req.body;

    try{
        const user = await db.query(`SELECT * FROM users WHERE email=$1`,[email]);
        
        if(user.rowCount === 0) return res.status(401).send("Usuário/senha inválidos");

        const isPasswordCorrect = bcrypt.compareSync(password, user.rows[0].password);

        if(!isPasswordCorrect) return res.status(401).send("Usuário/senha inválidos");

        const token = uuid();

        const userId = user.rows[0].id;

        await db.query(`INSERT INTO sessions 
            ("userId",token)
            VALUES ($1,$2)`,[userId, token]);
        
        res.status(200).send({token});

    } catch(error){
        res.status(500).send(error.message);
    }
}