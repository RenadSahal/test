const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const conn = require('../dbConnection').promise();

exports.register = async(req,res,next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{

        const [row] = await conn.execute(
            "SELECT `user_Email` FROM `user` WHERE `user_Email`=?",
            [req.body.user_Email]
          );

        if (row.length > 0) {
            return res.status(201).json({
                message: "The E-mail already in use",
            });
        }

        const hashPass = await bcrypt.hash(req.body.user_password, 12);

        const [rows] = await conn.execute('INSERT INTO `user`(`user_name`,`user_password`,`user_Email`,`db_Name`,`host_Name`) VALUES(?,?,?,?,?)',[
            req.body.user_name,
            hashPass,
            req.body.user_Email,
            req.body.db_Name,
            req.body.host_Name
            
        ]);

        if (rows.affectedRows === 1) {
            return res.status(201).json({
                message: "The user has been successfully inserted.",
            });
        }
        
    }catch(err){
        next(err);
    }
}
