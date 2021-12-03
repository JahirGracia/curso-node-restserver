const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const validarJWT = async(req = request, res = response, next) => {
    const token = req.header('x-token');

    if( !token ) {
        return res.status(401).json({
            msh: 'No hay token en la petición'
        })
    }

    try {
        
        // const payload = jwt.verify( token, process.env.SECRETORPRIVATEKEY );
        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );
        // console.log(payload);

        // leer el usuario que corresponde al uid
        const usuario = await Usuario.findById(uid);

        if( !usuario ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe en DB'
            })
        }

        // Verificar si el uid tiene estado en true (el que lo quiere borrar)
        if( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario con estado: false'
            })
        }

        req.usuario = usuario;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

}

module.exports = {
    validarJWT
}