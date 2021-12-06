const { request, response } = require("express");
const { subirArchivo } = require("../helpers");
const { Usuario, Producto } = require('../models');
const path = require('path');
const fs = require('fs');


const cargarArchivo = async(req = request, res = response) => {

    try {
        // txt, md
        // const nombre = await subirArchivo(req.files, ['txt', 'md'], 'textos');
        const nombre = await subirArchivo(req.files, undefined, 'imgs');
        // const nombre = await subirArchivo(req.files, ['txt', 'md'], 'textos');
    
        res.json({
            nombre
        })
    } catch (error) {
        res.status(400).json({error})
    }
}

const actualizarImagen = async(req = request, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo =  await Usuario.findById(id);
            if( !modelo ) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${ id }`
                });
            }

            break;

        case 'productos':
            modelo =  await Producto.findById(id);
            if( !modelo ) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${ id }`
                });
            }

            break;
    
        default: 
            return res.status(500).json( { msg: 'Se me olvidó validar esto' });
    }

    // Limpiar imágenes previas
    if( modelo.img ) {
        // Hay que borrar la imagen del servidor
        const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img );
        if( fs.existsSync( pathImagen ) ) {
            fs.unlinkSync( pathImagen ); // <<<--- Sólo si existe en el servidor la eliminamos
        }
    }

    const nombre = await subirArchivo(req.files, undefined, coleccion);
    modelo.img = nombre;

    await modelo.save();

    res.json(modelo);
}

module.exports = {
    cargarArchivo,
    actualizarImagen
}